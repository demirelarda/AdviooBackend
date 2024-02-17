const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

router.get('/getYears', carController.getYears);
router.get('/getMakes/year=:year', carController.getMakes);
router.get('/getModels/', carController.getModels);

module.exports = router;
