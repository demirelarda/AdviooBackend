const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/tripsController');
const { verifyToken} = require("../middleware/verifyToken");

router.get('/compare',verifyToken,tripsController.getTripsComparison);

module.exports = router;
