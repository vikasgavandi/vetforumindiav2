const { sequelize } = require('../src/models');
const { createTestUsers } = require('../src/utils/testUserSeeder');

const seedTestData = async () => {
  try {
    console.log('🌱 Starting test data seeding...');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✓ Database synced with force');
    
    // Create test users and data
    await createTestUsers();
    
    console.log('✅ Test data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
};

seedTestData();