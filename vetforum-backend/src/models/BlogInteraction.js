import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BlogInteraction = sequelize.define('BlogInteraction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  blogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'blogs',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('like', 'save', 'share'),
    allowNull: false
  }
}, {
  tableName: 'blog_interactions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['blogId', 'userId', 'type']
    }
  ]
});

export default BlogInteraction;