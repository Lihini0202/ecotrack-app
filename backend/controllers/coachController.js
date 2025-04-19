const Message = require('../models/Message');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { generateEcoResponse } = require('../services/openaiService');
const authMiddleware = require('../utils/authMiddleware');

// Send message to coach and get response
exports.sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    // Save user message
    const userMessage = new Message({
      userId,
      text,
      sender: 'user'
    });
    await userMessage.save();

    // Get user context for better responses
    const user = await User.findById(userId);
    const activities = await Activity.findOne({ userId });
    const userContext = {
      ecoPoints: user.ecoPoints,
      activities: activities ? activities.activities.map(a => `${a.topic}: ${a.action}`) : []
    };

    // Generate AI response
    const aiResponse = await generateEcoResponse(text, userContext);

    // Save coach response
    const coachMessage = new Message({
      userId,
      text: aiResponse,
      sender: 'coach'
    });
    await coachMessage.save();

    res.json({ message: aiResponse });
  } catch (err) {
    next(err);
  }
};

// Get conversation history
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.userId;
    const messages = await Message.find({ userId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};