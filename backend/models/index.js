const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');
const Skill = require('./Skill');
const UserSkill = require('./UserSkill');
const Notification = require('./Notification');
const Bookmark = require('./Bookmark');

// User associations
User.hasMany(Job, { as: 'postedJobs', foreignKey: 'recruiterId' });
User.hasMany(Application, { as: 'applications', foreignKey: 'userId' });
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
User.hasMany(Bookmark, { as: 'bookmarks', foreignKey: 'userId' });

// Job associations
Job.belongsTo(User, { as: 'recruiter', foreignKey: 'recruiterId' });
Job.hasMany(Application, { as: 'applications', foreignKey: 'jobId' });
Job.hasMany(Bookmark, { as: 'bookmarks', foreignKey: 'jobId' });

// Application associations
Application.belongsTo(User, { as: 'applicant', foreignKey: 'userId' });
Application.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });

// Skill associations
Skill.belongsToMany(User, { through: UserSkill, as: 'users', foreignKey: 'skillId' });
User.belongsToMany(Skill, { through: UserSkill, as: 'skills', foreignKey: 'userId' });

// Bookmark associations
Bookmark.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Bookmark.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });

// Notification associations
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = {
  User,
  Job,
  Application,
  Skill,
  UserSkill,
  Notification,
  Bookmark
}; 