const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Goal = require('../models/Goal');
const QuizScore = require('../models/QuizScore');
const Activity = require('../models/Activity');

// Get profile info
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    const goals = await Goal.find({ userId: req.params.userId });
    const quizScores = await QuizScore.find({ userId: req.params.userId });
    const activity = await Activity.findOne({ userId: req.params.userId });

    res.json({ user, goals, quizScores, activity });
  } catch (error) {
    res.status(500).json({ message: 'Error loading profile', error });
  }
});

// Update user info
router.put('/:userId', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});

// Delete user + all related data
router.delete('/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    await Goal.deleteMany({ userId: req.params.userId });
    await QuizScore.deleteMany({ userId: req.params.userId });
    await Activity.deleteMany({ userId: req.params.userId });
    res.json({ message: 'User and related data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

module.exports = router;
