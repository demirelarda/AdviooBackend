const express = require('express');
const router = express.Router();
const appVersionController = require('../controllers/appVersionController');
const { verifyTokenAndAdmin } = require("../middleware/verifyToken");


router.get('/checkVersion/:version', appVersionController.checkVersion);
router.post('/updateVersion', verifyTokenAndAdmin ,appVersionController.updateVersion);


module.exports = router;
