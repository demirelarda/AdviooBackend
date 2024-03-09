const CampaignRequirements = require('../models/CampaignRequirements');
const cron = require('node-cron');
const admin = require('firebase-admin');


// Cron job to update currentPeriod for each campaign
cron.schedule('0 10 * * *', async () => {
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


// Cron job to check and update CampaignRequirements based on endDate
cron.schedule('5 0 * * *', async () => {
  console.log('Running cron job to check and update CampaignRequirements based on endDate');
  const now = new Date();

  const campaignsToUpdate = await CampaignRequirements.find({
    endDate: { $lte: now },
    status: 'OPERATING'
  });

  for (const campaign of campaignsToUpdate) {
    await CampaignRequirements.findByIdAndUpdate(campaign._id, {
      status: 'FINISHED_STILL_HAS_TIME_FOR_PAYMENT'
    });
  }
}, {
  scheduled: true,
  timezone: "GMT"
});


// Cron job to check and update CampaignRequirements based on lastPaymentDate
cron.schedule('3 0 * * *', async () => {
  console.log('Running cron job to check and update CampaignRequirements based on lastPaymentDate');
  const now = new Date();

  // Get all CampaignRequirements that should be marked as finished
  const campaignsToUpdate = await CampaignRequirements.find({
    lastPaymentDate: { $lte: now },
    status: 'FINISHED_STILL_HAS_TIME_FOR_PAYMENT'
  });

  const campaignsCollection = admin.firestore().collection('campaigns');
  const campaignApplicationsCollection = admin.firestore().collection('campaignApplications');
  const usersCollection = admin.firestore().collection('users');

  for (const campaign of campaignsToUpdate) {
    // Update CampaignRequirements status in MongoDB
    await CampaignRequirements.findByIdAndUpdate(campaign._id, {
      status: 'FINISHED_COMPLETELY'
    });

    // Update the 'ended' field in the Firestore campaigns collection
    await campaignsCollection.doc(campaign.campaignId).update({ ended: true });

    // Update related campaign applications in Firestore
    const campaignAppsSnapshot = await campaignApplicationsCollection.where('campaignId', '==', campaign.campaignId).get();
    campaignAppsSnapshot.forEach(async doc => {
      await campaignApplicationsCollection.doc(doc.id).update({ ended: true, status: 9 });
    });

    // Update user documents in Firestore
    for (const userId of campaign.enrolledUsers) {
      await usersCollection.doc(userId).update({
        currentCampaignApplicationId: "",
        currentEnrolledCampaign: ""
      });
    }
  }

  console.log('CampaignRequirements update based on lastPaymentDate completed.');
}, {
  scheduled: true,
  timezone: "GMT"
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


