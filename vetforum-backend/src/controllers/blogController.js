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
      images: images ? (typeof images === 'string' ? JSON.parse(images) : images) : [],
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null,
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

// Get All Blogs
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tags, authorId, search } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user?.id;

    const whereClause = {};

    // For non-admins and non-authors, only show published blogs
    if (!req.user?.isAdmin && authorId !== userId?.toString()) {
      whereClause.status = 'published';
    } else if (status) {
      whereClause.status = status;
    }

    if (authorId) {
      whereClause.authorId = authorId;
    }

    if (tags) {
      whereClause.tags = {
        [Op.like]: `%${tags}%`
      };
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { subtitle: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
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

// Get Blog by ID
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

    // Check permissions
    if (blog.status !== 'published') {
      if (blog.authorId !== userId && !req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This blog is not published yet.'
        });
      }
    }

    // Track view
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
      const savedFilename = await saveUploadedFile(req.file, 'blogs');
      if (savedFilename) {
        if (blog.featuredImage) {
          deleteImage(blog.featuredImage, 'blogs');
        }
        updateData.featuredImage = savedFilename;
      }
    } else if (featuredImage !== undefined) {
      if (featuredImage && featuredImage.startsWith('data:image/')) {
        const savedFilename = await saveBase64Image(featuredImage, 'blogs');
        if (savedFilename) {
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
    if (status) {
      updateData.status = status;
      if (status === 'published' && !blog.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    await blog.update(updateData);

    const updatedBlog = await Blog.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['password'] }
      }]
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

// Toggle Like
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
      res.json({ success: true, message: 'Blog unliked', liked: false });
    } else {
      await BlogInteraction.create({ userId, blogId: id, type: 'like' });
      await blog.increment('likesCount');
      res.json({ success: true, message: 'Blog liked', liked: true });
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
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const blog = await Blog.findByPk(id);
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Blog not found' });
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

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.authorId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await blog.destroy();
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    logger.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Failed to delete blog' });
  }
};