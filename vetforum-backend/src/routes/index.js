const express = require('express');

// Import route modules
const authRoutes = require('./authRoutes');
const documentRoutes = require('./documentRoutes');
const quizRoutes = require('./quizRoutes');
const expertRoutes = require('./expertRoutes');
const announcementRoutes = require('./announcementRoutes');
const jobRoutes = require('./jobRoutes');
const postRoutes = require('./postRoutes');
const blogRoutes = require('./blogRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');
const webinarRoutes = require('./webinarRoutes');

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

module.exports = router;