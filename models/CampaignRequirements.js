const mongoose = require('mongoose');

const CampaignRequirementsSchema = new mongoose.Schema({
  campaignId:{
    type: String,
    required: true,
    unique: true
  },
  minKm: {
    type: Number,
    required: true
  },
  maxKm:{
    type: Number,
    required: true
  },
  startDate:{
    type:Date,
    required:true
  },
  paymentDates: [{
    type: Date
  }],
  endDate:{
    type: Date,
  },
  durationInWeeks:{
    type: Number,
    required: true
  },
  ended:{
    type: Boolean,
    default: false
  },
  currentPeriod:{
    type: Number,
    default: 1
  },
  maxCapacity:{
    type: Number,
    required: true
  },
  enrolledUserCount:{
    type: Number,
    default: 0
  },
  enrolledUsers:[{
    type: String
  }],
});

module.exports = mongoose.model('CampaignRequirements', CampaignRequirementsSchema);
