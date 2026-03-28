const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserQuizProgress = sequelize.define('UserQuizProgress', {
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
    },
    onDelete: 'CASCADE'
  },
  quizCardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quiz_cards',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  currentQuestionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  totalQuestionsAnswered: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
 tableName: 'user_quiz_progress',
 timestamps: true
});

// Instance method to calculate score percentage
UserQuizProgress.prototype.getScorePercentage = function() {
  if (this.totalQuestionsAnswered === 0) return 0;
  return Math.round((this.correctAnswers / this.totalQuestionsAnswered) * 100);
};

// Instance method to add answer
UserQuizProgress.prototype.addAnswer = function(questionNumber, selectedAnswer, isCorrect) {
  const answers = { ...this.answers };
  answers[questionNumber] = {
    selectedAnswer,
    isCorrect,
    answeredAt: new Date()
  };

  this.answers = answers;
  this.totalQuestionsAnswered += 1;

  if (isCorrect) {
    this.correctAnswers += 1;
  }

  return this.save();
};

// Instance method to get progress summary
UserQuizProgress.prototype.getProgressSummary = function() {
  return {
    currentQuestionNumber: this.currentQuestionNumber,
    totalQuestionsAnswered: this.totalQuestionsAnswered,
    correctAnswers: this.correctAnswers,
    scorePercentage: this.getScorePercentage(),
    isCompleted: this.isCompleted,
    startedAt: this.startedAt,
    completedAt: this.completedAt
  };
};

module.exports = UserQuizProgress;