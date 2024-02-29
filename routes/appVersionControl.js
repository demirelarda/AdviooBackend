const express = require('express');
const router = express.Router();
const appVersionController = require('../controllers/appVersionController');


router.get('/checkVersion/:version', appVersionController.checkVersion);


module.exports = router;
