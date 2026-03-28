const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  refundPayment,
  getPaymentStatus
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// User payment routes
router.post('/create-order', authenticateToken, createPaymentOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.post('/failure', authenticateToken, handlePaymentFailure);
router.get('/status/:appointmentId', authenticateToken, getPaymentStatus);

// Admin payment routes
router.post('/refund/:appointmentId', authenticateToken, requireAdmin, refundPayment);

module.exports = router;