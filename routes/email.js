const express = require('express');
const router = express.Router();
const installerEmailController = require('../controllers/installerEmailController');
const { verifyToken } = require("../middleware/verifyToken");


router.post('/send-email-to-installer', verifyToken ,installerEmailController.sendEmailToInstaller);

module.exports = router;
