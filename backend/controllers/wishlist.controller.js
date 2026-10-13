const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');

async function addToWishlist(req, res) {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const updated = await Customer.findOneAndUpdate(
    { _id: req.user._id, wishlist: { $ne: productId } },
    { $push: { wishlist: productId } },
  );

  if (!updated) {
    return res.status(409).json({ success: false, message: 'Product already in wishlist' });
  }

  return res.status(200).json({ success: true, message: 'Product added to wishlist' });
}

async function getWishlist(req, res) {
  const customer = await Customer.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'name price category image stock',
  });

  const wishlist = customer.wishlist.filter(Boolean);

  return res.status(200).json({
    success: true,
    count: wishlist.length,
    wishlist,
  });
}

async function removeFromWishlist(req, res) {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const updated = await Customer.findOneAndUpdate(
    { _id: req.user._id, wishlist: productId },
    { $pull: { wishlist: productId } },
  );

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Product not in wishlist' });
  }

  return res.status(200).json({ success: true, message: 'Product removed from wishlist' });
}

async function toggleWishlist(req, res) {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const removed = await Customer.findOneAndUpdate(
    { _id: req.user._id, wishlist: productId },
    { $pull: { wishlist: productId } },
  );

  if (removed) {
    return res.status(200).json({ success: true, message: 'Product removed from wishlist', saved: false });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const added = await Customer.findOneAndUpdate(
    { _id: req.user._id, wishlist: { $ne: productId } },
    { $push: { wishlist: productId } },
  );

  if (!added) {
    return res.status(200).json({ success: true, message: 'Product already in wishlist', saved: true });
  }

  return res.status(200).json({ success: true, message: 'Product added to wishlist', saved: true });
}

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
