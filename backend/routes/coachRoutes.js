const express = require('express');
const coachController = require('../controllers/coachController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// @route   POST api/coach
// @desc    Send message to coach and get response
// @access  Private
router.post('/', authMiddleware, coachController.sendMessage);

// @route   GET api/coach
// @desc    Get conversation history
// @access  Private
router.get('/', authMiddleware, coachController.getMessages);

module.exports = router;