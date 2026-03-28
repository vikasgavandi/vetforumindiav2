import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { 
  getAnnouncements, 
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement 
} from '../controllers/announcementController.js';

const router = express.Router();

// Public routes
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createAnnouncement);
router.put('/:id', authenticateToken, requireAdmin, updateAnnouncement);
router.delete('/:id', authenticateToken, requireAdmin, deleteAnnouncement);

export default router;