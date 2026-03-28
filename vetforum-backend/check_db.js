const { User, Expert } = require('./src/models');
const sequelize = require('./src/config/database');

async function checkUser() {
  try {
    await sequelize.authenticate();
    const email = 'expert_verified@vetforumindia.com';
    const user = await User.findOne({ where: { email } });
    if (user) {
      console.log('USER_FOUND:', JSON.stringify(user.toJSON(), null, 2));
      const expert = await Expert.findOne({ where: { userId: user.id } });
      if (expert) {
        console.log('EXPERT_FOUND:', JSON.stringify(expert.toJSON(), null, 2));
      } else {
        console.log('EXPERT_NOT_FOUND');
      }
    } else {
      console.log('USER_NOT_FOUND');
    }
    
    // Also check for 'test_verify@vetforumindia.com' from previous attempt
    const user2 = await User.findOne({ where: { email: 'test_verify@vetforumindia.com' } });
    if (user2) {
      console.log('USER2_FOUND:', user2.email);
    }
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    process.exit();
  }
}

checkUser();
