const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
} = require('../controllers/order.controller');

router.post('/create-payment-order', authMiddleware, asyncHandler(createPaymentOrder));
router.post('/verify-payment', authMiddleware, asyncHandler(verifyPayment));
router.get('/admin/all', authMiddleware, adminMiddleware, asyncHandler(getAllOrdersAdmin));
router.get('/', authMiddleware, asyncHandler(getOrders));
router.get('/:id', authMiddleware, asyncHandler(getOrderById));
router.patch('/:id/status', authMiddleware, adminMiddleware, asyncHandler(updateOrderStatus));

module.exports = router;
