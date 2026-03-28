import express from 'express';

// Import route modules
import authRoutes from './authRoutes.js';
import documentRoutes from './documentRoutes.js';
import quizRoutes from './quizRoutes.js';
import expertRoutes from './expertRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import jobRoutes from './jobRoutes.js';
import postRoutes from './postRoutes.js';
import blogRoutes from './blogRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import adminRoutes from './adminRoutes.js';
import webinarRoutes from './webinarRoutes.js';

// Create main router
const router = express.Router();

// API versioning structure
// Base path: /api/vetforumindia/v1

// Mount authentication routes
router.use('/authentication', authRoutes);

// Mount document routes
router.use('/documents', documentRoutes);

// Mount quiz routes
router.use('/quiz', quizRoutes);

// Mount expert/consultation routes
router.use('/experts', expertRoutes);

// Mount announcement routes
router.use('/announcements', announcementRoutes);

// Mount job vacancy routes
router.use('/jobs', jobRoutes);

// Mount post routes
router.use('/posts', postRoutes);

// Mount blog routes
router.use('/blogs', blogRoutes);

// Mount appointment routes
router.use('/appointments', appointmentRoutes);

// Mount payment routes
router.use('/payments', paymentRoutes);

// Mount admin routes
router.use('/admin', adminRoutes);

// Mount webinar routes
router.use('/webinars', webinarRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: 'v1'
  });
});

// API info route
router.get('/', (req, res) => {
  res.json({
    name: 'Vet Forum India API',
    version: 'v1',
    description: 'Backend API for Vet Forum India application',
    endpoints: {
      authentication: '/authentication',
      documents: '/documents',
      quiz: '/quiz',
      experts: '/experts',
      announcements: '/announcements',
      jobs: '/jobs',
      posts: '/posts',
      blogs: '/blogs',
      appointments: '/appointments',
      payments: '/payments',
      admin: '/admin',
      health: '/health'
    }
  });
});

export default router;