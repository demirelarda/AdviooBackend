const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const admin = require('firebase-admin');


dotenv.config()

console.log(`Current time = ${new Date()}`);
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const fcmRoute = require('./routes/fcm');
const campaignRequirementsRoute = require('./routes/campaignRequirements')
const tripsRoute = require('./routes/tripsRoutes')

const authRoute = require('./routes/auth');
const appVersionRoute = require('./routes/appVersionControl')
const notificationScheduleRoute = require('./routes/notificationSchedule')
const currentTimeRoute = require('./routes/currentTime');
const paymentValuesRoute = require('./routes/paymentValues');
const carRoute = require('./routes/carRoutes')
const notificationController = require('./controllers/notificationController');



mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("connected to the db")).catch((err) => { console.log(err) });



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', authRoute);
app.use('/api/appVersion',appVersionRoute)
app.use('/api/fcm',fcmRoute);
app.use('/api/notificationSchedule',notificationScheduleRoute)
app.use('/api/',currentTimeRoute)
app.use('/api/',paymentValuesRoute)
app.use('/api/cars/',carRoute)
app.use('/api/campaignRequirements',campaignRequirementsRoute)
app.use('/api/checkPaymentStatus',tripsRoute)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);


  
});
