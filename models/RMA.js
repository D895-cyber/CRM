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
  // New fields for enhanced RMA management
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  contactPerson: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  serialNumber: { type: String },
  modelNumber: { type: String },
  warrantyStatus: { 
    type: String, 
    enum: ['Under Warranty', 'Out of Warranty', 'Extended Warranty'], 
    default: 'Under Warranty' 
  },
  // Timestamps for better tracking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
RMASchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('RMA', RMASchema); 