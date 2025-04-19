const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

// @route   GET api/news
// @desc    Get eco news
// @access  Public
router.get('/', newsController.getNews);

// @route   GET api/news/videos
// @desc    Get eco videos
// @access  Public
router.get('/videos', newsController.getVideos);

module.exports = router;