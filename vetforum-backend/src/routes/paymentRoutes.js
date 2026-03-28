import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  refundPayment,
  getPaymentStatus
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// User payment routes
router.post('/create-order', authenticateToken, createPaymentOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.post('/failure', authenticateToken, handlePaymentFailure);
router.get('/status/:appointmentId', authenticateToken, getPaymentStatus);

// Admin payment routes
router.post('/refund/:appointmentId', authenticateToken, requireAdmin, refundPayment);

export default router;