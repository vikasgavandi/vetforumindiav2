import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function fixBlogSchema() {
  try {
    console.log('Starting blog schema fix...');

    // Add excerpt and category to blogs table if it doesn't exist
    await sequelize.query(`
      ALTER TABLE blogs 
      ADD COLUMN IF NOT EXISTS excerpt TEXT,
      ADD COLUMN IF NOT EXISTS category VARCHAR(255)
    `);

    // Add isPublished and publishedAt to blogs table if it doesn't exist
    await sequelize.query(`
      ALTER TABLE blogs 
      ADD COLUMN IF NOT EXISTS isPublished BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS publishedAt DATETIME
    `);

    console.log('Blog schema fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing blog schema:', error);
    process.exit(1);
  }
}

fixBlogSchema();
export { fixBlogSchema };
