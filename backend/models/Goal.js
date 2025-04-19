const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true,
    enum: [
      'Sustainable Travel',
      'Energy Conservation',
      'Waste Reduction',
      'Water Conservation',
      'Sustainable Food',
      'Eco-Friendly Shopping'
    ]
  },
  action: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  pointsEarned: {
    type: Number,
    default: 10
  }
});

module.exports = mongoose.model('Goal', goalSchema);
