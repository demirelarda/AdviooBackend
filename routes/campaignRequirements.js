const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../middleware/verifyToken");
const {
    getCampaignRequirements,
    addCampaignRequirements,
    editCampaignRequirements
  } = require('../controllers/campaignRequirementsController');


  router.post('/addCampaignRequirement',verifyTokenAndAdmin,addCampaignRequirements)
  router.get('/getCampaignRequirements/:campaignId',verifyToken, getCampaignRequirements)
  router.patch('/editCampaignRequirements/:campaignId',verifyTokenAndAdmin,editCampaignRequirements)


  module.exports = router