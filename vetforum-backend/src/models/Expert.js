const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expert = sequelize.define('Expert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  qualification: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  publications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  awards: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  professionalPhoto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 500.00
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'experts',
  timestamps: true
});

module.exports = Expert;