const express = require('express');
const goalController = require('../controllers/goalController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// @route   POST api/goals
// @desc    Log a new eco-friendly activity
// @access  Private
router.post('/', authMiddleware, goalController.logActivity);

// @route   GET api/goals/activities
// @desc    Get user's activities
// @access  Private
router.get('/activities', authMiddleware, goalController.getActivities);

// @route   GET api/goals/progress
// @desc    Get user's progress
// @access  Private
router.get('/progress', authMiddleware, goalController.getProgress);

// @route   GET api/goals
// @desc    Get all logged goals
// @access  Private
router.get('/', authMiddleware, goalController.getGoals);

module.exports = router;