const mongoose = require('mongoose');

const RMASchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  client: { type: String, required: true },
  equipment: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  statusUpdate: { type: String },
  requested: { type: Date, default: Date.now },
  replacement: { type: Date },
  inspected: { type: Boolean, default: false },
  inspectNotes: { type: String },
});

module.exports = mongoose.model('RMA', RMASchema); 