const CampaignRequirements = require('../models/CampaignRequirements');
const cron = require('node-cron');



cron.schedule('0 0 * * *', async () => {
  console.log('Cron job running to check and update ended campaigns');
  const now = new Date();
  await CampaignRequirements.updateMany({ endDate: { $lt: now }, ended: false }, { ended: true });
});



cron.schedule('0 0 * * *', async () => {
  console.log('Cron job running to update currentPeriod for each campaign');

  const campaigns = await CampaignRequirements.find({ ended: false });

  campaigns.forEach(async (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const durationInDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const weeksPassed = Math.floor(durationInDays / 7);
    let currentPeriod = Math.floor(weeksPassed / 4) + 1; // increment by 1 every week

    // update current period
    await CampaignRequirements.updateOne({ _id: campaign._id }, { currentPeriod });
  });
});



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
    const { campaignId, minKm, maxKm, startDate, durationInWeeks } = req.body;

    if (durationInWeeks < 4) {
      return res.status(400).json({ message: 'Duration in weeks must be at least 4 weeks' });
    }

    const endDate = new Date(new Date(startDate).getTime() + durationInWeeks * 7 * 24 * 60 * 60 * 1000);
    const paymentDates = [];
    for (let week = 4; week <= durationInWeeks; week += 4) {
      let paymentStartDate = new Date(new Date(startDate).getTime() + week * 7 * 24 * 60 * 60 * 1000);
      for (let day = 0; day < 3; day++) {
        paymentDates.push(new Date(paymentStartDate.getTime() + day * 24 * 60 * 60 * 1000));
      }
    }

    const newCampaignRequirements = new CampaignRequirements({
      campaignId,
      minKm,
      maxKm,
      startDate: new Date(startDate),
      endDate,
      durationInWeeks,
      paymentDates,
      currentPeriod: 1,
      ended: false
    });

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

