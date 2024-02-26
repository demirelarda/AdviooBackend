const CampaignRequirements = require('../models/CampaignRequirements');
const cron = require('node-cron');
const admin = require('firebase-admin');



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
    const { campaignId, minKm, maxKm, startDate, durationInWeeks, maxCapacity } = req.body;

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
      ended: false,
      maxCapacity,
      enrolledUserCount: 0,
      enrolledUsers: []
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


exports.addUserIdAndUpdateUserCount = async (req, res) => {
  const { campaignId } = req.params;
  const { userId } = req.body;

  try {
    const campaign = await CampaignRequirements.findOne({ campaignId });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.enrolledUserCount >= campaign.maxCapacity) {
      return res.status(400).json({ message: 'Campaign has reached its maximum capacity' });
    }

    if (campaign.enrolledUsers.includes(userId)) {
      return res.status(400).json({ message: 'User already enrolled' });
    }

    const updatedCampaign = await CampaignRequirements.findOneAndUpdate(
      { campaignId },
      {
        $push: { enrolledUsers: userId },
        $inc: { enrolledUserCount: 1 }
      },
      { new: true }
    );

    if (updatedCampaign.enrolledUserCount >= updatedCampaign.maxCapacity) {
      // Update firestore document, change ended to true.
      const campaignsCollection = admin.firestore().collection('campaigns');
      await campaignsCollection.doc(campaignId).update({ ended: true });
      console.log(`Campaign ${campaignId} has reached its maximum capacity and marked as ended.`);
    }

    res.status(200).json({
      message: 'User added to campaign successfully',
      data: updatedCampaign
    });
  } catch (error) {
    console.error("Error updating campaign status in Firestore:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};

