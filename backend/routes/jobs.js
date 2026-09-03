const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { authenticateToken, optionalAuthenticateToken, requireRole, requireOwnership } = require('../middleware/auth');
const { Job, User, Application, Bookmark } = require('../models');

const router = express.Router();

// Get all jobs with pagination and filters
router.get('/', [optionalAuthenticateToken,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().trim().escape(),
  query('location').optional().trim().escape(),
  query('category').optional().trim().escape(),
  query('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']).trim(),
  query('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'executive']).trim(),
  query('sortBy').optional().isIn(['latest', 'relevant', 'high-paying']).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Build where clause based on filters
    const where = {
      isActive: true,
      isApproved: true
    };

    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } },
        { company: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    if (req.query.location) {
      where.location = { [Op.like]: `%${req.query.location}%` };
    }

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (req.query.jobType) {
      where.jobType = req.query.jobType;
    }

    if (req.query.experienceLevel) {
      where.experienceLevel = req.query.experienceLevel;
    }

    // Build order clause based on sortBy
    let order = [['createdAt', 'DESC']]; // default to latest
    if (req.query.sortBy === 'high-paying') {
      order = [['salaryMax', 'DESC'], ['salaryMin', 'DESC']];
    }
    // 'relevant' sorting would require more complex logic with full-text search

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order,
      limit,
      offset,
      distinct: true
    });

    // Add isBookmarked flag if user is authenticated
    if (req.user) {
      const bookmarks = await Bookmark.findAll({
        where: {
          userId: req.user.id,
          jobId: jobs.map(job => job.id)
        }
      });

      const bookmarkedJobIds = new Set(bookmarks.map(b => b.jobId));
      jobs.forEach(job => {
        job.dataValues.isBookmarked = bookmarkedJobIds.has(job.id);
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get jobs posted by current user (recruiters) — must be declared before "/:id"
router.get('/my-jobs', [
  authenticateToken,
  requireRole(['recruiter', 'admin'])
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: {
        recruiterId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job by ID
router.get('/:id', optionalAuthenticateToken, async (req, res) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Pending or deactivated jobs are only visible to the owner or an admin
    const isOwner = req.user && req.user.id === job.recruiterId;
    const isAdmin = req.user && req.user.role === 'admin';
    if ((!job.isApproved || !job.isActive) && !isOwner && !isAdmin) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Add isBookmarked and hasApplied flags if user is authenticated
    if (req.user) {
      const [bookmark, application] = await Promise.all([
        Bookmark.findOne({
          where: {
            userId: req.user.id,
            jobId: job.id
          }
        }),
        Application.findOne({
          where: {
            userId: req.user.id,
            jobId: job.id
          }
        })
      ]);

      job.dataValues.isBookmarked = !!bookmark;
      job.dataValues.hasApplied = !!application;
    }

    res.json({ job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Post new job (recruiters only)
router.post('/', [
  authenticateToken,
  requireRole('recruiter'),
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']).withMessage('Invalid job type'),
  body('experienceLevel').isIn(['entry', 'junior', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('salaryMin').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).withMessage('Invalid minimum salary'),
  body('salaryMax').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).withMessage('Invalid maximum salary'),
  body('salaryType').optional({ nullable: true, checkFalsy: true }).isIn(['hourly', 'monthly', 'yearly']).withMessage('Invalid salary type'),
  body('applicationDeadline').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().withMessage('Invalid deadline date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobData = {
      ...req.body,
      recruiterId: req.user.id,
      isActive: true,
      isApproved: req.user.role === 'admin' // Auto-approve if admin
    };

    const job = await Job.create(jobData);

    res.status(201).json({ job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job (owner or admin only)
router.put('/:id', [
  authenticateToken,
  requireRole(['recruiter', 'admin']),
  requireOwnership('Job'),
  body('title').optional().trim().notEmpty().withMessage('Job title is required'),
  body('description').optional().trim().notEmpty().withMessage('Job description is required'),
  body('company').optional().trim().notEmpty().withMessage('Company name is required'),
  body('location').optional().trim().notEmpty().withMessage('Location is required'),
  body('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']).withMessage('Invalid job type'),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('category').optional().trim().notEmpty().withMessage('Category is required'),
  body('salaryMin').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).withMessage('Invalid minimum salary'),
  body('salaryMax').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).withMessage('Invalid maximum salary'),
  body('salaryType').optional({ nullable: true, checkFalsy: true }).isIn(['hourly', 'monthly', 'yearly']).withMessage('Invalid salary type'),
  body('applicationDeadline').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().withMessage('Invalid deadline date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Only these fields can be edited via this endpoint
    const editable = [
      'title', 'description', 'requirements', 'responsibilities', 'company',
      'location', 'jobType', 'experienceLevel', 'category', 'industry',
      'salaryMin', 'salaryMax', 'salaryType', 'benefits', 'applicationDeadline'
    ];
    const updates = {};
    for (const key of editable) {
      if (req.body[key] !== undefined) updates[key] = req.body[key] === '' ? null : req.body[key];
    }

    // Admins may additionally toggle moderation flags
    if (req.user.role === 'admin') {
      if (req.body.isApproved !== undefined) updates.isApproved = !!req.body.isApproved;
      if (req.body.isActive !== undefined) updates.isActive = !!req.body.isActive;
    }

    await job.update(updates);

    res.json({ job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job (owner or admin only) - actually deactivates
router.delete('/:id', [
  authenticateToken,
  requireRole(['recruiter', 'admin']),
  requireOwnership('Job')
], async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await job.update({ isActive: false });

    res.json({ message: 'Job deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating job:', error);
    res.status(500).json({ error: 'Failed to deactivate job' });
  }
});

module.exports = router; 