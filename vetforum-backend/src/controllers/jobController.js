const { JobVacancy } = require('../models');
const logger = require('../middleware/logger');

// Get all job vacancies
const getJobVacancies = async (req, res) => {
  try {
    const { page = 1, limit = 10, location, organization } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isActive: true };
    
    // Add filters
    if (location) {
      whereClause.location = { [require('sequelize').Op.iLike]: `%${location}%` };
    }
    if (organization) {
      whereClause.organization = { [require('sequelize').Op.iLike]: `%${organization}%` };
    }

    const jobs = await JobVacancy.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: jobs.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(jobs.count / limit),
        totalItems: jobs.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching job vacancies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job vacancies'
    });
  }
};

// Get job vacancy by ID
const getJobVacancyById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobVacancy.findByPk(id);

    if (!job || !job.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Job vacancy not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    logger.error('Error fetching job vacancy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job vacancy'
    });
  }
};

module.exports = {
  getJobVacancies,
  getJobVacancyById
};