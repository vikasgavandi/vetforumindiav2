const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function fixQuizSchema() {
  try {
    console.log('--- Database Schema Fix: quiz_questions ---');
    console.log('Testing connection...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Check existing columns
    const columns = await sequelize.query(
      "SHOW COLUMNS FROM `quiz_questions`",
      { type: QueryTypes.SELECT }
    );

    const columnNames = columns.map(c => c.Field);
    console.log('Current columns:', columnNames.join(', '));

    // Ensure optionC and optionD exist
    if (!columnNames.includes('optionC')) {
      console.log('Adding column optionC...');
      await sequelize.query(
        "ALTER TABLE `quiz_questions` ADD COLUMN `optionC` TEXT NULL AFTER `optionB`"
      );
    } else {
      console.log('Modifying column optionC to be NULLABLE...');
      await sequelize.query(
        "ALTER TABLE `quiz_questions` MODIFY COLUMN `optionC` TEXT NULL"
      );
    }

    if (!columnNames.includes('optionD')) {
      console.log('Adding column optionD...');
      await sequelize.query(
        "ALTER TABLE `quiz_questions` ADD COLUMN `optionD` TEXT NULL AFTER `optionC`"
      );
    } else {
      console.log('Modifying column optionD to be NULLABLE...');
      await sequelize.query(
        "ALTER TABLE `quiz_questions` MODIFY COLUMN `optionD` TEXT NULL"
      );
    }

    console.log('Schema fix completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing quiz schema:', error);
    process.exit(1);
  }
}

fixQuizSchema();
