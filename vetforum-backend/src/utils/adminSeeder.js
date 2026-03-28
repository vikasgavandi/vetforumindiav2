import { User, QuizCard } from '../models/index.js';
import bcrypt from 'bcryptjs';
import logger from '../middleware/logger.js';

export const seedAdminUser = async () => {
  try {
    // Check if admin exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vetforumindia.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ where: { email: adminEmail } });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        approvalStatus: 'approved'
      });
      logger.info('Admin user created successfully');
    } else {
      // Ensure existing admin has correct approval
      await admin.update({
        isAdmin: true,
        approvalStatus: 'approved'
      });
      logger.info('Admin user already exists, updated permissions');
    }

    return admin;
  } catch (error) {
    logger.error('Error seeding admin user:', error);
    throw error;
  }
};

export const seedSampleQuizCards = async () => {
  try {
    // Get an admin user to be the creator
    const admin = await User.findOne({ where: { isAdmin: true } });
    if (!admin) return;

    const sampleCards = [
      {
        title: 'Small Animal Medicine Basics',
        description: 'Test your knowledge on common small animal medical conditions and treatments.',
        category: 'Small Animal',
        difficulty: 'Beginner',
        duration: 20,
        price: 0,
        isActive: true,
        createdBy: admin.id,
        numberOfQuestions: 3,
        status: 'ongoing'
      },
      {
        title: 'Advanced Equine Surgery',
        description: 'Challenging quiz for equine specialists and surgery residents.',
        category: 'Equine',
        difficulty: 'Advanced',
        duration: 30,
        price: 499,
        isActive: true,
        createdBy: admin.id,
        numberOfQuestions: 3,
        status: 'ongoing'
      },
      {
        title: 'Veterinary Pharmacology Review',
        description: 'Comprehensive review of essential medications and dosages.',
        category: 'General',
        difficulty: 'Intermediate',
        duration: 25,
        price: 199,
        isActive: true,
        createdBy: admin.id,
        numberOfQuestions: 3,
        status: 'ongoing'
      }
    ];

    for (const card of sampleCards) {
      const [record, created] = await QuizCard.findOrCreate({
        where: { title: card.title },
        defaults: card
      });
      if (created) {
        logger.info(`Quiz card created: ${card.title}`);
      }
    }
  } catch (error) {
    logger.error('Error seeding sample quiz cards:', error);
    throw error;
  }
};