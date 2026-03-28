import jwt from 'jsonwebtoken';
import logger from './logger.js';
import { User } from '../models/index.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isVeterinarian: user.isVeterinarian
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Access attempt without token', { ip: req.ip, url: req.url });
      return res.status(401).json({
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      logger.warn('Access attempt with invalid user token', {
        userId: decoded.id,
        ip: req.ip,
        url: req.url
      });
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    // Add user to request object
    req.user = user.toSafeJSON();

    // Update lastActiveAt (with 1 minute throttle to avoid too many DB writes)
    const now = new Date();
    if (!user.lastActiveAt || (now - new Date(user.lastActiveAt)) > 60000) {
      await user.update({ lastActiveAt: now });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token', { ip: req.ip, url: req.url });
      return res.status(401).json({
        error: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      logger.warn('Expired JWT token', { ip: req.ip, url: req.url });
      return res.status(401).json({
        error: 'Token expired'
      });
    } else {
      logger.error('Token authentication error', {
        error: error.message,
        ip: req.ip,
        url: req.url
      });
      return res.status(500).json({
        error: 'Authentication error'
      });
    }
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user.toSafeJSON();
      }
    }
    next();
  } catch (error) {
    // For optional auth, we don't fail if token is invalid
    logger.debug('Optional auth failed, continuing without user', {
      error: error.message,
      ip: req.ip,
      url: req.url
    });
    next();
  }
};