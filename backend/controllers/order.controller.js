const mongoose = require('mongoose');
const crypto = require('crypto');
const Customer = require('../models/customer.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const razorpay = require('../config/razorpay');

const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^\d{6}$/;

function normalize(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function validateShippingAddress(raw = {}) {
  const shippingAddress = {
    fullName: normalize(raw.fullName),
    phone: normalize(raw.phone),
    addressLine1: normalize(raw.addressLine1),
    city: normalize(raw.city),
    state: normalize(raw.state),
    pincode: normalize(raw.pincode),
  };

  const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

  if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
    return { error: 'All shipping address fields are required' };
  }

  if (!PHONE_REGEX.test(phone)) {
    return { error: 'Enter a valid 10-digit phone number' };
  }

  if (!PINCODE_REGEX.test(pincode)) {
    return { error: 'Pincode must contain 6 digits' };
  }

  return { shippingAddress };
}

async function createPaymentOrder(req, res) {
  const { error, shippingAddress } = validateShippingAddress(req.body.shippingAddress);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const customer = await Customer.findById(req.user._id).populate('cart.product');
  const cartItems = customer.cart.filter((item) => item.product);

  if (cartItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.product.name}`,
      });
    }
  }

  const items = cartItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.image,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    totalAmount,
    paymentStatus: 'PENDING',
    status: 'PENDING_PAYMENT',
  });

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: order._id.toString(),
    });
  } catch (err) {
    await Order.findByIdAndDelete(order._id);
    throw err;
  }

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return res.status(201).json({
    success: true,
    shopKartOrderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
}

async function verifyPayment(req, res) {
  const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!mongoose.isValidObjectId(shopKartOrderId)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification details' });
  }

  const order = await Order.findById(shopKartOrderId);

  if (!order || !order.user.equals(req.user._id)) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (order.razorpayOrderId !== razorpay_order_id) {
    return res.status(400).json({ success: false, message: 'Order mismatch' });
  }

  if (order.paymentStatus === 'PAID') {
    return res.status(200).json({ success: true, message: 'Payment already verified', order });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    order.paymentStatus = 'FAILED';
    await order.save();
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }

  order.paymentStatus = 'PAID';
  order.status = 'PLACED';
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();

  // Payment is already captured, so a stock shortfall can't reject the order;
  // the conditional update just keeps stock from going negative.
  for (const item of order.items) {
    const updated = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
    );
    if (updated.modifiedCount === 0) {
      console.warn(`Stock shortfall for product ${item.product} on order ${order._id}`);
    }
  }

  await Customer.findByIdAndUpdate(req.user._id, { cart: [] });

  return res.status(200).json({ success: true, message: 'Payment verified', order });
}

async function getOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, orders });
}

async function getAllOrdersAdmin(req, res) {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'fullName email');
  return res.status(200).json({ success: true, orders });
}

async function getOrderById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  const order = await Order.findById(id);

  if (!order || !order.user.equals(req.user._id)) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  return res.status(200).json({ success: true, order });
}

const STATUS_FLOW = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

// Admin-only status-progression endpoint for the bonus challenge. Updates any
// order (not just the caller's own) since this is a store-staff action, not a
// customer one — gated by adminMiddleware at the route level.
async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  if (!STATUS_FLOW.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextIndex = STATUS_FLOW.indexOf(status);

  if (nextIndex <= currentIndex) {
    return res.status(400).json({ success: false, message: 'Status can only move forward' });
  }

  order.status = status;
  await order.save();

  return res.status(200).json({ success: true, message: 'Order status updated', order });
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
};
