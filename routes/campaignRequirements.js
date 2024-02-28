const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../middleware/verifyToken");
const {
    getCampaignRequirements,
    addCampaignRequirements,
    editCampaignRequirements,
    addUserIdAndUpdateUserCount,
    getAllCampaignRequirements,
    deleteCampaignRequirements
  } = require('../controllers/campaignRequirementsController');


  router.post('/addCampaignRequirement',verifyTokenAndAdmin,addCampaignRequirements)
  router.get('/getCampaignRequirements/:campaignId',verifyToken, getCampaignRequirements)
  router.get('/getAllCampaignRequirements',verifyTokenAndAdmin,getAllCampaignRequirements)
  router.delete('/deleteCampaignRequirements/:campaignId',verifyTokenAndAdmin, deleteCampaignRequirements)
  router.patch('/editCampaignRequirements/:campaignId',verifyTokenAndAdmin,editCampaignRequirements)
  router.patch('/addUserIdAndUpdateUserCount/:campaignId',verifyToken,addUserIdAndUpdateUserCount)


  module.exports = router