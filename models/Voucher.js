const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  fseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fseName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  billFile: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Verified', 'Paid'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Voucher', VoucherSchema); 