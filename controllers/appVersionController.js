const AppVersion = require('../models/AppVersion');


const checkVersion = async (req, res) => {
    try {
      const clientVersion = req.params.version;
      const latestVersion = await AppVersion.findOne();
  
      if (!latestVersion) {
        return res.status(404).json({ message: 'Version information not found' });
      }
  
      const updateRequired = clientVersion !== latestVersion.version;
  
      res.status(200).json({
        update: updateRequired,
        latestVersion: latestVersion.version,
        critical: latestVersion.critical,
        message: latestVersion.message
      });
  
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  

const updateVersion = async (req, res) => {
    try {
      const { version, critical, message } = req.body;
      const updatedVersion = await AppVersion.findOneAndUpdate({}, {
        version,
        critical,
        message
      }, { new: true, upsert: true });
  
      res.status(200).json({
        message: 'Version updated successfully',
        data: updatedVersion
      });
  
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

module.exports = {
  checkVersion,
  updateVersion
}
