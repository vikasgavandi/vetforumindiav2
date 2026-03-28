import express from 'express';
import * as adminJobController from '../controllers/adminJobController.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Job CRUD routes
router.post('/', adminJobController.createJob);
router.get('/', adminJobController.getAllJobs);
router.get('/:id', adminJobController.getJobById);
router.put('/:id', adminJobController.updateJob);
router.delete('/:id', adminJobController.deleteJob);
router.patch('/:id/toggle-status', adminJobController.toggleJobStatus);

export default router;