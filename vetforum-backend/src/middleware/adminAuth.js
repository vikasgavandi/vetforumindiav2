const { User } = require('../models');
const logger = require('./logger');

const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (should be called after authenticateToken)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user details to check admin status
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      logger.warn('Non-admin user attempted to access admin endpoint', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        endpoint: req.originalUrl
      });
      
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    logger.error('Admin authentication error', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { requireAdmin };