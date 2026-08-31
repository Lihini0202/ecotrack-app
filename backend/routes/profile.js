const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Goal = require('../models/Goal');
const QuizScore = require('../models/QuizScore');
const Activity = require('../models/Activity');
const authMiddleware = require('../utils/authMiddleware');

// Fields a user is allowed to change about themselves. Anything else in the
// request body is discarded. Notably absent: password, which would be written
// unhashed because findByIdAndUpdate does not run the schema's pre('save')
// hook, and ecoPoints, which is the app's scoring currency.
const UPDATABLE_FIELDS = ['firstName', 'lastName', 'phone', 'address'];

// Every route below is scoped to the authenticated user. The :userId in the
// path is retained for client compatibility, but it is verified against the
// token rather than trusted, so a caller can only ever read, modify or
// delete their own account.
router.use('/:userId', authMiddleware, (req, res, next) => {
  if (req.params.userId !== req.userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
});

// Get profile info
router.get('/:userId', async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [goals, quizScores, activity] = await Promise.all([
      Goal.find({ userId: req.userId }),
      QuizScore.find({ userId: req.userId }),
      Activity.findOne({ userId: req.userId })
    ]);

    res.json({ user, goals, quizScores, activity });
  } catch (err) {
    next(err);
  }
});

// Update user info
router.put('/:userId', async (req, res, next) => {
  try {
    const updates = {};
    for (const field of UPDATABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: `No updatable fields provided. Allowed: ${UPDATABLE_FIELDS.join(', ')}`
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Delete user + all related data
router.delete('/:userId', async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.userId);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Promise.all([
      Goal.deleteMany({ userId: req.userId }),
      QuizScore.deleteMany({ userId: req.userId }),
      Activity.deleteMany({ userId: req.userId })
    ]);

    res.json({ message: 'User and related data deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
