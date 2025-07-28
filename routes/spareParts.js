const express = require('express');
const router = express.Router();
const SparePart = require('../models/SparePart');
const Equipment = require('../models/Equipment');
const RMA = require('../models/RMA');
const MasterSparePart = require('../models/MasterSparePart');
const { authenticate, requireAdmin, requireAdminOrManager } = require('../middleware/auth');

// Get all spare parts with equipment and RMA information
router.get('/', authenticate, async (req, res) => {
  try {
    const spareParts = await SparePart.find()
      .populate('equipment', 'name serialNumber model manufacturer')
      .populate('rma', 'caseNumber status')
      .populate('installedBy', 'name')
      .populate('createdBy', 'name')
      .sort({ installationDate: -1 });
    
    res.json(spareParts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get spare parts for a specific equipment
router.get('/equipment/:equipmentId', authenticate, async (req, res) => {
  try {
    const spareParts = await SparePart.find({ equipment: req.params.equipmentId })
      .populate('rma', 'caseNumber status')
      .populate('installedBy', 'name')
      .sort({ installationDate: -1 });
    
    res.json(spareParts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get spare part by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id)
      .populate('equipment', 'name serialNumber model manufacturer client site')
      .populate('rma', 'caseNumber status reason requested')
      .populate('installedBy', 'name')
      .populate('createdBy', 'name');
    
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    
    res.json(sparePart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new spare part
router.post('/', authenticate, requireAdminOrManager, async (req, res) => {
  try {
    const {
      partNumber,
      name,
      description,
      category,
      equipment,
      manufacturer,
      originalPartNumber,
      supplier,
      supplierPartNumber,
      quantityUsed,
      unitCost,
      installationDate,
      installationNotes,
      replacementReason,
      failureDescription,
      hoursOfUse,
      warrantyStartDate,
      warrantyEndDate,
      warrantyProvider,
      expectedLifespan,
      expectedReplacementDate,
      purchaseDate,
      purchaseOrderNumber,
      invoiceNumber,
      notes,
      specifications
    } = req.body;

    // Validate equipment exists
    const equipmentExists = await Equipment.findById(equipment);
    if (!equipmentExists) {
      return res.status(400).json({ message: 'Equipment not found' });
    }

    const sparePart = new SparePart({
      partNumber,
      name,
      description,
      category,
      equipment,
      manufacturer,
      originalPartNumber,
      supplier,
      supplierPartNumber,
      quantityUsed: quantityUsed || 1,
      unitCost,
      installationDate: installationDate || new Date(),
      installedBy: req.user._id,
      installationNotes,
      replacementReason,
      failureDescription,
      hoursOfUse,
      warrantyStartDate,
      warrantyEndDate,
      warrantyProvider,
      expectedLifespan,
      expectedReplacementDate,
      purchaseDate,
      purchaseOrderNumber,
      invoiceNumber,
      notes,
      specifications,
      createdBy: req.user._id
    });

    const savedSparePart = await sparePart.save();

    // Update equipment's spare parts array
    await Equipment.findByIdAndUpdate(equipment, {
      $push: { spareParts: savedSparePart._id }
    });

    // Populate references before sending response
    const populatedSparePart = await SparePart.findById(savedSparePart._id)
      .populate('equipment', 'name serialNumber model')
      .populate('installedBy', 'name');

    res.status(201).json(populatedSparePart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update spare part
router.put('/:id', authenticate, requireAdminOrManager, async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        sparePart[key] = req.body[key];
      }
    });

    sparePart.updatedBy = req.user._id;
    const updatedSparePart = await sparePart.save();

    const populatedSparePart = await SparePart.findById(updatedSparePart._id)
      .populate('equipment', 'name serialNumber model')
      .populate('rma', 'caseNumber status')
      .populate('installedBy', 'name');

    res.json(populatedSparePart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete spare part
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    // Check if spare part has an RMA
    if (sparePart.rma) {
      return res.status(400).json({ 
        message: 'Cannot delete spare part with active RMA. Please resolve the RMA first.' 
      });
    }

    // Remove from equipment's spare parts array
    await Equipment.findByIdAndUpdate(sparePart.equipment, {
      $pull: { spareParts: sparePart._id }
    });

    await SparePart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Spare part deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add maintenance record to spare part
router.post('/:id/maintenance', authenticate, requireAdminOrManager, async (req, res) => {
  try {
    const { date, action, notes, cost } = req.body;
    
    const sparePart = await SparePart.findById(req.params.id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    sparePart.maintenanceHistory.push({
      date: date || new Date(),
      action,
      performedBy: req.user._id,
      notes,
      cost
    });

    const updatedSparePart = await sparePart.save();
    
    const populatedSparePart = await SparePart.findById(updatedSparePart._id)
      .populate('equipment', 'name serialNumber model')
      .populate('maintenanceHistory.performedBy', 'name');

    res.json(populatedSparePart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get spare parts statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const totalSpareParts = await SparePart.countDocuments();
    const activeSpareParts = await SparePart.countDocuments({ status: 'Active' });
    const failedSpareParts = await SparePart.countDocuments({ status: 'Failed' });
    const underRMA = await SparePart.countDocuments({ status: 'Under RMA' });
    
    const totalCost = await SparePart.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    const categoryStats = await SparePart.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalCost: { $sum: '$totalCost' } } }
    ]);

    const monthlyInstallations = await SparePart.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$installationDate' },
            month: { $month: '$installationDate' }
          },
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalSpareParts,
      activeSpareParts,
      failedSpareParts,
      underRMA,
      totalCost: totalCost[0]?.total || 0,
      categoryStats,
      monthlyInstallations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get spare parts that need replacement
router.get('/alerts/replacement', authenticate, async (req, res) => {
  try {
    const spareParts = await SparePart.find({
      $or: [
        { expectedReplacementDate: { $lte: new Date() } },
        { status: 'Failed' },
        { 
          expectedLifespan: { $exists: true },
          installationDate: { 
            $lte: new Date(Date.now() - (req.query.hours || 8000) * 60 * 60 * 1000) 
          }
        }
      ]
    })
    .populate('equipment', 'name serialNumber model')
    .populate('rma', 'caseNumber status')
    .sort({ expectedReplacementDate: 1 });

    res.json(spareParts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search spare parts
router.get('/search/:query', authenticate, async (req, res) => {
  try {
    const query = req.params.query;
    const spareParts = await SparePart.find({
      $or: [
        { partNumber: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { manufacturer: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('equipment', 'name serialNumber model')
    .populate('rma', 'caseNumber status')
    .populate('installedBy', 'name')
    .sort({ installationDate: -1 });

    res.json(spareParts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 