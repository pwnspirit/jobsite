const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserSkill = sequelize.define('UserSkill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  proficiency: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    defaultValue: 'intermediate'
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'user_skills',
  indexes: [
    {
      fields: ['userId', 'skillId'],
      unique: true
    }
  ]
});

module.exports = UserSkill; 