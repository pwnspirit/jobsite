const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('applied', 'under_review', 'shortlisted', 'interviewed', 'rejected', 'hired'),
    defaultValue: 'applied'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  recruiterNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  interviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  interviewType: {
    type: DataTypes.ENUM('phone', 'video', 'onsite'),
    allowNull: true
  },
  isWithdrawn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  withdrawnAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'applications',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['appliedAt']
    },
    {
      fields: ['userId', 'jobId'],
      unique: true
    }
  ]
});

// Instance methods
Application.prototype.updateStatus = function(newStatus, notes = null) {
  this.status = newStatus;
  this.reviewedAt = new Date();
  if (notes) {
    this.recruiterNotes = notes;
  }
  return this.save();
};

Application.prototype.withdraw = function() {
  this.isWithdrawn = true;
  this.withdrawnAt = new Date();
  this.status = 'withdrawn';
  return this.save();
};

module.exports = Application; 