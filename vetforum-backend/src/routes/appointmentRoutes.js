import express from 'express';
import {
  getDoctorAvailability,
  bookAppointment,
  processPayment,
  getUserAppointments,
  getDoctorAppointments,
  getMyDoctorAppointments,
  rescheduleAppointment,
  completeAppointment,
  addDoctorAvailability,
  deleteDoctorAvailability,
  getAppointmentById
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/doctors/:expertId/availability', getDoctorAvailability);

// Protected routes - User
router.post('/book', authenticateToken, bookAppointment);
router.post('/payment', authenticateToken, processPayment);
router.get('/user', authenticateToken, getUserAppointments);
router.get('/:appointmentId', authenticateToken, getAppointmentById);

// Protected routes - Expert
router.post('/doctors/:expertId/availability', authenticateToken, addDoctorAvailability);
router.delete('/doctors/availability/:id', authenticateToken, deleteDoctorAvailability);

// Protected routes - Doctor/Admin
router.get('/doctors/me', authenticateToken, getMyDoctorAppointments);
router.get('/doctors/:expertId', authenticateToken, getDoctorAppointments);
router.put('/:appointmentId/reschedule', authenticateToken, rescheduleAppointment);
router.put('/:appointmentId/complete', authenticateToken, completeAppointment);

export default router;