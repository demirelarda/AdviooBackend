const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../middleware/verifyToken");
const {
    getCampaignRequirements,
    addCampaignRequirements
  } = require('../controllers/campaignRequirementsController');


  router.post('/addCampaignRequirement',verifyTokenAndAdmin,addCampaignRequirements)
  router.get('/getCampaignRequirements/:campaignId',verifyToken, getCampaignRequirements)


  module.exports = router