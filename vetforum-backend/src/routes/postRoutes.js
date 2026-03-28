const express = require('express');
const { 
  createPost, 
  getPosts, 
  getUserPosts, 
  toggleLike, 
  addComment, 
  getPostComments, 
  sharePost 
} = require('../controllers/postController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, createPost);
router.get('/', optionalAuth, getPosts);
router.get('/my', authenticateToken, getUserPosts);
router.get('/user/:userId', authenticateToken, getUserPosts);

// Post interactions
router.post('/:postId/like', authenticateToken, toggleLike);
router.post('/:postId/comment', authenticateToken, addComment);
router.get('/:postId/comments', authenticateToken, getPostComments);
router.post('/:postId/share', authenticateToken, sharePost);

module.exports = router;