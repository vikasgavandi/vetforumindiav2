const { Post, PostInteraction, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../middleware/logger');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content, photos = [] } = req.body;
    const userId = req.user.id;

    const post = await Post.create({
      userId,
      content,
      photos
    });

    const postWithAuthor = await Post.findByPk(post.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['password'] }
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: postWithAuthor
    });
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Get all posts (feed)
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['password'] }
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: posts.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(posts.count / limit),
        totalItems: posts.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: { 
        userId: userId || req.user.id,
        isActive: true 
      },
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['password'] }
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: posts.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(posts.count / limit),
        totalItems: posts.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts'
    });
  }
};

// Like/Unlike a post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = await PostInteraction.findOne({
      where: { userId, postId, type: 'like' }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await post.decrement('likesCount');
      
      res.json({
        success: true,
        message: 'Post unliked',
        liked: false
      });
    } else {
      // Like
      await PostInteraction.create({
        userId,
        postId,
        type: 'like'
      });
      await post.increment('likesCount');
      
      res.json({
        success: true,
        message: 'Post liked',
        liked: true
      });
    }
  } catch (error) {
    logger.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findByPk(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    console.log(userId,postId,content);
    const comment = await PostInteraction.create({
      userId,
      postId,
      type: 'comment',
      content
    });
    console.log(comment);
    await post.increment('commentsCount');

    const commentWithUser = await PostInteraction.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: commentWithUser
    });
  } catch (error) {
    console.log(error);
    logger.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error:error
    });
  }
};

// Get post comments
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await PostInteraction.findAndCountAll({
      where: { postId, type: 'comment' },
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: comments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(comments.count / limit),
        totalItems: comments.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

// Share post
const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingShare = await PostInteraction.findOne({
      where: { userId, postId, type: 'share' }
    });

    if (!existingShare) {
      await PostInteraction.create({
        userId,
        postId,
        type: 'share'
      });
      await post.increment('sharesCount');
    }

    res.json({
      success: true,
      message: 'Post shared successfully'
    });
  } catch (error) {
    logger.error('Error sharing post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post'
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getUserPosts,
  toggleLike,
  addComment,
  getPostComments,
  sharePost
};