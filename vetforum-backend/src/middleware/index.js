import cors from 'cors';
import compression from 'compression';
import express from 'express';
import logger from './logger.js';

// Parse CORS origins from environment variable (comma-separated)
const corsOrigins = ['*'];

const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  exposedHeaders: ['Content-Length', 'Content-Range']
};

const setupMiddleware = (app) => {
  // Basic middleware
  app.use(compression());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Handle preflight requests for all routes
  app.options('*', cors(corsOptions));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info('Incoming request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next();
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });

    res.status(500).json({
      error: 'Internal server error'
    });
  });
};

export default setupMiddleware;