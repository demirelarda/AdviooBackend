const PaymentValues = require('../models/PaymentValues');


exports.getPaymentValues = async (req, res) => {
  try {
    const paymentValues = await PaymentValues.findOne().sort({ createdAt: -1 });
    if (!paymentValues) {
      return res.status(404).json({ message: 'Payment values not found' });
    }
    res.status(200).json(paymentValues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
