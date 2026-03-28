import bcrypt from 'bcryptjs';
import { User, Expert, Quiz, Announcement, JobVacancy, Blog } from '../models/index.js';
import logger from '../middleware/logger.js';

export const seedTestUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        firstName: 'Vet',
        lastName: 'Specialist',
        email: 'specialist@example.com',
        mobile: '1234567891',
        password: hashedPassword,
        designation: 'Senior Veterinary Surgeon',
        specialization: 'Equine Surgery',
        yearsOfExperience: 8,
        qualification: 'MVSc (Surgery)',
        isVeterinarian: true,
        approvalStatus: 'approved'
      },
      {
        firstName: 'Vet',
        lastName: 'Consultant',
        email: 'consultant@example.com',
        mobile: '1234567892',
        password: hashedPassword,
        designation: 'Small Animal Consultant',
        specialization: 'Internal Medicine',
        yearsOfExperience: 5,
        qualification: 'MVSc (Medicine)',
        isVeterinarian: true,
        approvalStatus: 'approved'
      },
      {
        firstName: 'Vet',
        lastName: 'Student',
        email: 'student@example.com',
        mobile: '1234567893',
        password: hashedPassword,
        isVeterinarian: true,
        approvalStatus: 'approved'
      }
    ];

    for (const userData of users) {
      await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
    }

    logger.info('Test users seeded successfully');
  } catch (error) {
    logger.error('Error seeding test users:', error);
  }
};