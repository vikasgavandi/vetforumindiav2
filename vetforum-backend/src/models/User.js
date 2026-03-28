import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 15]
    }
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'India'
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]
    }
  },
  isVeterinarian: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  veterinarianType: {
    type: DataTypes.ENUM('Student', 'Graduated'),
    allowNull: true
  },
  yearOfStudy: {
    type: DataTypes.ENUM('1st', '2nd', '3rd', '4th', 'Final year/Internship'),
    allowNull: true
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 50]
    }
  },
  college: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  university: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  veterinarianState: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      notEmpty: true
    }
  },
  vetRegNo: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 50]
    }
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 100]
    }
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentPosition: {
    type: DataTypes.ENUM('Student', 'Government Officer', 'Government Teaching Professional', 'Private Organization', 'Clinician'),
    allowNull: true
  },
  positionDetails: {
    type: DataTypes.TEXT,
    allowNull: true
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
  profilePhoto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user data without password
User.prototype.toSafeJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  
  // Derive role for frontend compatibility
  // Use explicit boolean check or check for 1
  const isAdmin = values.isAdmin === true || values.isAdmin === 1;
  const isVet = values.isVeterinarian === true || values.isVeterinarian === 1;

  if (isAdmin) {
    values.role = 'admin';
  } else if (isVet) {
    values.role = 'veterinarian';
  } else {
    values.role = 'user';
  }
  
  console.log(`[DEBUG] toSafeJSON for ${values.email}: isAdmin=${isAdmin}, role=${values.role}`);
  
  return values;
};

export default User;