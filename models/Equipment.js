const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  // Basic Equipment Information
  name: { type: String, required: true }, // e.g., "Projector 1", "Display Screen A"
  type: { type: String, required: true }, // e.g., "Projector", "Display", "Audio System", "Lighting"
  serialNumber: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  manufacturer: { type: String, required: true },
  
  // Installation and Location
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  installationDate: { type: Date, required: true },
  location: { type: String }, // Specific location within the site
  roomNumber: { type: String },
  
  // Warranty Information
  warrantyStatus: { 
    type: String, 
    enum: ['Under Warranty', 'Out of Warranty', 'Extended Warranty'], 
    default: 'Under Warranty' 
  },
  warrantyStartDate: { type: Date },
  warrantyEndDate: { type: Date },
  warrantyProvider: { type: String },
  warrantyNumber: { type: String },
  
  // Extended Warranty
  ewStatus: { 
    type: String, 
    enum: ['Active', 'Expired', 'Pending', 'Not Applicable'], 
    default: 'Not Applicable' 
  },
  ewStartDate: { type: Date },
  ewEndDate: { type: Date },
  ewProvider: { type: String },
  ewNumber: { type: String },
  ewHistory: [{
    renewalDate: { type: Date, required: true },
    renewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ewExpiry: { type: Date, required: true },
    amount: { type: Number },
    notes: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Equipment Status
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Under Maintenance', 'Out of Service', 'Retired'], 
    default: 'Active' 
  },
  lastMaintenanceDate: { type: Date },
  nextMaintenanceDate: { type: Date },
  
  // Technical Specifications
  specifications: {
    powerConsumption: { type: String }, // e.g., "200W"
    dimensions: { type: String }, // e.g., "300x200x150mm"
    weight: { type: String }, // e.g., "5kg"
    resolution: { type: String }, // for displays/projectors
    brightness: { type: String }, // for projectors
    contrastRatio: { type: String }, // for displays
    connectivity: [String], // e.g., ["HDMI", "VGA", "USB"]
    additionalFeatures: [String] // e.g., ["3D Ready", "Wireless"]
  },
  
  // Purchase Information
  purchaseDate: { type: Date },
  purchasePrice: { type: Number },
  supplier: { type: String },
  purchaseOrderNumber: { type: String },
  
  // Notes and Documentation
  notes: { type: String },
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Maintenance History
  maintenanceHistory: [{
    date: { type: Date, required: true },
    type: { type: String, required: true }, // "Preventive", "Corrective", "Emergency"
    description: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cost: { type: Number },
    nextMaintenanceDate: { type: Date },
    notes: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Spare Parts Relationship
  spareParts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SparePart' }],
  
  // Created and Updated by
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for warranty status calculation
equipmentSchema.virtual('isWarrantyActive').get(function() {
  if (!this.warrantyEndDate) return false;
  return new Date() <= this.warrantyEndDate;
});

// Virtual for extended warranty status calculation
equipmentSchema.virtual('isEWActive').get(function() {
  if (!this.ewEndDate) return false;
  return new Date() <= this.ewEndDate;
});

// Virtual for total maintenance cost
equipmentSchema.virtual('totalMaintenanceCost').get(function() {
  if (!this.maintenanceHistory || !Array.isArray(this.maintenanceHistory)) {
    return 0;
  }
  return this.maintenanceHistory.reduce((total, maintenance) => total + (maintenance.cost || 0), 0);
});

// Virtual for total spare parts cost
equipmentSchema.virtual('totalSparePartsCost').get(function() {
  // This will be populated when spare parts are loaded
  return 0;
});

// Index for better query performance
equipmentSchema.index({ client: 1 });
equipmentSchema.index({ site: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ warrantyStatus: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema); 