const { User } = require('./src/models');
const logger = require('./src/middleware/logger');

async function resetAdminPassword() {
  const adminEmail = 'admin@vetforumindia.com';
  const newPassword = 'Admin@123';

  try {
    console.log(`🔍 Finding admin user with email: ${adminEmail}...`);
    const adminUser = await User.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      console.log('❌ Admin user not found in the database.');
      console.log('💡 Note: If you haven\'t run setup-database.js, the user might not exist yet.');
      process.exit(1);
    }

    console.log('🔓 Updating password and ensuring admin status...');
    // Hooks in the User model will handle bcrypt hashing
    adminUser.password = newPassword;
    adminUser.isAdmin = true;
    adminUser.approvalStatus = 'approved';
    
    await adminUser.save();

    console.log('✅ Admin password reset successfully!');
    console.log('-----------------------------------');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log('-----------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
