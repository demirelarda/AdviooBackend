const express = require('express');
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
  addNotificationSchedule,
  deleteNotificationSchedule,
  updateNotificationScheduleStatus,
  getNotificationSchedule
} = require('../controllers/notificatonScheduleController');

router.post('/addNotificationSchedule', verifyToken, addNotificationSchedule);

router.get('/getNotificationSchedule/:campaignApplicationId', verifyToken, getNotificationSchedule);

router.delete('/deleteNotificationSchedule/:campaignApplicationId', verifyToken, deleteNotificationSchedule);

router.patch('/updateNotificationScheduleStatus/:campaignApplicationId/status', verifyToken, updateNotificationScheduleStatus);

module.exports = router;
