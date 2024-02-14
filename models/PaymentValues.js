const mongoose = require('mongoose');

const PaymentValues = new mongoose.Schema({
  lightPaymentCoef:{
    type: Number,
    required:true
  },
  proPaymentCoef: {
    type: Number,
    required: true
  },
  dayStartTime: {
    type: String,
    required: true
  },
  dayEndTime:{
    type: String,
    required: true
  },
  isNightPaymentAvailable:{
    type: Boolean,
    default: false
  },
  nightPaymentCoef:{
    type: Number,
    default: 0
  },
  isDrivingAvailable:{
    type: Boolean,
    default: true
  },
  createdAt:{
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('PaymentValues', PaymentValues);