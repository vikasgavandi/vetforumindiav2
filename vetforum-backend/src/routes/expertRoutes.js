const express = require('express');
const { getExperts, getExpertById, createConsultation, getUserConsultations, getMyExpertProfile } = require('../controllers/expertController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getExperts);
router.get('/me', authenticateToken, getMyExpertProfile);
router.get('/:id', getExpertById);

// Protected routes
router.post('/consultation', authenticateToken, createConsultation);
router.get('/consultation/my', authenticateToken, getUserConsultations);

module.exports = router;