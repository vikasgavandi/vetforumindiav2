const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlogInteraction = sequelize.define('BlogInteraction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  blogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'blogs',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('like', 'comment', 'view'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true // Only for comments
  }
}, {
  tableName: 'blog_interactions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'blogId', 'type'],
      where: {
        type: ['like', 'view']
      }
    }
  ]
});

module.exports = BlogInteraction;