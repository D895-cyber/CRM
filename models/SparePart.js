const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  // Basic Part Information
  partNumber: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Lamp", "Filter", "Lens", "Electronics"
  
  // Equipment Relationship
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  
  // Manufacturer Information
  manufacturer: { type: String, required: true },
  originalPartNumber: { type: String }, // Original manufacturer part number
  supplier: { type: String },
  supplierPartNumber: { type: String },
  
  // Usage Information
  quantityUsed: { type: Number, required: true, default: 1 },
  unitCost: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  
  // Installation Information
  installationDate: { type: Date, required: true },
  installedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  installationNotes: { type: String },
  
  // Replacement Information
  replacementReason: { 
    type: String, 
    enum: ['Preventive Maintenance', 'Corrective Maintenance', 'Failure', 'Upgrade', 'Other'],
    required: true 
  },
  failureDescription: { type: String }, // Detailed description if failed
  hoursOfUse: { type: Number }, // For parts like lamps that have hour ratings
  
  // Warranty Information
  warrantyStatus: { 
    type: String, 
    enum: ['Under Warranty', 'Out of Warranty', 'Extended Warranty'], 
    default: 'Under Warranty' 
  },
  warrantyStartDate: { type: Date },
  warrantyEndDate: { type: Date },
  warrantyProvider: { type: String },
  
  // Part Status
  status: { 
    type: String, 
    enum: ['Active', 'Failed', 'Replaced', 'Under RMA', 'Returned'], 
    default: 'Active' 
  },
  
  // Expected Lifecycle
  expectedLifespan: { type: Number }, // in hours or months
  expectedReplacementDate: { type: Date },
  
  // RMA Relationship (one-to-one)
  rma: { type: mongoose.Schema.Types.ObjectId, ref: 'RMA' },
  
  // Maintenance History
  maintenanceHistory: [{
    date: { type: Date, required: true },
    action: { type: String, required: true }, // "Installed", "Inspected", "Cleaned", "Replaced"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
    cost: { type: Number },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Technical Specifications
  specifications: {
    dimensions: { type: String },
    weight: { type: String },
    material: { type: String },
    compatibility: [String], // Compatible equipment models
    additionalSpecs: { type: String }
  },
  
  // Purchase Information
  purchaseDate: { type: Date },
  purchaseOrderNumber: { type: String },
  invoiceNumber: { type: String },
  
  // Notes and Documentation
  notes: { type: String },
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Created and Updated by
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for warranty status calculation
sparePartSchema.virtual('isWarrantyActive').get(function() {
  if (!this.warrantyEndDate) return false;
  return new Date() <= this.warrantyEndDate;
});

// Virtual for age calculation
sparePartSchema.virtual('ageInDays').get(function() {
  if (!this.installationDate) return 0;
  const now = new Date();
  const installation = new Date(this.installationDate);
  return Math.floor((now - installation) / (1000 * 60 * 60 * 24));
});

// Virtual for expected replacement status
sparePartSchema.virtual('needsReplacement').get(function() {
  if (!this.expectedReplacementDate) return false;
  return new Date() >= this.expectedReplacementDate;
});

// Virtual for total maintenance cost
sparePartSchema.virtual('totalMaintenanceCost').get(function() {
  return this.maintenanceHistory.reduce((total, maintenance) => total + (maintenance.cost || 0), 0);
});

// Pre-save middleware to calculate total cost
sparePartSchema.pre('save', function(next) {
  this.totalCost = this.quantityUsed * this.unitCost;
  next();
});

// Index for better query performance
sparePartSchema.index({ partNumber: 1 });
sparePartSchema.index({ equipment: 1 });
sparePartSchema.index({ status: 1 });
sparePartSchema.index({ category: 1 });
sparePartSchema.index({ installationDate: 1 });

module.exports = mongoose.model('SparePart', sparePartSchema); 