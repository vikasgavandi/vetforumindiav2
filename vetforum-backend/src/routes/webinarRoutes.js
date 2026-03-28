import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

import {
  getActiveWebinar,
  getAllWebinars,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  getWebinarRegistrations,
  registerForWebinar
} from '../controllers/webinarController.js';

const router = express.Router();

// ── Public ──────────────────────────────────────────
// Get the currently live webinar (shown to all users)
router.get('/active', getActiveWebinar);

// ── Admin only ───────────────────────────────────────
router.get('/', authenticateToken, requireAdmin, getAllWebinars);
router.post('/', authenticateToken, requireAdmin, createWebinar);
router.put('/:id', authenticateToken, requireAdmin, updateWebinar);
router.delete('/:id', authenticateToken, requireAdmin, deleteWebinar);
router.get('/:id/registrations', authenticateToken, requireAdmin, getWebinarRegistrations);

// ── Authenticated users ──────────────────────────────
router.post('/:id/register', authenticateToken, registerForWebinar);

export default router;
