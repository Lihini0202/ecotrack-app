// controllers/profileController.js
const User = require('../models/User');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const QuizScore = require('../models/QuizScore');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('firstName lastName email phone address');
    const goals = await Goal.find({ userId });
    const activity = await Activity.findOne({ userId }); // Only one doc for activities array
    const quizScores = await QuizScore.find({ userId });

    res.json({
      user,
      goals,
      activity: activity?.activities || [],
      quizScores
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
