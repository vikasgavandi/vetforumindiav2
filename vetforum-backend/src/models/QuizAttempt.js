import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const QuizAttempt = sequelize.define('QuizAttempt', {
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
  quizCardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quiz_cards',
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  timeTaken: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
    defaultValue: 'in_progress'
  }
}, {
  tableName: 'quiz_attempts',
  timestamps: true
});

export default QuizAttempt;