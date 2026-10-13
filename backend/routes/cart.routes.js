const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} = require('../controllers/cart.controller');

router.post('/:productId', authMiddleware, asyncHandler(addToCart));
router.get('/', authMiddleware, asyncHandler(getCart));
router.patch('/:productId', authMiddleware, asyncHandler(updateQuantity));
router.delete('/:productId', authMiddleware, asyncHandler(removeFromCart));

module.exports = router;
