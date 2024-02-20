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
    type: Date,
    required: true,
  }],
  endDate:{
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('CampaignRequirements', CampaignRequirementsSchema);
