const sequelize = require('./src/config/database');
const models = require('./src/models');

async function syncDb() {
  try {
    console.log('Starting DB sync with alter: true...');
    await sequelize.authenticate();
    console.log('Database connected.');
    
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop unique index on questionNumber manually
    try {
      console.log('Attempting to drop unique index on questionNumber...');
      // We need to know the index name. Usually it is 'questionNumber' or 'question_number' or 'quiz_questions_question_number_unique'
      // Let's try to find it first.
      const [indexes] = await sequelize.query('SHOW INDEX FROM quiz_questions');
      const uniqueIndex = indexes.find(idx => idx.Column_name === 'questionNumber' && !idx.Non_unique);
      if (uniqueIndex) {
        console.log(`Dropping index ${uniqueIndex.Key_name}...`);
        await sequelize.query(`DROP INDEX ${uniqueIndex.Key_name} ON quiz_questions`);
      } else {
        console.log('No unique index found on questionNumber.');
      }
    } catch (err) {
      console.warn('Failed to drop index:', err.message);
    }

    console.log('Truncating tables...');
    await sequelize.query('TRUNCATE TABLE quiz_questions');
    await sequelize.query('TRUNCATE TABLE user_quiz_progress');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDb();
