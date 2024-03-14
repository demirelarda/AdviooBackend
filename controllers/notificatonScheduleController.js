const NotificationSchedule = require('../models/NotificationSchedule');

exports.addNotificationSchedule = async (req, res) => {
  const { campaignId, userIds, notificationDates, status } = req.body;
  try {
    const newSchedule = new NotificationSchedule({
      userIds,
      notificationDates,
      status,
      campaignId
    });

    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getNotificationSchedule = async (req, res) => {
  const { campaignId } = req.params;
  
  try {
      const schedule = await NotificationSchedule.findOne({ campaignId: campaignId });
      if (schedule) {
          res.json(schedule);
      } else {
          res.status(404).send('NotificationSchedule not found');
      }
  } catch (error) {
      res.status(500).send('Server error');
  }
};

exports.deleteNotificationSchedule = async (req, res) => {
  const { campaignId } = req.params;
  try {
    const deletedSchedule = await NotificationSchedule.findOneAndDelete({ campaignId });
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateNotificationScheduleStatus = async (req, res) => {
  const { campaignId } = req.params;
  const { status } = req.body;
  try {
    const updatedSchedule = await NotificationSchedule.findOneAndUpdate(
      { campaignId },
      { status },
      { new: true }
    );
    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
