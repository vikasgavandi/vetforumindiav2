const { sequelize } = require('./src/models');

const dropIndex = async () => {
  try {
    await sequelize.query('ALTER TABLE post_interactions DROP INDEX post_interactions_user_id_post_id_type;');
    console.log('Index dropped successfully');
  } catch (error) {
    console.error('Error dropping index:', error);
  } finally {
    process.exit(0);
  }
};

dropIndex();