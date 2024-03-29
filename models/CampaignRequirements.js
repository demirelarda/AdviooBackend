const mongoose = require('mongoose');

const CampaignRequirementsSchema = new mongoose.Schema({
  campaignId: {
    type: String,
    required: true,
    unique: true
  },
  minKm: {
    type: Number,
    required: true
  },
  maxKm: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  paymentDates: [{
    date: {
      type: Date,
      required: true
    },
    period: {
      type: Number,
      required: true
    }
  }],
  endDate: {
    type: Date,
  },
  durationInWeeks: {
    type: Number,
    required: true
  },
  ended: {
    type: Boolean,
    default: false
  },
  currentPeriod: {
    type: Number,
    default: 1
  },
  maxCapacity: {
    type: Number,
    required: true
  },
  enrolledUserCount: {
    type: Number,
    default: 0
  },
  enrolledUsers: [{
    userId: { type: String, required: true },
    shouldSendNotification: { type: Boolean, default: true }
  }],
  reachedLimit: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['NOT_STARTED_YET','OPERATING', 'FINISHED_COMPLETELY', 'FINISHED_STILL_HAS_TIME_FOR_PAYMENT'],
    default: 'NOT_STARTED_YET'
  },
  lastPaymentDate: {
    type: Date
  },
  lastPaymentDates:[{
    type: Date,
  }],
  lastApplicationDate: {
    type: Date
  },
  requiredPhotos: [{
    photoName: { type: String, required: true },
    photoCommand: { type: String, required: true }
  }],
  requiredPaymentPhotos: [{
    photoName: { type: String, required: true },
    photoCommand: { type: String, required: true }
  }],
  requiredBeginningPhotos: [{
    photoName: { type: String, required: true },
    photoCommand: { type: String, required: true }
  }]
});

module.exports = mongoose.model('CampaignRequirements', CampaignRequirementsSchema);
