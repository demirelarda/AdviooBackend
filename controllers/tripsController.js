const CampaignRequirements = require('../models/CampaignRequirements');
const admin = require('firebase-admin');
const db = admin.firestore();

async function getTripsData(campaignApplicationId, userId) {
    try {
        const tripsCollection = db.collection('trips');
        const snapshot = await tripsCollection
          .where('campaignApplicationId', '==', campaignApplicationId)
          .where('driverId', '==', userId)
          .get();
    
        if (snapshot.empty) {
          console.log('No matching documents.');
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

async function compareTripsWithRequirements(campaignApplicationId, userId) {
  const tripsData = await getTripsData(campaignApplicationId, userId);
  if (tripsData.length === 0) {
      return {
        error: "No trips data found for the given campaignApplicationId and userId."
      };
  }
  const firstTripCampaignId = tripsData[0].campaignId;
  const campaignRequirements = await CampaignRequirements.findOne({ campaignId: firstTripCampaignId });

  let totalKmDriven = 0;
  let totalEarnedPayment = 0;

  tripsData.forEach(trip => {
    totalKmDriven += trip.kmDriven;
    totalEarnedPayment += trip.earnedPayment;
  });

  const reachedMinKM = totalKmDriven >= campaignRequirements.minKm;
  const kmDifference = reachedMinKM ? 0 : campaignRequirements.minKm - totalKmDriven;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPaymentDay = campaignRequirements.paymentDates.some(date => 
    new Date(date).setHours(0, 0, 0, 0) === today.getTime()
  );

  return {
    reachedMinKM,
    kmDifference,
    isPaymentDay,
    paymentDates: campaignRequirements.paymentDates.map(date => date.toISOString()),
    totalKmDriven,
    totalEarnedPayment
  };
}


exports.getTripsComparison = async (req, res) => {
  try {
    const { campaignApplicationId, userId } = req.query;
    const result = await compareTripsWithRequirements(campaignApplicationId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
