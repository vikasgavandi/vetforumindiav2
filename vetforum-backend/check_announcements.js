
const { Announcement } = require('./src/models');
const sequelize = require('./src/config/database');

async function checkAnnouncements() {
  try {
    await sequelize.authenticate();
    const announcements = await Announcement.findAll();
    console.log('TOTAL_ANNOUNCEMENTS_COUNT:', announcements.length);
    announcements.forEach(a => {
      console.log(`- ID: ${a.id}, Title: ${a.title}, Active: ${a.isActive}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAnnouncements();
