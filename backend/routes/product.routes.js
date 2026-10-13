const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  createProduct,
  getProducts,
  getProductById,
} = require('../controllers/product.controller');

router.post('/', authMiddleware, adminMiddleware, asyncHandler(createProduct));
router.get('/', asyncHandler(getProducts));
router.get('/:id', asyncHandler(getProductById));

module.exports = router;
