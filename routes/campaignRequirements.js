const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../middleware/verifyToken");
const {
    getCampaignRequirements,
    addUserIdAndUpdateUserCount,
  } = require('../controllers/campaignRequirementsController');


  router.get('/getCampaignRequirements/:campaignId',verifyToken, getCampaignRequirements)
  router.patch('/addUserIdAndUpdateUserCount/:campaignId',verifyToken,addUserIdAndUpdateUserCount)


  module.exports = router