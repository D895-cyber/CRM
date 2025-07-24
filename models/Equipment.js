const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  serialNumber: { type: String, required: true },
  model: { type: String },
  warranty_status: { type: String, enum: ['In-warranty', 'Out-of-warranty'], required: true },
  warranty_expiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema); 