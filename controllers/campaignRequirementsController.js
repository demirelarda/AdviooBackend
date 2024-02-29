const CampaignRequirements = require('../models/CampaignRequirements');
const cron = require('node-cron');
const admin = require('firebase-admin');



cron.schedule('0 0 * * *', async () => {
  console.log('Cron job running to check and update ended campaigns');
  const now = new Date();

  // Update in mongodb
  const campaignsToUpdate = await CampaignRequirements.find({
    endDate: { $lt: now },
    ended: false
  });

  if (campaignsToUpdate.length > 0) {
    for (const campaign of campaignsToUpdate) {
      // update in firestore
      const campaignsCollection = admin.firestore().collection('campaigns');
      await campaignsCollection.doc(campaign.campaignId).update({ ended: true });

      await CampaignRequirements.findOneAndUpdate(
        { campaignId: campaign.campaignId },
        { ended: true }
      );
    }
    console.log(`Updated ${campaignsToUpdate.length} campaigns to ended.`);
  } else {
    console.log('No campaigns to update.');
  }
});


cron.schedule('0 0 * * *', async () => {
  console.log('Cron job running to update currentPeriod for each campaign');

  const campaigns = await CampaignRequirements.find({ ended: false });

  campaigns.forEach(async (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const durationInDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const weeksPassed = Math.floor(durationInDays / 7);
    let currentPeriod = Math.floor(weeksPassed / 4) + 1; // increment by 1 every 4 week

    // update current period
    await CampaignRequirements.updateOne({ campaignId: campaign.campaignId }, { currentPeriod });
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
      // Update Firestore document, change ended to true
      const campaignsCollection = admin.firestore().collection('campaigns');
      await campaignsCollection.doc(campaignId).update({ ended: true });
      console.log(`Campaign ${campaignId} has reached its maximum capacity and marked as ended in Firestore.`);

      // Update MongoDB document, change ended to true
      await CampaignRequirements.findOneAndUpdate(
        { campaignId },
        { reachedLimit: true },
        { new: true }
      );
      console.log(`Campaign ${campaignId} has reached its maximum capacity and marked as reachedLimit in MongoDB.`);
    }

    res.status(200).json({
      message: 'User added to campaign successfully',
      data: updatedCampaign
    });
  } catch (error) {
    console.error("Error updating campaign status:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};


