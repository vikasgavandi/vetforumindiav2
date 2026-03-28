const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Webinar = sequelize.define('Webinar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  speakerName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registrationFees: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Free'
  },
  paymentLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isLive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'webinars',
  timestamps: true
});

module.exports = Webinar;
