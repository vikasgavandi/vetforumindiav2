import express from 'express';
import { 
  createPost, 
  getPosts, 
  getUserPosts, 
  toggleLike, 
  addComment, 
  getPostComments, 
  sharePost 
} from '../controllers/postController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

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

export default router;