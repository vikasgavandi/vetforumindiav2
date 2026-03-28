import { Expert, Consultation, User } from '../models/index.js';
import logger from '../middleware/logger.js';

// Get all experts
export const getExperts = async (req, res) => {
  try {
    const experts = await Expert.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: experts
    });
  } catch (error) {
    logger.error('Error fetching experts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experts'
    });
  }
};

// Get expert by ID
export const getExpertById = async (req, res) => {
  try {
    const { id } = req.params;
    const expert = await Expert.findByPk(id);

    if (!expert || !expert.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found'
      });
    }

    res.json({
      success: true,
      data: expert
    });
  } catch (error) {
    logger.error('Error fetching expert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expert'
    });
  }
};

// Create consultation request
export const createConsultation = async (req, res) => {
  try {
    const { expertId, reasonForConsultation } = req.body;
    const userId = req.user.id;

    // Validate expert exists
    const expert = await Expert.findByPk(expertId);
    if (!expert || !expert.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found'
      });
    }

    const consultation = await Consultation.create({
      userId,
      expertId,
      reasonForConsultation
    });

    const consultationWithDetails = await Consultation.findByPk(consultation.id, {
      include: [
        { model: Expert, as: 'expert' },
        { model: User, as: 'user', attributes: { exclude: ['password'] } }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Consultation request created successfully',
      data: consultationWithDetails
    });
  } catch (error) {
    logger.error('Error creating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create consultation request'
    });
  }
};

// Get user consultations
export const getUserConsultations = async (req, res) => {
  try {
    const userId = req.user.id;
    const consultations = await Consultation.findAll({
      where: { userId },
      include: [{ model: Expert, as: 'expert' }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    logger.error('Error fetching user consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultations'
    });
  }
};

// Get current user's expert profile
export const getMyExpertProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const expert = await Expert.findOne({
      where: { userId }
    });

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert profile not found for this user'
      });
    }

    res.json({
      success: true,
      data: expert
    });
  } catch (error) {
    logger.error('Error fetching expert profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expert profile'
    });
  }
};