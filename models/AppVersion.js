const mongoose = require('mongoose');

const AppVersionSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true
  },
  critical: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
});

module.exports = mongoose.model('AppVersion', AppVersionSchema);
