import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function fixQuizSchema() {
  try {
    console.log('Starting quiz schema fix...');

    // Add quizCardId to quizzes table if it doesn't exist
    await sequelize.query(`
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS quizCardId INT,
      ADD FOREIGN KEY IF NOT EXISTS (quizCardId) REFERENCES quiz_cards(id) ON DELETE CASCADE
    `);

    // Add quizCardId to user_quiz_progress table if it doesn't exist
    await sequelize.query(`
      ALTER TABLE user_quiz_progress 
      ADD COLUMN IF NOT EXISTS quizCardId INT,
      ADD FOREIGN KEY IF NOT EXISTS (quizCardId) REFERENCES quiz_cards(id) ON DELETE CASCADE
    `);

    console.log('Quiz schema fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing quiz schema:', error);
    process.exit(1);
  }
}

fixQuizSchema();
export { fixQuizSchema };
