const mongoose = require('mongoose');

const RMASchema = new mongoose.Schema({
  // Basic RMA Information
  caseNumber: { type: String, required: true, unique: true },
  rmaType: { 
    type: String, 
    enum: ['Equipment', 'Spare Part', 'Component'], 
    required: true 
  },
  
  // Equipment and Spare Part Relationships
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  sparePart: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart' },
  
  // Client Information
  client: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  
  // Part Information (for spare part RMAs)
  partNumber: { type: String },
  partName: { type: String },
  partDescription: { type: String },
  partSerialNumber: { type: String },
  
  // Equipment Information (for equipment RMAs)
  equipmentSerialNumber: { type: String },
  equipmentModel: { type: String },
  equipmentType: { type: String },
  
  // Issue Information
  reason: { type: String, required: true },
  failureDescription: { type: String },
  failureDate: { type: Date },
  failureSymptoms: [String], // Array of symptoms
  failureCategory: { 
    type: String, 
    enum: ['Hardware Failure', 'Software Issue', 'Wear and Tear', 'Manufacturing Defect', 'Installation Error', 'Environmental Damage', 'Other']
  },
  
  // RMA Status and Updates
  status: { type: String, default: 'Pending' },
  statusUpdate: { type: String },
  statusHistory: [{
    status: { type: String, required: true },
    update: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }],
  
  // Dates
  requested: { type: Date, default: Date.now },
  replacement: { type: Date },
  returnDate: { type: Date },
  expectedResolutionDate: { type: Date },
  
  // Inspection and Resolution
  inspected: { type: Boolean, default: false },
  inspectNotes: { type: String },
  inspectionDate: { type: Date },
  inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Replacement Information
  replacementPartNumber: { type: String },
  replacementPartName: { type: String },
  replacementSerialNumber: { type: String },
  replacementCost: { type: Number },
  replacementWarranty: { type: String },
  
  // Vendor Information
  vendor: { type: String },
  vendorContact: { type: String },
  vendorPhone: { type: String },
  vendorEmail: { type: String },
  vendorResponse: { type: String },
  vendorResponseDate: { type: Date },
  vendorTrackingNumber: { type: String },
  
  // Shipping Information
  shippingMethod: { type: String },
  shippingTrackingNumber: { type: String },
  shippingCost: { type: Number },
  returnShippingTrackingNumber: { type: String },
  
  // Financial Information
  totalCost: { type: Number },
  laborCost: { type: Number },
  partsCost: { type: Number },
  shippingCost: { type: Number },
  warrantyCoverage: { type: String },
  
  // Priority and Classification
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  impact: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Contact Information
  contactPerson: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  
  // Additional Fields from Previous Model
  serialNumber: { type: String },
  modelNumber: { type: String },
  warrantyStatus: { 
    type: String, 
    enum: ['Under Warranty', 'Out of Warranty', 'Extended Warranty'], 
    default: 'Under Warranty' 
  },
  
  // Notes and Documentation
  notes: { type: String },
  internalNotes: { type: String }, // Notes not visible to client
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Resolution Information
  resolution: { type: String },
  resolutionDate: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerSatisfaction: { 
    type: String, 
    enum: ['Satisfied', 'Neutral', 'Dissatisfied', 'Not Rated']
  },
  
  // Created and Updated by
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for RMA age
RMASchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const requested = new Date(this.requested);
  return Math.floor((now - requested) / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time
RMASchema.virtual('resolutionTimeInDays').get(function() {
  if (!this.resolutionDate || !this.requested) return null;
  const resolution = new Date(this.resolutionDate);
  const requested = new Date(this.requested);
  return Math.floor((resolution - requested) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
RMASchema.virtual('isOverdue').get(function() {
  if (!this.expectedResolutionDate) return false;
  return new Date() > this.expectedResolutionDate;
});

// Virtual for total cost calculation
RMASchema.virtual('calculatedTotalCost').get(function() {
  return (this.laborCost || 0) + (this.partsCost || 0) + (this.shippingCost || 0);
});

// Pre-save middleware to update status history
RMASchema.pre('save', function(next) {
  if (this.isModified('status') || this.isModified('statusUpdate')) {
    this.statusHistory.push({
      status: this.status,
      update: this.statusUpdate,
      updatedBy: this.updatedBy,
      updatedAt: new Date()
    });
  }
  next();
});

// Index for better query performance
RMASchema.index({ equipment: 1 });
RMASchema.index({ sparePart: 1 });
RMASchema.index({ status: 1 });
RMASchema.index({ requested: 1 });
RMASchema.index({ priority: 1 });
RMASchema.index({ client: 1 });

module.exports = mongoose.model('RMA', RMASchema); 