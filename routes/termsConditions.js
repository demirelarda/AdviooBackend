const express = require('express');
const router = express.Router();
const termsConditionsController = require('../controllers/termsConditionsController');

router.post('/accept-terms-conditions', termsConditionsController.acceptTermsConditions);

router.get('/get-terms-conditions', termsConditionsController.getTermsConditions);


module.exports = router;
