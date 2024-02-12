const Token = require('../models/Token');

exports.addToken = async (req, res) => {
    const { userId, fcmToken } = req.body;
  
    try {
      let tokenDoc = await Token.findOne({ userId: userId });
  
      if (!tokenDoc) {
        tokenDoc = new Token({
          userId: userId,
          tokenList: [fcmToken] 
        });
      } else {
        if(!tokenDoc.tokenList.includes(fcmToken)){
          tokenDoc.tokenList.push(fcmToken);
        }
      }
  
      await tokenDoc.save();
      res.status(200).json({
        success: true,
        message: 'Token added successfully',
        tokenList: tokenDoc.tokenList
      });
  
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };
  

exports.getTokens = async (req, res) => {
  const { userId } = req.body;

  try {
    const tokenDoc = await Token.findOne({ userId: userId });

    if (!tokenDoc) {
      return res.status(404).json({ success: false, message: 'Tokens not found for the given UserID' });
    }

    res.status(200).json({ success: true, tokens: tokenDoc.tokenList });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteOldToken = async (req, res) => {
  const { userId, oldToken } = req.body;

  if (!oldToken) {
      return res.status(400).json({ success: false, message: 'oldToken is required.' });
  }

  try {
      const tokenDoc = await Token.findOne({ userId: userId });

      if (!tokenDoc) {
          return res.status(404).json({ success: false, message: 'Document not found for the given UserID' });
      }

      const tokenIndex = tokenDoc.tokenList.indexOf(oldToken);
      if (tokenIndex !== -1) {
          tokenDoc.tokenList.splice(tokenIndex, 1);
          await tokenDoc.save();
      }

      res.status(200).json({ success: true, message: 'Token removed successfully', tokens: tokenDoc.tokenList });

  } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error' });
  }
};