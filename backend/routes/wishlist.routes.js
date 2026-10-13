const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require('../controllers/wishlist.controller');

router.post('/:productId', authMiddleware, asyncHandler(addToWishlist));
router.get('/', authMiddleware, asyncHandler(getWishlist));
router.delete('/:productId', authMiddleware, asyncHandler(removeFromWishlist));
router.patch('/:productId/toggle', authMiddleware, asyncHandler(toggleWishlist));

module.exports = router;
