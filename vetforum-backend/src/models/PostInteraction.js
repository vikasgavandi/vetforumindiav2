const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostInteraction = sequelize.define('PostInteraction', {
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
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('like', 'comment', 'share'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true // Only for comments
  }
}, {
  tableName: 'post_interactions',
  timestamps: true
});

module.exports = PostInteraction;