const express = require('express');
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
    getCampaignRequirements,
    addUserIdAndUpdateUserCount,
    updateUserNotificationStatus
  } = require('../controllers/campaignRequirementsController');


  router.get('/getCampaignRequirements/:campaignId',verifyToken, getCampaignRequirements)
  router.patch('/addUserIdAndUpdateUserCount/:campaignId',verifyToken,addUserIdAndUpdateUserCount)
  router.post('/updateUserNotificationStatus',verifyToken,updateUserNotificationStatus)

  module.exports = router