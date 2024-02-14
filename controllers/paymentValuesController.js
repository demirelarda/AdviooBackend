const PaymentValues = require('../models/PaymentValues');

// add new payment values, delete older ones
exports.addPaymentValues = async (req, res) => {
  try {
    // delete all payment values
    await PaymentValues.deleteMany({});

    // add new payment values document
    const newPaymentValues = new PaymentValues(req.body);
    await newPaymentValues.save();

    res.status(201).json({ message: 'Payment values added successfully', data: newPaymentValues });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


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
