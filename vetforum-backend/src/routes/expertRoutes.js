import express from 'express';
import { getExperts, getExpertById, createConsultation, getUserConsultations, getMyExpertProfile } from '../controllers/expertController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getExperts);
router.get('/me', authenticateToken, getMyExpertProfile);
router.get('/:id', getExpertById);

// Protected routes
router.post('/consultation', authenticateToken, createConsultation);
router.get('/consultation/my', authenticateToken, getUserConsultations);

export default router;