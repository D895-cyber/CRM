const mongoose = require('mongoose');

const masterSparePartSchema = new mongoose.Schema({
  // Basic Part Information
  partNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Lamp', 'Board', 'Fan', 'Filter', 'Lens', 'Electronics', 'Mechanical', 'Optical', 'Other'],
    required: true 
  },
  model: { type: String, required: true },
  version: { type: String },
  
  // Inventory Information
  availableQuantity: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number },
  reorderThreshold: { type: Number, default: 5 },
  reorderQuantity: { type: Number, default: 10 },
  
  // Compatibility Information
  compatibilityInfo: [{
    equipmentModel: { type: String },
    equipmentType: { type: String },
    notes: { type: String }
  }],
  
  // Status
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Discontinued'], 
    default: 'Active' 
  },
  
  // Supplier/Manufacturer Information
  supplier: { type: String },
  manufacturer: { type: String },
  supplierPartNumber: { type: String },
  
  // Location Information (for future warehouse integration)
  warehouseLocation: { type: String },
  shelfLocation: { type: String },
  
  // Technical Specifications
  specifications: {
    dimensions: { type: String },
    weight: { type: String },
    material: { type: String },
    powerRating: { type: String },
    voltage: { type: String },
    additionalSpecs: { type: String }
  },
  
  // Usage Tracking
  totalUsed: { type: Number, default: 0 },
  lastUsedDate: { type: Date },
  
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

// Virtual for low stock status
masterSparePartSchema.virtual('isLowStock').get(function() {
  return this.availableQuantity <= this.reorderThreshold;
});

// Virtual for out of stock status
masterSparePartSchema.virtual('isOutOfStock').get(function() {
  return this.availableQuantity === 0;
});

// Virtual for total value
masterSparePartSchema.virtual('totalValue').get(function() {
  return this.availableQuantity * (this.unitPrice || 0);
});

// Index for better query performance
masterSparePartSchema.index({ category: 1 });
masterSparePartSchema.index({ status: 1 });
masterSparePartSchema.index({ availableQuantity: 1 });

module.exports = mongoose.model('MasterSparePart', masterSparePartSchema); 