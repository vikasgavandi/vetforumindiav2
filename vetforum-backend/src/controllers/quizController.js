import { Quiz, UserQuizProgress, User, QuizCard, QuizRegistration, sequelize } from '../models/index.js';
import razorpayService from '../utils/razorpayService.js';
import logger from '../middleware/logger.js';
import { QueryTypes } from 'sequelize';

// Get next question for user
export const getNextQuestion = async (req, res) => {
  try {
    const userId = req.user.id;

    logger.info('[DEBUG] getNextQuestion called', { userId });

    // Get the most recent active quiz progress for the user
    const progress = await UserQuizProgress.findOne({
      where: { userId, isCompleted: false },
      order: [['startedAt', 'DESC']]
    });

    logger.info('[DEBUG] Progress found', { 
      found: !!progress,
      progressId: progress?.id,
      quizCardId: progress?.quizCardId,
      currentQuestionNumber: progress?.currentQuestionNumber,
      isCompleted: progress?.isCompleted
    });

    if (!progress || !progress.quizCardId) {
      logger.warn('[DEBUG] No active quiz found', { 
        userId, 
        progressFound: !!progress,
        hasQuizCardId: progress?.quizCardId 
      });
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
        error: 'No active quiz session. Please start a quiz first.'
      });
    }

    // Get next question for this specific quiz card
    const question = await Quiz.findOne({
      where: {
        quizCardId: progress.quizCardId,
        questionNumber: progress.currentQuestionNumber,
        isActive: true
      }
    });

    logger.info('[DEBUG] Question query result', {
      found: !!question,
      quizCardId: progress.quizCardId,
      questionNumber: progress.currentQuestionNumber,
      questionId: question?.id
    });

    if (!question) {
      // Check if quiz is completed (no more questions)
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();

      logger.info('[DEBUG] No more questions, quiz completed', {
        userId,
        quizCardId: progress.quizCardId
      });

      return res.json({
        success: true,
        message: 'Quiz completed!',
        progress: progress.getProgressSummary(),
        quizCompleted: true
      });
    }

    logger.info('Question served', {
      userId,
      quizCardId: progress.quizCardId,
      questionNumber: question.questionNumber,
      questionId: question.id
    });

    res.json({
      success: true,
      question: question.toQuestionJSON(),
      progress: {
        quizCardId: progress.quizCardId,
        currentQuestionNumber: progress.currentQuestionNumber,
        totalQuestionsAnswered: progress.totalQuestionsAnswered,
        isCompleted: progress.isCompleted
      }
    });

  } catch (error) {
    logger.error('Error getting next question',{
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching question'
    });
  }
};

// Submit answer for current question
export const submitAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { answer } = req.body;

    // Validation
    if (!answer || !['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
      return res.status(400).json({
        error: 'Valid answer (A, B, C, or D) is required'
      });
    }

    // Get user progress (most recent active)
    const progress = await UserQuizProgress.findOne({
      where: { userId, isCompleted: false },
      order: [['startedAt', 'DESC']]
    });

    if (!progress) {
      return res.status(400).json({
        error: 'No active quiz found. Please start a new quiz.'
      });
    }

    // Get current question for this specific quiz card
    const question = await Quiz.findOne({
      where: {
        quizCardId: progress.quizCardId,
        questionNumber: progress.currentQuestionNumber,
        isActive: true
      }
    });

    if (!question) {
      return res.status(400).json({
        error: 'Current question not found'
      });
    }

    // Check if answer is correct
    const isCorrect = question.checkAnswer(answer.toUpperCase());
    const selectedAnswer = answer.toUpperCase();

    // Add answer to progress
    await progress.addAnswer(
      progress.currentQuestionNumber,
      selectedAnswer,
      isCorrect
    );

    // Move to next question or complete quiz
    const totalQuestions = await Quiz.count({ 
      where: { 
        quizCardId: progress.quizCardId,
        isActive: true 
      } 
    });

    if (progress.currentQuestionNumber >= totalQuestions) {
      // Quiz completed
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();

      logger.info('Quiz completed', {
        userId,
        totalQuestions: progress.totalQuestionsAnswered,
        correctAnswers: progress.correctAnswers,
        scorePercentage: progress.getScorePercentage()
      });

      return res.json({
        message: 'Quiz completed!',
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        progress: progress.getProgressSummary(),
        quizCompleted: true
      });
    } else {
      // Move to next question
      progress.currentQuestionNumber += 1;
      await progress.save();

      logger.info('Answer submitted', {
        userId,
        questionNumber: question.questionNumber,
        selectedAnswer,
        isCorrect
      });

      res.json({
        message: 'Answer submitted successfully',
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        nextQuestionNumber: progress.currentQuestionNumber,
        progress: {
          currentQuestionNumber: progress.currentQuestionNumber,
          totalQuestionsAnswered: progress.totalQuestionsAnswered,
          correctAnswers: progress.correctAnswers,
          scorePercentage: progress.getScorePercentage(),
          isCompleted: progress.isCompleted
        }
      });
    }

  } catch (error) {
    logger.error('Error submitting answer', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      answer: req.body.answer
    });

    res.status(500).json({
      error: 'Internal server error while submitting answer'
    });
  }
};

// Get quiz progress/results
export const getQuizProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const progress = await UserQuizProgress.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 1
    });

    if (!progress) {
      return res.json({
        message: 'No quiz attempts found',
        progress: null
      });
    }

    res.json({
      progress: progress.getProgressSummary(),
      answers: progress.answers
    });

  } catch (error) {
    logger.error('Error getting quiz progress', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });

    res.status(500).json({
      error: 'Internal server error while fetching quiz progress'
    });
  }
};

// Start new quiz (reset progress)
export const startNewQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizCardId } = req.body;

    if (!quizCardId) {
      return res.status(400).json({
        success: false,
        error: 'Quiz Card ID is required to start a new quiz'
      });
    }

    // Verify quiz card exists
    const quizCard = await QuizCard.findByPk(quizCardId);
    
    if (!quizCard) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz card not found' 
      });
    }

    // Check if user is registered/paid for this quiz
    const registration = await QuizRegistration.findOne({
      where: { userId, quizCardId, isActive: true }
    });

    // Verify payment/registration for paid quizzes
    if (quizCard.price > 0) {
      if (!registration || registration.paymentStatus !== 'paid') {
        return res.status(403).json({
          success: false,
          error: 'Registration and payment required for this quiz'
        });
      }
    } else {
      // For free quizzes, user must still be registered
      if (!registration) {
        return res.status(403).json({
          success: false,
          error: 'You must join this quiz before starting'
        });
      }
    }

    // Check if user already has an active quiz for this card
    let progress = await UserQuizProgress.findOne({
      where: { 
        userId, 
        quizCardId: parseInt(quizCardId),
        isCompleted: false 
      }
    });

    if (progress) {
      // Reset existing progress
      progress.currentQuestionNumber = 1;
      progress.totalQuestionsAnswered = 0;
      progress.correctAnswers = 0;
      progress.answers = {};
      progress.startedAt = new Date();
      await progress.save();
    } else {
      // Create new progress with quizCardId
      progress = await UserQuizProgress.create({
        userId,
        quizCardId: parseInt(quizCardId),
        currentQuestionNumber: 1,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        answers: {},
        startedAt: new Date()
      });
    }

    logger.info('Quiz started/reset successfully', { 
      userId, 
      quizCardId,
      progressId: progress.id 
    });

    res.json({
      success: true,
      message: 'New quiz started successfully',
      progress: {
        id: progress.id,
        quizCardId: progress.quizCardId,
        currentQuestionNumber: progress.currentQuestionNumber,
        totalQuestionsAnswered: progress.totalQuestionsAnswered,
        correctAnswers: progress.correctAnswers
      }
    });

  } catch (error) {
    logger.error('Error starting new quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start quiz' 
    });
  }
};

// Get all questions (admin function)
export const getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isActive: true };

    if (category) {
      whereClause.category = category;
    }

    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    const { count, rows: questions } = await Quiz.findAndCountAll({
      where: whereClause,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['questionNumber', 'ASC']]
    });

    res.json({
      questions: questions.map(q => q.toQuestionJSON()),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    logger.error('Error getting all questions', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });

    res.status(500).json({
      error: 'Internal server error while fetching questions'
    });
  }
};

// Get all available quizzes with status filtering
export const getAvailableQuizzes = async (req, res) => {
  try {
    const { status = 'ongoing', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isActive: true };

    // Filter by status if specified
    if (status) {
      whereClause.status = status;
    }

    const includeArr = [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ];

    if (req.user) {
      includeArr.push({
        model: QuizRegistration,
        as: 'registrations',
        where: { userId: req.user.id },
        required: false
      });
    }

    const { count, rows: quizCards } = await QuizCard.findAndCountAll({
      where: whereClause,
      include: includeArr,
      order: [['createdAt', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(limit)
    });

    // Format data to include registration status
    const formattedQuizzes = quizCards.map(qc => {
      const reg = qc.registrations && qc.registrations.length > 0 ? qc.registrations[0] : null;
      const qcJson = qc.toJSON();
      delete qcJson.registrations;
      
      return {
        ...qcJson,
        userRegistration: reg ? {
          status: reg.paymentStatus === 'paid' || qc.price == 0 ? 'registered' : 'pending_payment',
          paymentStatus: reg.paymentStatus,
          registeredAt: reg.registeredAt
        } : null
      };
    });

    logger.info('Available quizzes fetched', {
      userId: req.user?.id,
      status,
      count
    });

    res.json({
      success: true,
      data: formattedQuizzes,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching available quizzes', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching quizzes'
    });
  }
};

// Get quiz details by ID
export const getQuizDetails = async (req, res) => {
  try {
    const { quizCardId } = req.params;

    const quizCard = await QuizCard.findByPk(quizCardId, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePhoto']
      }]
    });

    if (!quizCard) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    logger.info('Quiz details fetched', {
      userId: req.user?.id,
      quizCardId
    });

    res.json({
      success: true,
      data: quizCard
    });
  } catch (error) {
    logger.error('Error fetching quiz details', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching quiz details'
    });
  }
};

// Get global leaderboard - Top 5 users across all quizzes by score and time
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const leaderboard = await QuizCard.sequelize.query(
      `
      SELECT 
        qa.id,
        qa.userId,
        u.id as userId_user,
        u.firstName,
        u.lastName,
        u.email,
        u.profilePhoto,
        qa.score,
        qa.timeTaken,
        qa.totalQuestions,
        qa.correctAnswers,
        qa.status,
        qc.title as quizTitle,
        qc.category,
        qc.difficulty,
        qa.createdAt,
        (qa.correctAnswers / qa.totalQuestions * 100) as scorePercentage
      FROM quiz_attempts qa
      INNER JOIN users u ON qa.userId = u.id
      INNER JOIN quiz_cards qc ON qa.quizCardId = qc.id
      WHERE qa.status = 'completed'
      ORDER BY 
        qa.score DESC,
        qa.timeTaken ASC,
        qa.createdAt DESC
      LIMIT ?
      `,
      {
        replacements: [parseInt(limit)],
        type: QueryTypes.SELECT
      }
    );

    logger.info('Global leaderboard fetched', {
      userId: req.user?.id,
      leaderboardSize: leaderboard.length,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: leaderboard.map(entry => ({
        id: entry.id,
        userId: entry.userId,
        user: {
          id: entry.userId_user,
          firstName: entry.firstName,
          lastName: entry.lastName,
          email: entry.email,
          profilePhoto: entry.profilePhoto
        },
        score: entry.score,
        scorePercentage: parseFloat(entry.scorePercentage).toFixed(2),
        timeTaken: entry.timeTaken,
        correctAnswers: entry.correctAnswers,
        totalQuestions: entry.totalQuestions,
        status: entry.status,
        quiz: {
          title: entry.quizTitle,
          category: entry.category,
          difficulty: entry.difficulty
        },
        completedAt: entry.createdAt
      })),
      pagination: {
        limit: parseInt(limit),
        returned: leaderboard.length
      }
    });
  } catch (error) {
    logger.error('Error fetching global leaderboard', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching leaderboard'
    });
  }
};

// Get user's personal best scores across all quizzes
export const getUserBestScores = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const bestScores = await QuizCard.sequelize.query(
      `
      SELECT 
        qa.id,
        qa.score,
        qa.timeTaken,
        qa.correctAnswers,
        qa.totalQuestions,
        qa.status,
        qc.id as quizCardId,
        qc.title,
        qc.category,
        qc.difficulty,
        qc.duration,
        qa.createdAt,
        (qa.correctAnswers / qa.totalQuestions * 100) as scorePercentage
      FROM quiz_attempts qa
      INNER JOIN quiz_cards qc ON qa.quizCardId = qc.id
      WHERE qa.userId = ? AND qa.status = 'completed'
      ORDER BY 
        qa.score DESC,
        qa.timeTaken ASC,
        qa.createdAt DESC
      LIMIT ?
      `,
      {
        replacements: [userId, parseInt(limit)],
        type: QueryTypes.SELECT
      }
    );

    logger.info('User best scores fetched', {
      userId,
      scoresCount: bestScores.length
    });

    res.json({
      success: true,
      data: bestScores.map(entry => ({
        id: entry.id,
        score: entry.score,
        scorePercentage: parseFloat(entry.scorePercentage).toFixed(2),
        timeTaken: entry.timeTaken,
        correctAnswers: entry.correctAnswers,
        totalQuestions: entry.totalQuestions,
        status: entry.status,
        quiz: {
          id: entry.quizCardId,
          title: entry.title,
          category: entry.category,
          difficulty: entry.difficulty,
          duration: entry.duration
        },
        completedAt: entry.createdAt
      })),
      pagination: {
        limit: parseInt(limit),
        returned: bestScores.length
      }
    });
  } catch (error) {
    logger.error('Error fetching user best scores', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching best scores'
    });
  }
};

// Get user's quiz statistics - performance summary
export const getUserQuizStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await QuizCard.sequelize.query(
      `
      SELECT 
        COUNT(DISTINCT qa.id) as totalAttempts,
        COUNT(DISTINCT CASE WHEN qa.status = 'completed' THEN qa.id END) as completedAttempts,
        COUNT(DISTINCT CASE WHEN qa.status = 'abandoned' THEN qa.id END) as abandonedAttempts,
        COUNT(DISTINCT CASE WHEN qa.status = 'in_progress' THEN qa.id END) as inProgressAttempts,
        AVG(CASE WHEN qa.status = 'completed' THEN qa.score ELSE NULL END) as averageScore,
        MAX(qa.score) as bestScore,
        MIN(qa.score) as lowestScore,
        AVG(CASE WHEN qa.status = 'completed' THEN qa.timeTaken ELSE NULL END) as averageTimeTaken,
        COUNT(DISTINCT qa.quizCardId) as uniqueQuizzesTaken
      FROM quiz_attempts qa
      WHERE qa.userId = ?
      `,
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    const statData = stats[0] || {};

    logger.info('User quiz statistics fetched', {
      userId,
      totalAttempts: statData.totalAttempts
    });

    res.json({
      success: true,
      data: {
        totalAttempts: parseInt(statData.totalAttempts) || 0,
        completedAttempts: parseInt(statData.completedAttempts) || 0,
        abandonedAttempts: parseInt(statData.abandonedAttempts) || 0,
        inProgressAttempts: parseInt(statData.inProgressAttempts) || 0,
        averageScore: statData.averageScore ? parseFloat(statData.averageScore).toFixed(2) : 0,
        bestScore: statData.bestScore ? parseInt(statData.bestScore) : 0,
        lowestScore: statData.lowestScore ? parseInt(statData.lowestScore) : 0,
        averageTimeTaken: statData.averageTimeTaken ? Math.round(statData.averageTimeTaken) : 0,
        uniqueQuizzesTaken: parseInt(statData.uniqueQuizzesTaken) || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching user quiz statistics', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching statistics'
    });
  }
};

// Join free quiz
export const joinQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contestId } = req.body;

    const quizCard = await QuizCard.findByPk(contestId);
    if (!quizCard) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (parseFloat(quizCard.price) > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'This is a paid quiz. Please use the registration flow.' 
      });
    }

    // Create or find registration
    const [registration, created] = await QuizRegistration.findOrCreate({
      where: { userId, quizCardId: contestId },
      defaults: {
        registrationType: 'free',
        paymentStatus: 'n/a'
      }
    });

    res.json({
      success: true,
      message: created ? 'Successfully joined the quiz!' : 'You are already registered.',
      data: registration
    });
  } catch (error) {
    logger.error('Error joining quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to join quiz' });
  }
};

// Initiate Quiz Payment
export const initiateQuizPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contestId } = req.body;

    const quizCard = await QuizCard.findByPk(contestId);
    if (!quizCard) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const price = parseFloat(quizCard.price);
    if (price <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'This is a free quiz. Use the join endpoint.' 
      });
    }

    // Create Razorpay order
    const orderReceipt = `quiz_reg_${userId}_${contestId}_${Date.now()}`;
    const order = await razorpayService.createOrder(price, 'INR', orderReceipt, {
      userId,
      quizCardId: contestId,
      type: 'quiz_registration'
    });

    // Create or update registration as pending
    await QuizRegistration.upsert({
      userId,
      quizCardId: contestId,
      registrationType: 'paid',
      paymentStatus: 'pending',
      paymentOrderId: order.id
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_bypass'
      }
    });
  } catch (error) {
    logger.error('Error initiating quiz payment:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment' });
  }
};

// Verify Quiz Payment
export const verifyQuizPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contestId, paymentId, orderId, signature } = req.body;

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update registration
    const registration = await QuizRegistration.findOne({
      where: { userId, quizCardId: contestId, paymentOrderId: orderId }
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    await registration.update({
      paymentStatus: 'paid',
      paymentId: paymentId
    });

    logger.info('Quiz payment verified', { userId, contestId, paymentId });

    res.json({
      success: true,
      message: 'Payment verified successfully. You can now start the quiz.'
    });
  } catch (error) {
    logger.error('Error verifying quiz payment:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

// Get leaderboard for a specific quiz (Top 5 based on correct answers and time)
export const getQuizLeaderboard = async (req, res) => {
  try {
    const { quizCardId } = req.params;

    const leaderboard = await UserQuizProgress.findAll({
      where: {
        quizCardId: quizCardId,
        isCompleted: true
      },
      attributes: [
        'userId',
        'correctAnswers',
        'totalQuestionsAnswered',
        'startedAt',
        'completedAt',
        [sequelize.literal('TIMESTAMPDIFF(SECOND, startedAt, completedAt)'), 'duration']
      ],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'profilePhoto']
      }],
      order: [
        ['correctAnswers', 'DESC'],
        [sequelize.literal('duration'), 'ASC']
      ],
      limit: 5
    });

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    logger.error('Error fetching quiz leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};