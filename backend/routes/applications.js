const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken, requireRole, requireOwnership } = require('../middleware/auth');
const { Application, Job, User, Notification } = require('../models');

const router = express.Router();

// Apply for a job
router.post('/', [
  authenticateToken,
  requireRole('seeker'),
  body('jobId').isInt({ min: 1 }),
  body('coverLetter').optional().trim().isLength({ max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, coverLetter } = req.body;

    // Check if job exists and is active
    const job = await Job.findOne({
      where: { 
        id: jobId,
        isActive: true,
        isApproved: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or inactive' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      where: { userId: req.user.id, jobId }
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Check if user has resume uploaded
    if (!req.user.resumePath) {
      return res.status(400).json({ error: 'Please upload your resume before applying' });
    }

    // Create application
    const application = await Application.create({
      userId: req.user.id,
      jobId,
      coverLetter
    });

    // Increment job applications count
    await job.increment('applicationsCount');

    // Create notification for recruiter
    await Notification.create({
      userId: job.recruiterId,
      type: 'application_update',
      title: 'New Job Application',
      message: `${req.user.getFullName()} has applied for your job: ${job.title}`,
      data: {
        applicationId: application.id,
        jobId: job.id,
        applicantId: req.user.id
      }
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        ...application.toJSON(),
        job: {
          id: job.id,
          title: job.title,
          company: job.company
        }
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get user's applications
router.get('/my-applications', [
  authenticateToken,
  requireRole('seeker')
], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'company', 'location', 'jobType', 'salaryMin', 'salaryMax']
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalApplications: count
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Get applications for a specific job (recruiters only)
router.get('/job/:jobId', [
  authenticateToken,
  requireRole('recruiter')
], async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Verify job ownership
    const job = await Job.findOne({
      where: { id: jobId, recruiterId: req.user.id }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or access denied' });
    }

    const whereClause = { jobId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'resumePath', 'experience']
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalApplications: count
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Update application status (recruiters only)
router.put('/:id/status', [
  authenticateToken,
  requireRole('recruiter'),
  body('status').isIn(['applied', 'under_review', 'shortlisted', 'interviewed', 'rejected', 'hired']),
  body('notes').optional().trim().isLength({ max: 1000 }),
  body('interviewDate').optional().isISO8601(),
  body('interviewType').optional().isIn(['phone', 'video', 'onsite'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes, interviewDate, interviewType } = req.body;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Job,
          as: 'job',
          where: { recruiterId: req.user.id }
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found or access denied' });
    }

    // Update application
    await application.updateStatus(status, notes);
    
    if (interviewDate) {
      await application.update({ interviewDate, interviewType });
    }

    // Create notification for applicant
    await Notification.create({
      userId: application.userId,
      type: 'application_update',
      title: 'Application Status Updated',
      message: `Your application for ${application.job.title} has been updated to: ${status}`,
      data: {
        applicationId: application.id,
        jobId: application.job.id,
        status: status
      }
    });

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Withdraw application (applicants only)
router.post('/:id/withdraw', [
  authenticateToken,
  requireRole('seeker')
], async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findOne({
      where: { id, userId: req.user.id }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.isWithdrawn) {
      return res.status(400).json({ error: 'Application already withdrawn' });
    }

    await application.withdraw();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

// Get application statistics
router.get('/stats', [
  authenticateToken
], async (req, res) => {
  try {
    let stats;

    if (req.user.role === 'seeker') {
      // Applicant stats
      const totalApplications = await Application.count({
        where: { userId: req.user.id }
      });

      const statusCounts = await Application.findAll({
        where: { userId: req.user.id },
        attributes: ['status', [Application.sequelize.fn('COUNT', Application.sequelize.col('status')), 'count']],
        group: ['status']
      });

      stats = {
        totalApplications,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = parseInt(item.dataValues.count);
          return acc;
        }, {})
      };
    } else if (req.user.role === 'recruiter') {
      // Recruiter stats
      const totalApplications = await Application.count({
        include: [
          {
            model: Job,
            as: 'job',
            where: { recruiterId: req.user.id }
          }
        ]
      });

      const statusCounts = await Application.findAll({
        include: [
          {
            model: Job,
            as: 'job',
            where: { recruiterId: req.user.id }
          }
        ],
        attributes: ['status', [Application.sequelize.fn('COUNT', Application.sequelize.col('status')), 'count']],
        group: ['status']
      });

      stats = {
        totalApplications,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = parseInt(item.dataValues.count);
          return acc;
        }, {})
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ error: 'Failed to get application statistics' });
  }
});

module.exports = router; 