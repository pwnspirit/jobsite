const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { User, Job, Application, Notification, Skill } = require('../models');

const router = express.Router();

// All admin routes require admin role
router.use(authenticateToken, requireRole('admin'));

// Get admin dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalJobs = await Job.count();
    const totalApplications = await Application.count();
    const pendingJobApprovals = await Job.count({ where: { isApproved: false } });
    const activeUsers = await User.count({ where: { isActive: true } });

    // Get recent activity
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt']
    });

    const recentJobs = await Job.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'company', 'isApproved', 'createdAt']
    });

    const stats = {
      totalUsers,
      totalJobs,
      totalApplications,
      pendingJobApprovals,
      activeUsers,
      recentUsers,
      recentJobs
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to get admin dashboard' });
  }
});

// Get all users with pagination and filters
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['seeker', 'recruiter', 'admin']),
  query('isActive').optional().isBoolean(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20, role, isActive, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (typeof isActive === 'boolean') whereClause.isActive = isActive;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.like]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user status (approve/ban)
router.put('/users/:id/status', [
  body('isActive').isBoolean(),
  body('reason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isActive, reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id && !isActive) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    await user.update({ isActive });

    // Create notification for user
    if (reason) {
      await Notification.create({
        userId: user.id,
        type: 'system',
        title: isActive ? 'Account Activated' : 'Account Deactivated',
        message: reason,
        data: { action: isActive ? 'activated' : 'deactivated' }
      });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get all jobs with pagination and filters
router.get('/jobs', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isApproved').optional().isBoolean(),
  query('isActive').optional().isBoolean(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20, isApproved, isActive, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (typeof isApproved === 'boolean') whereClause.isApproved = isApproved;
    if (typeof isActive === 'boolean') whereClause.isActive = isActive;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.like]: `%${search}%` } },
        { company: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalJobs: count
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
});

// Approve/reject job
router.put('/jobs/:id/approval', [
  body('isApproved').isBoolean(),
  body('reason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isApproved, reason } = req.body;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await job.update({ isApproved });

    // Create notification for recruiter
    await Notification.create({
      userId: job.recruiterId,
      type: 'system',
      title: isApproved ? 'Job Approved' : 'Job Rejected',
      message: isApproved 
        ? `Your job "${job.title}" has been approved and is now live.`
        : `Your job "${job.title}" has been rejected. ${reason || ''}`,
      data: { 
        jobId: job.id,
        action: isApproved ? 'approved' : 'rejected'
      }
    });

    res.json({
      message: `Job ${isApproved ? 'approved' : 'rejected'} successfully`,
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        isApproved: job.isApproved,
        recruiter: job.recruiter
      }
    });
  } catch (error) {
    console.error('Update job approval error:', error);
    res.status(500).json({ error: 'Failed to update job approval' });
  }
});

// Get all skills
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.findAll({
      order: [['name', 'ASC']]
    });

    res.json({ skills });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
});

// Add new skill
router.post('/skills', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('category').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, description } = req.body;

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ where: { name } });
    if (existingSkill) {
      return res.status(400).json({ error: 'Skill already exists' });
    }

    const skill = await Skill.create({ name, category, description });

    res.status(201).json({
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

// Update skill
router.put('/skills/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('category').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const skill = await Skill.findByPk(id);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    await skill.update(req.body);

    res.json({
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// Delete skill
router.delete('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByPk(id);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    await skill.destroy();

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// Get system statistics
router.get('/system-stats', async (req, res) => {
  try {
    const userStats = await User.findAll({
      attributes: ['role', [require('sequelize').fn('COUNT', require('sequelize').col('role')), 'count']],
      group: ['role']
    });

    const jobStats = await Job.findAll({
      attributes: [
        'isApproved',
        'isActive',
        [require('sequelize').fn('COUNT', require('sequelize').col('isApproved')), 'count']
      ],
      group: ['isApproved', 'isActive']
    });

    const applicationStats = await Application.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status']
    });

    const stats = {
      users: userStats.reduce((acc, item) => {
        acc[item.role] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      jobs: jobStats.reduce((acc, item) => {
        const key = `${item.isApproved ? 'approved' : 'pending'}_${item.isActive ? 'active' : 'inactive'}`;
        acc[key] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      applications: applicationStats.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count);
        return acc;
      }, {})
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Failed to get system statistics' });
  }
});

module.exports = router; 