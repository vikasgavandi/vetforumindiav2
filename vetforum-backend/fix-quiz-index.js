const sequelize = require('./src/config/database');

async function fixIndex() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Find the index name for questionNumber in quiz_questions
    const [indexes] = await sequelize.query('SHOW INDEX FROM quiz_questions');
    const uniqueIndex = indexes.find(idx => idx.Column_name === 'questionNumber' && !idx.Non_unique);

    if (uniqueIndex) {
      console.log(`Found unique index: ${uniqueIndex.Key_name}. Dropping it...`);
      await sequelize.query(`ALTER TABLE quiz_questions DROP INDEX ${uniqueIndex.Key_name}`);
      console.log('Index dropped successfully.');
    } else {
      console.log('No single-column unique index found on questionNumber.');
    }

    // 2. The composite index will be created by sequelize.sync({ alter: true }) in the main app,
    // but let's do it manually here to be sure.
    try {
      console.log('Adding composite unique index (quizCardId, questionNumber)...');
      await sequelize.query('ALTER TABLE quiz_questions ADD UNIQUE KEY `quiz_questions_quiz_card_id_question_number_unique` (`quizCardId`, `questionNumber`)');
      console.log('Composite index added successfully.');
    } catch (err) {
      if (err.message.includes('Duplicate key name')) {
        console.log('Composite index already exists.');
      } else {
        throw err;
      }
    }

    console.log('Fix applied successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing index:', error);
    process.exit(1);
  }
}

fixIndex();
