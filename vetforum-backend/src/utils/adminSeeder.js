const { User, QuizCard } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../middleware/logger');

const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@vetforumindia.com';
    
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (existingAdmin) {
      logger.info('Admin user already exists');
      return existingAdmin;
    }

    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      mobile: '9999999999',
      state: 'Maharashtra',
      password: 'admin123456',
      isVeterinarian: false,
      isAdmin: true
    });

    logger.info('Admin user created successfully', {
      adminId: adminUser.id,
      email: adminUser.email
    });

    return adminUser;
  } catch (error) {
    logger.error('Error seeding admin user:', error);
    throw error;
  }
};

const seedSampleQuizCards = async () => {
  try {
    const admin = await User.findOne({ where: { isAdmin: true } });
    if (!admin) {
      logger.warn('No admin user found, skipping quiz card seeding');
      return;
    }

    const quizCardsData = [
      {
        title: 'Veterinary Nutrition Fundamentals',
        description: 'Test your knowledge of basic animal nutrition principles and dietary requirements.',
        duration: 30,
        numberOfQuestions: 20,
        createdBy: admin.id,
        isActive: true
      },
      {
        title: 'Small Animal Medicine Quiz',
        description: 'Comprehensive quiz covering small animal diseases, diagnosis, and treatment.',
        duration: 45,
        numberOfQuestions: 25,
        createdBy: admin.id,
        isActive: true
      },
      {
        title: 'Large Animal Surgery Challenge',
        description: 'Advanced quiz on surgical procedures and techniques for large animals.',
        duration: 60,
        numberOfQuestions: 30,
        createdBy: admin.id,
        isActive: true
      },
      {
        title: 'Veterinary Pharmacology Speed Test',
        description: 'Quick-fire questions on veterinary drugs, dosages, and contraindications.',
        duration: 15,
        numberOfQuestions: 15,
        createdBy: admin.id,
        isActive: true
      }
    ];

    for (const quizCardData of quizCardsData) {
      const existingQuizCard = await QuizCard.findOne({ 
        where: { 
          title: quizCardData.title,
          createdBy: admin.id 
        } 
      });
      
      if (!existingQuizCard) {
        await QuizCard.create(quizCardData);
        logger.info(`Quiz card "${quizCardData.title}" seeded successfully`);
      }
    }
  } catch (error) {
    logger.error('Error seeding quiz cards:', error);
    throw error;
  }
};

const seedAdminData = async () => {
  try {
    logger.info('Starting admin data seeding...');
    await seedAdminUser();
    await seedSampleQuizCards();
    logger.info('Admin data seeding completed successfully');
  } catch (error) {
    logger.error('Error in admin data seeding:', error);
    throw error;
  }
};

module.exports = {
  seedAdminUser,
  seedSampleQuizCards,
  seedAdminData
};