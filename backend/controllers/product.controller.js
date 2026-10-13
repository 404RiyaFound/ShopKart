const mongoose = require('mongoose');
const Product = require('../models/product.model');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

async function createProduct(req, res) {
  const name = normalizeString(req.body.name);
  const description = normalizeString(req.body.description);
  const category = normalizeString(req.body.category);
  const image = normalizeString(req.body.image);
  const { price, stock } = req.body;

  if (!name || !description || !category || !image || price === undefined || stock === undefined) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (price <= 0) {
    return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
  }

  if (stock < 0) {
    return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
  }

  const product = await Product.create({ name, description, price, category, image, stock });

  return res.status(201).json({ success: true, product });
}

async function getProducts(req, res) {
  const { search, category, sort } = req.query;
  const filter = {};

  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: 'i' };
  }

  if (category) {
    filter.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
  }

  let query = Product.find(filter);

  if (sort === 'price_asc') {
    query = query.sort({ price: 1 });
  } else if (sort === 'price_desc') {
    query = query.sort({ price: -1 });
  }

  const products = await query;

  return res.status(200).json({ success: true, count: products.length, products });
}

async function getProductById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  return res.status(200).json({ success: true, product });
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};
