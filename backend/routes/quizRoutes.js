const express = require('express');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// @route   POST api/quiz/score
// @desc    Save quiz score
// @access  Private
router.post('/score', authMiddleware, quizController.saveScore);

// @route   GET api/quiz/history
// @desc    Get quiz history
// @access  Private
router.get('/history', authMiddleware, quizController.getQuizHistory);

// @route   GET api/quiz/tips
// @desc    Get educational tips
// @access  Public
router.get('/tips', quizController.getTips);

module.exports = router;