import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Expert = sequelize.define('Expert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  qualification: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialization: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  publications: {
    type: DataTypes.JSON,
    allowNull: true
  },
  awards: {
    type: DataTypes.JSON,
    allowNull: true
  },
  professionalPhoto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 500.00
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
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

export default Expert;