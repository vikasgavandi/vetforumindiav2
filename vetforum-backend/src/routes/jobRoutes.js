const express = require('express');
const { getJobVacancies, getJobVacancyById } = require('../controllers/jobController');

const router = express.Router();

// Public routes
router.get('/', getJobVacancies);
router.get('/:id', getJobVacancyById);

module.exports = router;