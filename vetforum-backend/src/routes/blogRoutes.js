const express = require('express');
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  getBlogComments
} = require('../controllers/blogController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage (for processing with sharp)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.get('/:id/comments', getBlogComments);

// Protected routes
router.post('/', authenticateToken, upload.single('featuredImage'), createBlog);
router.put('/:id', authenticateToken, upload.single('featuredImage'), updateBlog);
router.delete('/:id', authenticateToken, deleteBlog);

// Blog interactions
router.post('/:id/like', authenticateToken, toggleLike);
router.post('/:id/comment', authenticateToken, addComment);

module.exports = router;