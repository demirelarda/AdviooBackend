const cron = require('node-cron');
const NotificationSchedule = require('../models/NotificationSchedule');
const Token = require('../models/Token');
const admin = require('firebase-admin');

// running everyday at 12
cron.schedule('5 22 * * *', async () => {
  console.log('Checking for notifications to send...');
  await checkAndSendNotifications();
});

async function checkAndSendNotifications() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // we only need to compare date

  const schedules = await NotificationSchedule.find({
    notificationDates: today
  });

  for (const schedule of schedules) {
    let message = '';
    switch (schedule.status) {
      case 'NONE':
        message = "After 2 days, don't forget to take the necessary actions and get paid!";
        schedule.status = 'NOTIFIED_ONCE';
        break;
      case 'NOTIFIED_ONCE':
        message = "Don't forget to take the necessary actions and get paid tomorrow!";
        schedule.status = 'NOTIFIED_TWICE';
        break;
      case 'NOTIFIED_TWICE':
        message = "You can get paid! Please do the verification as soon as possible.";
        schedule.status = 'NOTIFIED_THREE_TIMES';
        break;
      default:
        continue;
    }

    // Find user tokens and send notification to each user
    for (const userId of schedule.userIds) {
      const tokenDoc = await Token.findOne({ userId: userId });
      if (tokenDoc && tokenDoc.tokenList.length > 0) {
        sendFCMNotification(tokenDoc.tokenList, message);
      }
    }

    // Update Schedule document
    await schedule.save();
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
