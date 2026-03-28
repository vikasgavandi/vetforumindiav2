import { Blog, BlogInteraction, User } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../middleware/logger.js';
import { saveBase64Image, deleteImage, saveUploadedFile } from '../utils/imageHandler.js';

// Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, subtitle, content, excerpt, featuredImage, images, tags, status } = req.body;
    const authorId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Process featured image
    let savedFilename = null;
    
    // Check for Multer file upload first
    if (req.file) {
      savedFilename = await saveUploadedFile(req.file, 'blogs');
    } 
    // Fallback for base64 (legacy support)
    else if (featuredImage && featuredImage.startsWith('data:image/')) {
      savedFilename = await saveBase64Image(featuredImage, 'blogs');
    } else {
      savedFilename = featuredImage;
    }

    const blog = await Blog.create({
      title,
      subtitle,
      content,
      excerpt,
      featuredImage: savedFilename,
      images: images ? JSON.parse(images) : [], // Handle stringified JSON from FormData
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [], // Handle tags from FormData
      status: status || 'draft',
      authorId
    });

    const blogWithAuthor = await Blog.findByPk(blog.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['password'] }
      }]
    });

    logger.info('Blog created', {
      blogId: blog.id,
      title: blog.title,
      authorId: authorId
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blogWithAuthor
    });
  } catch (error) {
    logger.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create blog',
      error: error.message
    });
  }
};

// Get All Blogs (Published only for non-authors)
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tags, authorId, search } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user?.id;

    const whereClause = {};

    // Non-authors can only see published blogs
    if (!req.user?.isAdmin && authorId !== userId?.toString()) {
      whereClause.status = 'published';
    }

    if (status && (req.user?.isAdmin || authorId === userId?.toString())) {
      whereClause.status = status;
    }

    if (authorId) {
      whereClause.authorId = authorId;
    }

    if (tags) {
      whereClause.tags = {
        [Op.contains]: tags.split(',')
      };
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { subtitle: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const blogs = await Blog.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['password'] }
      }],
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: blogs.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(blogs.count / limit),
        totalItems: blogs.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs'
    });
  }
};

// Get Blog by ID or Slug
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const whereClause = {
      [Op.or]: [
        { id: isNaN(id) ? null : parseInt(id) },
        { slug: id }
      ]
    };

    const blog = await Blog.findOne({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['password'] }
      }]
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user can view this blog
    if (blog.status !== 'published') {

      // Author aur admin ko allow hai
      if (blog.authorId === userId || req.user?.isAdmin) {
        // allowed, kuch mat karo
      } else {
        return res.status(403).json({
          success: false,
          errorCode: 'BLOG_NOT_PUBLISHED',
          message: 'This blog is not published yet. Status has not been updated.'
        });
      }
    }


    // Track view if user is authenticated and not the author
    if (userId && userId !== blog.authorId) {
      const existingView = await BlogInteraction.findOne({
        where: { userId, blogId: blog.id, type: 'view' }
      });

      if (!existingView) {
        await BlogInteraction.create({
          userId,
          blogId: blog.id,
          type: 'view'
        });
        await blog.increment('viewsCount');
      }
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    logger.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog'
    });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, excerpt, featuredImage, images, tags, status } = req.body;
    const userId = req.user.id;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check permissions
    if (blog.authorId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (content) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    
    if (req.file) {
      // Save new image from Multer
      const savedFilename = await saveUploadedFile(req.file, 'blogs');
      if (savedFilename) {
        // Delete old image if it exists
        if (blog.featuredImage) {
          deleteImage(blog.featuredImage, 'blogs');
        }
        updateData.featuredImage = savedFilename;
      }
    } else if (featuredImage !== undefined) {
      if (featuredImage && featuredImage.startsWith('data:image/')) {
        // Save new image from Base64
        const savedFilename = await saveBase64Image(featuredImage, 'blogs');
        if (savedFilename) {
          // Delete old image if it exists
          if (blog.featuredImage) {
            deleteImage(blog.featuredImage, 'blogs');
          }
          updateData.featuredImage = savedFilename;
        }
      } else {
        updateData.featuredImage = featuredImage;
      }
    }
    
    if (images) updateData.images = typeof images === 'string' ? JSON.parse(images) : images;
    if (tags) updateData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (status) updateData.status = status;

    await blog.update(updateData);

    const updatedBlog = await Blog.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['password'] }
      }]
    });

    logger.info('Blog updated', {
      blogId: id,
      updatedBy: userId
    });

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    logger.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog'
    });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check permissions
    if (blog.authorId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await blog.destroy();

    logger.info('Blog deleted', {
      blogId: id,
      deletedBy: userId
    });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog'
    });
  }
};

// Like/Unlike Blog
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findByPk(id);
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const existingLike = await BlogInteraction.findOne({
      where: { userId, blogId: id, type: 'like' }
    });

    if (existingLike) {
      await existingLike.destroy();
      await blog.decrement('likesCount');

      res.json({
        success: true,
        message: 'Blog unliked',
        liked: false
      });
    } else {
      await BlogInteraction.create({
        userId,
        blogId: id,
        type: 'like'
      });
      await blog.increment('likesCount');

      res.json({
        success: true,
        message: 'Blog liked',
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

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const blog = await Blog.findByPk(id);
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = await BlogInteraction.create({
      userId,
      blogId: id,
      type: 'comment',
      content
    });

    await blog.increment('commentsCount');

    const commentWithUser = await BlogInteraction.findByPk(comment.id, {
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
    logger.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// Get Blog Comments
export const getBlogComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await BlogInteraction.findAndCountAll({
      where: { blogId: id, type: 'comment' },
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