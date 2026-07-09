const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireOwnership } = require('../middleware/auth');
const { User, Skill, UserSkill, Bookmark, Job } = require('../models');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: ['proficiency', 'yearsOfExperience'] }
        }
      ]
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ min: 2, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('location').optional().trim().isLength({ max: 255 }),
  body('bio').optional().trim().isLength({ max: 1000 }),
  body('experience').optional().isIn(['entry', 'junior', 'mid', 'senior', 'executive']),
  body('expectedSalary').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.user.id);
    await user.update(req.body);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        experience: user.experience,
        expectedSalary: user.expectedSalary
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload resume
router.post('/resume', [
  authenticateToken,
  upload.single('resume')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findByPk(req.user.id);
    
    // Delete old resume if exists
    if (user.resumePath && fs.existsSync(user.resumePath)) {
      fs.unlinkSync(user.resumePath);
    }

    // Update user with new resume path
    await user.update({
      resumePath: req.file.path
    });

    res.json({
      message: 'Resume uploaded successfully',
      resumePath: req.file.path
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get user skills
router.get('/skills', authenticateToken, async (req, res) => {
  try {
    const userSkills = await UserSkill.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Skill,
          attributes: ['id', 'name', 'category', 'description']
        }
      ]
    });

    res.json({ skills: userSkills });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
});

// Add skill to user
router.post('/skills', [
  authenticateToken,
  body('skillId').isInt({ min: 1 }),
  body('proficiency').isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  body('yearsOfExperience').optional().isInt({ min: 0, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skillId, proficiency, yearsOfExperience } = req.body;

    // Check if skill exists
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Check if user already has this skill
    const existingUserSkill = await UserSkill.findOne({
      where: { userId: req.user.id, skillId }
    });

    if (existingUserSkill) {
      return res.status(400).json({ error: 'Skill already added to profile' });
    }

    // Add skill to user
    const userSkill = await UserSkill.create({
      userId: req.user.id,
      skillId,
      proficiency,
      yearsOfExperience
    });

    res.status(201).json({
      message: 'Skill added successfully',
      userSkill: {
        ...userSkill.toJSON(),
        skill: skill.toJSON()
      }
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

// Update user skill
router.put('/skills/:skillId', [
  authenticateToken,
  body('proficiency').isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  body('yearsOfExperience').optional().isInt({ min: 0, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skillId } = req.params;
    const { proficiency, yearsOfExperience } = req.body;

    const userSkill = await UserSkill.findOne({
      where: { userId: req.user.id, skillId }
    });

    if (!userSkill) {
      return res.status(404).json({ error: 'Skill not found in profile' });
    }

    await userSkill.update({ proficiency, yearsOfExperience });

    res.json({
      message: 'Skill updated successfully',
      userSkill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// Remove skill from user
router.delete('/skills/:skillId', authenticateToken, async (req, res) => {
  try {
    const { skillId } = req.params;

    const userSkill = await UserSkill.findOne({
      where: { userId: req.user.id, skillId }
    });

    if (!userSkill) {
      return res.status(404).json({ error: 'Skill not found in profile' });
    }

    await userSkill.destroy();

    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({ error: 'Failed to remove skill' });
  }
});

// Get user bookmarks
router.get('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: bookmarks } = await Bookmark.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'company', 'location', 'jobType', 'salaryMin', 'salaryMax', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      bookmarks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalBookmarks: count
      }
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

// Add bookmark
router.post('/bookmarks', [
  authenticateToken,
  body('jobId').isInt({ min: 1 }),
  body('notes').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, notes } = req.body;

    // Check if job exists
    const job = await Job.findOne({
      where: { id: jobId, isActive: true, isApproved: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      where: { userId: req.user.id, jobId }
    });

    if (existingBookmark) {
      return res.status(400).json({ error: 'Job already bookmarked' });
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      userId: req.user.id,
      jobId,
      notes
    });

    res.status(201).json({
      message: 'Job bookmarked successfully',
      bookmark: {
        ...bookmark.toJSON(),
        job: job.toJSON()
      }
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// Remove bookmark
router.delete('/bookmarks/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    const bookmark = await Bookmark.findOne({
      where: { userId: req.user.id, jobId }
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    await bookmark.destroy();

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Get user dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'seeker') {
      // Job seeker stats
      const totalApplications = await require('../models').Application.count({
        where: { userId: req.user.id }
      });

      const totalBookmarks = await Bookmark.count({
        where: { userId: req.user.id }
      });

      const profileCompletion = calculateProfileCompletion(req.user);

      stats = {
        totalApplications,
        totalBookmarks,
        profileCompletion
      };
    } else if (req.user.role === 'recruiter') {
      // Recruiter stats
      const totalJobs = await Job.count({
        where: { recruiterId: req.user.id }
      });

      const totalApplications = await require('../models').Application.count({
        include: [
          {
            model: Job,
            as: 'job',
            where: { recruiterId: req.user.id }
          }
        ]
      });

      const activeJobs = await Job.count({
        where: { recruiterId: req.user.id, isActive: true }
      });

      stats = {
        totalJobs,
        totalApplications,
        activeJobs
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(user) {
  let completed = 0;
  let total = 6; // Basic fields

  if (user.firstName) completed++;
  if (user.lastName) completed++;
  if (user.phone) completed++;
  if (user.location) completed++;
  if (user.bio) completed++;
  if (user.resumePath) completed++;

  return Math.round((completed / total) * 100);
}

module.exports = router; 