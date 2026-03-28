import express from 'express';
import {
  createQuizCard,
  getQuizCards,
  getQuizCardById,
  updateQuizCard,
  deleteQuizCard,
  getQuizLeaderboard,
  getQuizStatistics,
  getPendingUsers,
  approveUser,
  rejectUser,
  getUserStats,
  getAllUsers,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  promoteToExpert
} from '../controllers/adminController.js';
import {
  createBlog as adminCreateBlog,
  getBlogs as adminGetBlogs,
  getBlogById as adminGetBlogById,
  updateBlog as adminUpdateBlog,
  deleteBlog as adminDeleteBlog
} from '../controllers/blogController.js';
import {
  getDoctorAppointments,
  rescheduleAppointment,
  completeAppointment
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import adminJobRoutes from './adminJobRoutes.js';
import { DoctorAvailability } from '../models/index.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// User Verification
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/users/pending', getPendingUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);

// Job Management
router.use('/jobs', adminJobRoutes);

// Quiz Card CRUD operations
router.post('/quiz-cards', createQuizCard);
router.get('/quiz-cards', getQuizCards);
router.get('/quiz-cards/:id', getQuizCardById);
router.put('/quiz-cards/:id', updateQuizCard);
router.delete('/quiz-cards/:id', deleteQuizCard);

// Quiz Analytics
router.get('/quiz-cards/:quizCardId/leaderboard', getQuizLeaderboard);
router.get('/quiz-cards/:quizCardId/statistics', getQuizStatistics);

// Blog Management (Admin can manage all blogs)
router.post('/blogs', adminCreateBlog);
router.get('/blogs', adminGetBlogs);
router.get('/blogs/:id', adminGetBlogById);
router.put('/blogs/:id', adminUpdateBlog);
router.delete('/blogs/:id', adminDeleteBlog);

// Doctor Management
router.get('/doctors', getAllDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Promote an approved vet to Expert (Admin explicitly assigns B, C role)
// Body: { email, designation?, specialization?, yearsOfExperience?, consultationFee?, bio?, qualification? }
router.post('/doctors/promote', promoteToExpert);

// Doctor Availability Management
// Set Doctor Availability
router.post('/doctors/:expertId/availability', async (req, res) => {
  try {
    const { expertId } = req.params;
    const { dayOfWeek, startTime, endTime, consultationFee } = req.body;

    const availability = await DoctorAvailability.create({
      expertId,
      dayOfWeek,
      startTime,
      endTime,
      consultationFee
    });

    res.status(201).json({
      success: true,
      message: 'Doctor availability set successfully',
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set availability'
    });
  }
});

// Update Doctor Availability
router.put('/doctors/availability/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const availability = await DoctorAvailability.findByPk(id);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    await availability.update(updateData);

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update availability'
    });
  }
});

export default router;