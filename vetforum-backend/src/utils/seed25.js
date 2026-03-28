import bcrypt from 'bcryptjs';
import { User, Expert, Blog } from '../models/index.js';

export const seed25 = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [];
    for (let i = 1; i <= 25; i++) {
      users.push({
        firstName: `Vet${i}`,
        lastName: `Expert${i}`,
        email: `vet${i}@example.com`,
        mobile: `123456789${i}`.substring(0, 15),
        state: 'Maharashtra',
        password: hashedPassword,
        designation: `General Practitioner ${i}`,
        specialization: 'General Medicine',
        yearsOfExperience: i,
        qualification: 'BVSc & AH',
        isVeterinarian: true,
        approvalStatus: 'approved'
      });
    }

    for (const userData of users) {
      await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
    }

    console.log('25 test users seeded successfully');
  } catch (error) {
    console.error('Error seeding 25 test users:', error);
  }
};
