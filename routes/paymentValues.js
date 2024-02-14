const express = require('express');
const router = express.Router();
const { addPaymentValues, getPaymentValues } = require('../controllers/paymentValuesController');
const { verifyToken, verifyTokenAndAdmin } = require("../middleware/verifyToken");


router.post('/paymentValues', verifyTokenAndAdmin, addPaymentValues);

router.get('/paymentValues', verifyToken, getPaymentValues);

module.exports = router;
