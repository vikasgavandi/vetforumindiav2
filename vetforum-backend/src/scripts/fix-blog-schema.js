const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function fixBlogSchema() {
  try {
    console.log('--- Database Schema Fix: blogs ---');
    console.log('Testing connection...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Modify featuredImage column to LONGTEXT
    console.log('Modifying featuredImage column to LONGTEXT...');
    await sequelize.query(
      "ALTER TABLE `blogs` MODIFY COLUMN `featuredImage` LONGTEXT NULL",
      { type: QueryTypes.RAW }
    );

    console.log('Schema fix completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing blog schema:', error);
    process.exit(1);
  }
}

fixBlogSchema();
