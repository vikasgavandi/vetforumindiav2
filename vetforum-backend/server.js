const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database and models
const sequelize = require('./src/config/database');

// Import middleware
const setupMiddleware = require('./src/middleware');
// const { generalRateLimit } = require('./src/middleware/rateLimiter');
const logger = require('./src/middleware/logger');

// Import routes
const mainRoutes = require('./src/routes');

// Import utils
const { seedQuizQuestions } = require('./src/utils/quizSeeder');
const { seedAllData } = require('./src/utils/dataSeeder');
const { seedAdminUser, seedSampleQuizCards } = require('./src/utils/adminSeeder');
const { seedSampleBlogs } = require('./src/utils/blogSeeder');
const { seedDoctorAvailability } = require('./src/utils/appointmentSeeder');

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Ensure logs and uploads directories exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const uploadsBlogsDir = path.join(process.cwd(), 'uploads', 'blogs');
    if (!fs.existsSync(uploadsBlogsDir)) {
      fs.mkdirSync(uploadsBlogsDir, { recursive: true });
    }

    const uploadsUsersDir = path.join(process.cwd(), 'uploads', 'users');
    if (!fs.existsSync(uploadsUsersDir)) {
      fs.mkdirSync(uploadsUsersDir, { recursive: true });
    }

    const uploadsExpertsDir = path.join(process.cwd(), 'uploads', 'experts');
    if (!fs.existsSync(uploadsExpertsDir)) {
      fs.mkdirSync(uploadsExpertsDir, { recursive: true });
    }

    const uploadsDocumentsDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadsDocumentsDir)) {
      fs.mkdirSync(uploadsDocumentsDir, { recursive: true });
    }


    // Test database connection with timeout
    let dbConnected = false;
    try {
      await Promise.race([
        sequelize.authenticate(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        )
      ]);
      dbConnected = true;
      logger.info(`Database connection established successfully`);
      logger.info(`Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);

      // Sync database models (do NOT alter existing tables to avoid key conflicts)
      // Schema should be managed via DATABASE_SCHEMA.sql  
      await sequelize.sync({ force: false, alter: false });
      logger.info(`Database models synchronized - using existing schema`);

      // Seed data if in development mode
      if (process.env.NODE_ENV === 'development') {
        try {
          // Admin data first (creates QuizCards)
          await seedAdminUser();
          logger.info(`Admin user seeded successfully`);

          await seedSampleQuizCards();
          logger.info(`Quiz cards seeded successfully`);

          // Then questions (needs QuizCards)
          await seedQuizQuestions();
          logger.info(`Quiz questions seeded successfully`);

          await seedAllData();
          logger.info(`Sample data seeded successfully`);

          await seedSampleBlogs();
          logger.info(`Blog data seeded successfully`);

          await seedDoctorAvailability();
          logger.info(`Doctor availability seeded successfully`);
        } catch (error) {
          logger.warn(`Data seeding failed or data already exists`, {
            error: error.message
          });
        }
      }
    } catch (dbError) {
      logger.warn(`Database connection failed (${dbError.message}), running in offline mode`);
      logger.warn(`⚠️  DATABASE OFFLINE MODE - API will work with mock/in-memory data`);
      logger.warn(`💡 Troubleshooting:`);
      logger.warn(`   - Check if MySQL is running: ps aux | grep mysql`);
      logger.warn(`   - Verify credentials in .env: DB_HOST=${process.env.DB_HOST}, DB_PORT=${process.env.DB_PORT}, DB_NAME=${process.env.DB_NAME}`);
      logger.warn(`   - Try running: node setup-database.js`);
      // Skip seeding when database is unavailable
    }

    // Create Express app
    logger.info(`Creating Express app`);
    const app = express();

    // Configure trust proxy based on environment
    // In production (behind Nginx), trust proxy headers for proper IP detection
    // In development, disable to prevent IP spoofing
    app.set('trust proxy', process.env.NODE_ENV === 'production');

    // Enhanced CORS configuration to handle specific origins and credentials
    const corsOptions = {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      exposedHeaders: ['Content-Length', 'Content-Range'],
      credentials: false,
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    app.use(cors(corsOptions));

    // Handle preflight requests for all routes
    app.options('*', cors(corsOptions));

    // Additional CORS headers for all responses
    app.use((req, res, next) => {
      // Set CORS headers to allow any origin
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }

      next();
    });
    // Setup basic middleware
    logger.info(`Setting up middleware`);
    setupMiddleware(app);

    // Apply general rate limiting
    logger.info(`Applying rate limiting`);
    // app.use(generalRateLimit);

    // Serve uploaded files statically
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // API routes with versioning
    logger.info(`Setting up routes`);
    app.use('/api/vetforumindia/v1', mainRoutes);

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Global error handler (must be last)
    app.use((err, req, res, next) => {
      logger.error(`Unhandled error`, {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV === 'development';

      res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
      });
    });

    // Start server
    app.listen(PORT, () => {
      // logger.info(`Server (PID: ${process.pid}) is running on port ${PORT}`);
      // logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      // logger.info(`API available at http://localhost:${PORT}/api/vetforumindia/v1`);
      // logger.info(`Health check available at http://localhost:${PORT}/api/vetforumindia/v1/health`);

      console.log(`Server (PID: ${process.pid}) is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API available at http://localhost:${PORT}/api/vetforumindia/v1`);
      console.log(`Health check available at http://localhost:${PORT}/api/vetforumindia/v1/health`);
    });

    return app;

  } catch (error) {
    logger.error(`Failed to start server`, {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Promise Rejection`, {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception`, {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = { sequelize };