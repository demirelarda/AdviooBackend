const mongoose = require('mongoose');

const NotificationScheduleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  notificationDates: [{
    type: Date,
    required: true,
  }],
  status: {
    type: String,
    enum: ['NONE', 'NOTIFIED_ONCE', 'NOTIFIED_TWICE', 'NOTIFIED_THREE_TIMES'],
    default: 'NONE',
    required: true,
  },
  campaignApplicationId: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('NotificationSchedule', NotificationScheduleSchema);
