import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PostInteraction = sequelize.define('PostInteraction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
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
    type: DataTypes.ENUM('like', 'save', 'report'),
    allowNull: false
  }
}, {
  tableName: 'post_interactions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['postId', 'userId', 'type']
    }
  ]
});

export default PostInteraction;