const cron = require('node-cron');
const Token = require('../models/Token');
const admin = require('firebase-admin');
const CampaignRequirements = require('../models/CampaignRequirements');


cron.schedule('52 1 * * *', async () => {
  console.log('Checking for notifications to send at:', new Date().toISOString());
  await checkAndSendNotifications();
});

async function checkAndSendNotifications() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const campaigns = await CampaignRequirements.find({ ended: false });

  for (const campaign of campaigns) {
    for (const paymentDateObj of campaign.paymentDates) {
      const paymentDate = new Date(paymentDateObj.date);
      paymentDate.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let message = '';

      if (paymentDate.getTime() === tomorrow.getTime()) {
        message = "Don't forget to take the necessary actions and get paid tomorrow!";
      } else if (paymentDate.getTime() === today.getTime()) {
        message = "You can get paid! Please do the verification as soon as possible.";
      } else {
        continue;
      }

      for (const user of campaign.enrolledUsers.filter(u => u.shouldSendNotification)) {
        const tokenDoc = await Token.findOne({ userId: user.userId });
        if (tokenDoc && tokenDoc.tokenList.length > 0) {
          console.log(`Sending notification to userId ${user.userId} with tokens: ${tokenDoc.tokenList.join(', ')}`);
          sendFCMNotification(tokenDoc.tokenList, message);
        } else {
          console.log(`No tokens found or empty token list for userId: ${user.userId}`);
        }
      }
    }
  }
}

function sendFCMNotification(tokens, message) {
  const payload = {
    notification: {
      title: 'Payment Reminder',
      body: message
    }
  };

  admin.messaging().sendToDevice(tokens, payload)
    .then(response => {
      console.log('Successfully sent notification:', response);
    })
    .catch(error => {
      console.log('Error sending notification:', error);
    });
}
