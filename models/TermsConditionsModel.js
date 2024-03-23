const mongoose = require('mongoose');

const termsConditionsSchema = new mongoose.Schema({
  version: String,
  termsURL: String,
  addedOn: { type: Date, default: Date.now },
  shouldShowUpdatedTermsMessage: Boolean,
  updatedTermsMessage: String,
});

const TermsConditions = mongoose.model('TermsConditions', termsConditionsSchema);

module.exports = TermsConditions;
