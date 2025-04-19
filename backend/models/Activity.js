const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activities: [{
    topic: String,
    action: String,
    date: Date
  }],
  monthlyGoal: {
    type: Number,
    default: 30
  }
});

module.exports = mongoose.model('Activity', activitySchema);