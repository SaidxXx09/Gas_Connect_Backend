const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, default: 'kushki' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'approved', 'declined', 'error', 'refunded'], default: 'pending' },
  ticketNumber: String,
  transactionReference: String,
  processorCode: String,
  providerResponse: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
