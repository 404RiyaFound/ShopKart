const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  register,
  login,
  getMe,
  logout,
  changePassword,
} = require('../controllers/customer.controller');

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

router.post('/register', asyncHandler(register));
router.post('/login', loginLimiter, asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(getMe));
router.post('/logout', authMiddleware, asyncHandler(logout));
router.patch('/change-password', authMiddleware, asyncHandler(changePassword));

module.exports = router;
