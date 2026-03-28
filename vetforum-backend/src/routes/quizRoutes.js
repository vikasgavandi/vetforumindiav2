const express = require('express');
const {
  getNextQuestion,
  submitAnswer,
  getQuizProgress,
  startNewQuiz,
  getAllQuestions,
  getAvailableQuizzes,
  getQuizDetails,
  getGlobalLeaderboard,
  getUserBestScores,
  getUserQuizStatistics,
  joinQuiz,
  initiateQuizPayment,
  verifyQuizPayment,
  getQuizLeaderboard
} = require('../controllers/quizController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public/Optional Auth routes (specific paths first!)
router.get('/leaderboard/global', optionalAuth, getGlobalLeaderboard);
router.get('/leaderboard/:quizCardId', optionalAuth, getQuizLeaderboard);
router.get('/available', optionalAuth, getAvailableQuizzes);

// Protected routes (specific paths MUST come before /:quizCardId)
router.get('/dashboard/best-scores', authenticateToken, getUserBestScores);
router.get('/dashboard/statistics', authenticateToken, getUserQuizStatistics);
router.get('/questions', authenticateToken, getAllQuestions);
router.get('/next', authenticateToken, getNextQuestion);  // MUST be before /:quizCardId
router.post('/submit', authenticateToken, submitAnswer);
router.get('/progress', authenticateToken, getQuizProgress);
router.post('/new', authenticateToken, startNewQuiz);
router.post('/join', authenticateToken, joinQuiz);
router.post('/payment', authenticateToken, initiateQuizPayment);
router.post('/payment/verify', authenticateToken, verifyQuizPayment);

// Parameterized route MUST come last (catches everything not matched above)
router.get('/:quizCardId', optionalAuth, getQuizDetails);

module.exports = router;