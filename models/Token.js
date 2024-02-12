const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  userId:{
    type: String,
    unique:true,
    required:true
  },
  tokenList: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Token', TokenSchema);