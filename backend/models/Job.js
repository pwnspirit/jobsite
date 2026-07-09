const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid'),
    allowNull: false
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior', 'executive'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  salaryMin: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  salaryMax: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  salaryType: {
    type: DataTypes.ENUM('hourly', 'monthly', 'yearly'),
    defaultValue: 'yearly'
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applicationsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'jobs',
  indexes: [
    {
      fields: ['title', 'description']
    },
    {
      fields: ['location']
    },
    {
      fields: ['category']
    },
    {
      fields: ['jobType']
    },
    {
      fields: ['experienceLevel']
    },
    {
      fields: ['isActive', 'isApproved']
    }
  ]
});

// Instance methods
Job.prototype.getSalaryRange = function() {
  if (this.salaryMin && this.salaryMax) {
    return `${this.salaryMin.toLocaleString()} - ${this.salaryMax.toLocaleString()}`;
  } else if (this.salaryMin) {
    return `${this.salaryMin.toLocaleString()}+`;
  } else if (this.salaryMax) {
    return `Up to ${this.salaryMax.toLocaleString()}`;
  }
  return 'Not specified';
};

Job.prototype.isExpired = function() {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
};

module.exports = Job; 