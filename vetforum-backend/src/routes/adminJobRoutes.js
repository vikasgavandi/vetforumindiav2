const express = require('express');
const router = express.Router();
const adminJobController = require('../controllers/adminJobController');
const { requireAdmin } = require('../middleware/adminAuth');
const { authenticateToken } = require('../middleware/auth');

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

module.exports = router;