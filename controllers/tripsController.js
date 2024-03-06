const CampaignRequirements = require('../models/CampaignRequirements');
const admin = require('firebase-admin');
const db = admin.firestore();

async function getTripsData(campaignApplicationId, userId, paymentPeriod) {
  try {
    const tripsCollection = db.collection('trips');
    const snapshot = await tripsCollection
      .where('campaignApplicationId', '==', campaignApplicationId)
      .where('driverId', '==', userId)
      .where('paymentPeriod', '==', paymentPeriod)
      .get();

    if (snapshot.empty) {
      console.log('No matching documents for the specific period.');
      return [];
    }

    let tripsData = [];
    snapshot.forEach(doc => {
      tripsData.push(doc.data());
    });

    return tripsData;
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw error;
  }
}

async function compareTripsWithRequirements(campaignApplicationId, userId, campaignId) {
  const campaignRequirements = await CampaignRequirements.findOne({ campaignId });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let paymentPeriodToCheck = campaignRequirements.currentPeriod;
  
  // check if it's a payment day or not
  const matchingPaymentDate = campaignRequirements.paymentDates.find(paymentDate =>
    new Date(paymentDate.date).setHours(0, 0, 0, 0) === today.getTime()
  );

  if (matchingPaymentDate) {
    paymentPeriodToCheck = matchingPaymentDate.period;
  }

  const tripsData = await getTripsData(campaignApplicationId, userId, paymentPeriodToCheck);

  if (tripsData.length === 0) {
    return {
      error: "No trips data found for the given campaignApplicationId, userId, and payment period."
    };
  }

  let totalKmDriven = 0;
  let totalEarnedPayment = 0;

  tripsData.forEach(trip => {
    totalKmDriven += trip.kmDriven;
    totalEarnedPayment += trip.earnedPayment;
  });

  const reachedMinKM = totalKmDriven >= campaignRequirements.minKm;
  const kmDifference = reachedMinKM ? 0 : campaignRequirements.minKm - totalKmDriven;
  const isPaymentDay = !!matchingPaymentDate;

  return {
    reachedMinKM,
    kmDifference,
    isPaymentDay,
    paymentDates: campaignRequirements.paymentDates.map(paymentDate => ({
      date: paymentDate.date.toISOString(),
      period: paymentDate.period
    })),
    totalKmDriven,
    totalEarnedPayment
  };
}



exports.getTripsComparison = async (req, res) => {
  try {
    const { campaignApplicationId, userId, campaignId } = req.query;
    const result = await compareTripsWithRequirements(campaignApplicationId, userId, campaignId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
