const express = require('express');
const {
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
} = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

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

module.exports = router;