import { JobVacancy } from '../models/index.js';
import logger from '../middleware/logger.js';
import { Op } from 'sequelize';

// Get all job vacancies
export const getJobVacancies = async (req, res) => {
  try {
    const { page = 1, limit = 10, location, organization } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isActive: true };
    
    // Add filters
    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }
    if (organization) {
      whereClause.organization = { [Op.like]: `%${organization}%` };
    }

    const { count, rows } = await JobVacancy.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
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
export const getJobVacancyById = async (req, res) => {
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