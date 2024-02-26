const CampaignRequirements = require('../models/CampaignRequirements');

exports.getCampaignRequirements = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const campaignRequirements = await CampaignRequirements.findOne({ campaignId: campaignId });
    if (!campaignRequirements) {
      return res.status(404).json({ message: 'Campaign requirements not found' });
    }
    res.status(200).json(campaignRequirements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addCampaignRequirements = async (req, res) => {
  try {
    const newCampaignRequirements = new CampaignRequirements(req.body);
    const savedCampaignRequirements = await newCampaignRequirements.save();
    res.status(201).json({ message: 'Campaign requirements added successfully', data: savedCampaignRequirements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.editCampaignRequirements = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const updates = req.body;

    const updatedCampaignRequirements = await CampaignRequirements.findOneAndUpdate(
      { campaignId: campaignId },
      updates,
      { new: true }
    );

    if (!updatedCampaignRequirements) {
      return res.status(404).json({ message: 'Campaign requirements not found' });
    }

    res.status(200).json({ 
      message: 'Campaign requirements updated successfully', 
      data: updatedCampaignRequirements 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

