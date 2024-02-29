const express = require('express');
const router = express.Router();
const { getPaymentValues } = require('../controllers/paymentValuesController');
const { verifyToken } = require("../middleware/verifyToken");

router.get('/paymentValues', verifyToken, getPaymentValues);

module.exports = router;
