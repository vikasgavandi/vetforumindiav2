const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

const { 
  getAnnouncements, 
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement 
} = require('../controllers/announcementController');

const router = express.Router();

// Public routes
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createAnnouncement);
router.put('/:id', authenticateToken, requireAdmin, updateAnnouncement);
router.delete('/:id', authenticateToken, requireAdmin, deleteAnnouncement);

module.exports = router;