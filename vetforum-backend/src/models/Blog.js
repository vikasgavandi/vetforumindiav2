const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 200]
    }
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 300]
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  featuredImage: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  readTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  }
}, {
  tableName: 'blogs',
  timestamps: true,
  hooks: {
    beforeCreate: (blog) => {
      // Generate slug from title
      if (blog.title && !blog.slug) {
        blog.slug = blog.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 100);
      }
      
      // Calculate read time (average 200 words per minute)
      if (blog.content && !blog.readTime) {
        const wordCount = blog.content.split(/\s+/).length;
        blog.readTime = Math.ceil(wordCount / 200);
      }
      
      // Generate excerpt if not provided
      if (blog.content && !blog.excerpt) {
        blog.excerpt = blog.content.substring(0, 200) + '...';
      }
      
      // Set published date if status is published
      if (blog.status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    },
    beforeUpdate: (blog) => {
      // Update slug if title changed
      if (blog.changed('title') && blog.title) {
        blog.slug = blog.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 100);
      }
      
      // Recalculate read time if content changed
      if (blog.changed('content') && blog.content) {
        const wordCount = blog.content.split(/\s+/).length;
        blog.readTime = Math.ceil(wordCount / 200);
      }
      
      // Update excerpt if content changed and no custom excerpt
      if (blog.changed('content') && blog.content && !blog.excerpt) {
        blog.excerpt = blog.content.substring(0, 200) + '...';
      }
      
      // Set published date when status changes to published
      if (blog.changed('status') && blog.status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }
  }
});

module.exports = Blog;