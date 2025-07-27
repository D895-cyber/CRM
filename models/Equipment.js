const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  serialNumber: { type: String, required: true },
  model: { type: String },
  warranty_status: { type: String, enum: ['In-warranty', 'Out-of-warranty'], required: true },
  warranty_expiry: { type: Date },
  ew_status: { type: String, enum: ['Active', 'Expired', 'Pending'], default: 'Pending' },
  ew_expiry: { type: Date },
  ew_history: [{
    renewal_date: Date,
    renewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ew_expiry: Date,
    notes: String
  }],
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema); 