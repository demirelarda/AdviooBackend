const mongoose = require('mongoose');

const NotificationScheduleSchema = new mongoose.Schema({
  userIds: [{
    type: String,
    required: true,
  }],
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
  campaignId: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('NotificationSchedule', NotificationScheduleSchema);
