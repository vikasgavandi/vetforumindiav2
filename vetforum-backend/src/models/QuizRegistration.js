const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizRegistration = sequelize.define('QuizRegistration', {
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
  registrationType: {
    type: DataTypes.ENUM('free', 'paid'),
    allowNull: false,
    defaultValue: 'free'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'n/a'),
    defaultValue: 'n/a'
  },
  paymentOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quiz_registrations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'quizCardId']
    }
  ]
});

module.exports = QuizRegistration;
