import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  questionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  optionA: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  optionB: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  optionC: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  optionD: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  correctAnswer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
    validate: {
      isIn: [['A', 'B', 'C', 'D']]
    }
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'General'
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'quiz_questions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['quizCardId', 'questionNumber']
    }
  ]
});

// Instance method to check if answer is correct
Quiz.prototype.checkAnswer = function(userAnswer) {
  return this.correctAnswer === userAnswer;
};

// Instance method to get question data for API response
Quiz.prototype.toQuestionJSON = function() {
  return {
    id: this.id,
    questionNumber: this.questionNumber,
    question: this.question,
    options: {
      A: this.optionA,
      B: this.optionB,
      C: this.optionC,
      D: this.optionD
    },
    category: this.category,
    difficulty: this.difficulty
  };
};

// Instance method to get answer data for API response
Quiz.prototype.toAnswerJSON = function() {
  return {
    id: this.id,
    questionNumber: this.questionNumber,
    correctAnswer: this.correctAnswer,
    explanation: this.explanation
  };
};

export default Quiz;