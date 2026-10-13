const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');

function cleanCart(cart) {
  return cart.filter((item) => item.product);
}

async function tryIncrementCartItem(userId, productId, stock) {
  return Customer.findOneAndUpdate(
    {
      _id: userId,
      cart: { $elemMatch: { product: productId, quantity: { $lt: stock } } },
    },
    { $inc: { 'cart.$[item].quantity': 1 } },
    { new: true, arrayFilters: [{ 'item.product': productId }] },
  ).populate('cart.product');
}

async function addToCart(req, res) {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  let customer = await tryIncrementCartItem(req.user._id, productId, product.stock);
  if (customer) {
    return res.status(200).json({ success: true, message: 'Cart updated', cart: cleanCart(customer.cart) });
  }

  const existingItem = await Customer.exists({ _id: req.user._id, 'cart.product': productId });
  if (existingItem) {
    customer = await tryIncrementCartItem(req.user._id, productId, product.stock);
    if (customer) {
      return res.status(200).json({ success: true, message: 'Cart updated', cart: cleanCart(customer.cart) });
    }
    return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
  }

  if (product.stock < 1) {
    return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
  }

  customer = await Customer.findOneAndUpdate(
    { _id: req.user._id, 'cart.product': { $ne: productId } },
    { $push: { cart: { product: productId, quantity: 1 } } },
    { new: true },
  ).populate('cart.product');

  if (!customer) {
    customer = await tryIncrementCartItem(req.user._id, productId, product.stock);
  }

  if (!customer) {
    customer = await Customer.findById(req.user._id).populate('cart.product');
  }

  return res.status(200).json({ success: true, message: 'Cart updated', cart: cleanCart(customer.cart) });
}

async function getCart(req, res) {
  const customer = await Customer.findById(req.user._id).populate('cart.product');
  return res.status(200).json({ success: true, cart: cleanCart(customer.cart) });
}

async function updateQuantity(req, res) {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  if (typeof quantity !== 'number' || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be a number of at least 1' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
  }

  const customer = await Customer.findOneAndUpdate(
    { _id: req.user._id, 'cart.product': productId },
    { $set: { 'cart.$.quantity': quantity } },
    { new: true },
  ).populate('cart.product');

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Product not in cart' });
  }

  return res.status(200).json({ success: true, message: 'Cart updated', cart: cleanCart(customer.cart) });
}

async function removeFromCart(req, res) {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const customer = await Customer.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { cart: { product: productId } } },
    { new: true },
  ).populate('cart.product');

  return res.status(200).json({ success: true, message: 'Product removed from cart', cart: cleanCart(customer.cart) });
}

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
};
