import express from 'express';
import { getJobVacancies, getJobVacancyById } from '../controllers/jobController.js';

const router = express.Router();

// Public routes
router.get('/', getJobVacancies);
router.get('/:id', getJobVacancyById);

export default router;