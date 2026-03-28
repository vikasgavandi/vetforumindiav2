import { Quiz, QuizCard } from '../models/index.js';
import logger from '../middleware/logger.js';

export const seedQuizQuestions = async () => {
  try {
    // Get an existing quiz card or return if none
    const quizCard = await QuizCard.findOne({ where: { status: 'ongoing' } });
    if (!quizCard) {
      logger.warn('No active quiz card found for direct question seeding. Skipping QuizQuestions.');
      return;
    }

    const sampleQuestions = [
      {
        quizCardId: quizCard.id,
        question: 'Which of the following is the most common cause of feline lower urinary tract disease (FLUTD)?',
        options: {
          A: 'Bacterial infection',
          B: 'Urolithiasis',
          C: 'Feline idiopathic cystitis (FIC)',
          D: 'Neoplasia'
        },
        correctAnswer: 'C',
        explanation: 'Feline idiopathic cystitis (FIC) is diagnosed in approximately 60-70% of cats with signs of FLUTD.',
        questionNumber: 1,
        category: quizCard.category,
        difficulty: quizCard.difficulty,
        isActive: true
      },
      {
        quizCardId: quizCard.id,
        question: 'What is the standard treatment for canine parvovirus enteritis?',
        options: {
          A: 'Specific antiviral drug',
          B: 'Intravenous fluid therapy and supportive care',
          C: 'High-dose oral antibiotics',
          D: 'Surgical resection of the intestine'
        },
        correctAnswer: 'B',
        explanation: 'Treatment for parvovirus is primarily supportive, focusing on managing dehydration, electrolyte imbalances, and preventing secondary infections.',
        questionNumber: 2,
        category: quizCard.category,
        difficulty: quizCard.difficulty,
        isActive: true
      },
      {
        quizCardId: quizCard.id,
        question: 'Which heartworm preventive is typically administered once every 6 or 12 months as an injection?',
        options: {
          A: 'Ivermectin',
          B: 'Milbemycin oxime',
          C: 'Moxidectin (sustained-release)',
          D: 'Selamectin'
        },
        correctAnswer: 'C',
        explanation: 'Moxidectin is available as a sustained-release injectable (ProHeart 6 or ProHeart 12) that provides long-term protection.',
        questionNumber: 3,
        category: quizCard.category,
        difficulty: quizCard.difficulty,
        isActive: true
      }
    ];

    for (const questionData of sampleQuestions) {
      const [record, created] = await Quiz.findOrCreate({
        where: { 
          quizCardId: questionData.quizCardId,
          question: questionData.question 
        },
        defaults: questionData
      });
      if (created) {
        logger.info(`Quiz question ${questionData.questionNumber} added successfully`);
      }
    }
  } catch (error) {
    logger.error('Error seeding quiz questions:', error);
    throw error;
  }
};