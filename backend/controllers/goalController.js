const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const User = require('../models/User');
const authMiddleware = require('../utils/authMiddleware');

// Log a new eco-friendly activity
exports.logActivity = async (req, res, next) => {
  try {
    const { topic, action } = req.body;
    const userId = req.userId;

    // Create new goal log
    const newGoal = new Goal({
      userId,
      topic,
      action
    });

    await newGoal.save();

    // Update user's activities
    let activity = await Activity.findOne({ userId });
    if (!activity) {
      activity = new Activity({ userId, activities: [] });
    }

    activity.activities.push({
      topic,
      action,
      date: new Date()
    });

    await activity.save();

    // Update user's eco points
    await User.findByIdAndUpdate(userId, { $inc: { ecoPoints: 10 } });

    res.status(201).json(newGoal);
  } catch (err) {
    next(err);
  }
};

// Get user's activities
exports.getActivities = async (req, res, next) => {
  try {
    const userId = req.userId;
    const activities = await Activity.findOne({ userId });

    if (!activities) {
      return res.json({ activities: [], monthlyGoal: 30 });
    }

    res.json(activities);
  } catch (err) {
    next(err);
  }
};

// Get user's progress
exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.userId;
    const activities = await Activity.findOne({ userId });

    if (!activities) {
      return res.json({ progress: 0, monthlyGoal: 30 });
    }

    const progress = (activities.activities.length / activities.monthlyGoal) * 100;
    res.json({ progress: Math.min(progress, 100), monthlyGoal: activities.monthlyGoal });
  } catch (err) {
    next(err);
  }
};

// Get all logged goals
exports.getGoals = async (req, res, next) => {
  try {
    const userId = req.userId;
    const goals = await Goal.find({ userId }).sort({ date: -1 });
    res.json(goals);
  } catch (err) {
    next(err);
  }
};