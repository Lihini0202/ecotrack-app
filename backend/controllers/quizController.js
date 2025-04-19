const QuizScore = require('../models/QuizScore');
const User = require('../models/User');
const authMiddleware = require('../utils/authMiddleware');

// Save quiz score
exports.saveScore = async (req, res, next) => {
  try {
    const { score, totalQuestions } = req.body;
    const userId = req.userId;

    // Calculate points (10 points per correct answer)
    const pointsEarned = score * 10;

    // Save quiz score
    const newScore = new QuizScore({
      userId,
      score,
      totalQuestions
    });

    await newScore.save();

    // Update user's eco points
    await User.findByIdAndUpdate(userId, { $inc: { ecoPoints: pointsEarned } });

    res.status(201).json({ message: 'Score saved successfully', pointsEarned });
  } catch (err) {
    next(err);
  }
};

// Get quiz history
exports.getQuizHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const history = await QuizScore.find({ userId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    next(err);
  }
};

// Get educational tips
exports.getTips = async (req, res, next) => {
  try {
    const tips = [
      {
        id: 1,
        text: 'Did you know? Turning off lights saves energy!',
        icon: 'lightbulb-outline',
      },
      {
        id: 2,
        text: 'Recycling one aluminum can saves enough energy to run a TV for 3 hours!',
        icon: 'recycle',
      },
      {
        id: 3,
        text: 'Using a reusable water bottle can save up to 167 plastic bottles per year!',
        icon: 'local-drink',
      },
      {
        id: 4,
        text: 'Planting trees helps reduce carbon dioxide in the atmosphere.',
        icon: 'nature',
      },
      {
        id: 5,
        text: 'Composting food waste reduces methane emissions from landfills.',
        icon: 'compost',
      },
    ];

    res.json(tips);
  } catch (err) {
    next(err);
  }
};