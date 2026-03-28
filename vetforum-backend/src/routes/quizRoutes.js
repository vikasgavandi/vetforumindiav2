import express from 'express';
import {
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
} from '../controllers/quizController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

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

export default router;