const express = require('express');
const router = express.Router();
const MasterSparePart = require('../models/MasterSparePart');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET all master spare parts (for dropdowns and lists)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};
    
    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }
    
    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }
    
    const spareParts = await MasterSparePart.find(query)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(spareParts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch spare parts' });
  }
});

// GET active spare parts only (for dropdowns)
router.get('/active', authenticate, async (req, res) => {
  try {
    const spareParts = await MasterSparePart.find({ status: 'Active' })
      .select('partNumber name category model manufacturer availableQuantity unitPrice')
      .sort({ name: 1 });
    res.json(spareParts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active spare parts' });
  }
});

// GET spare part by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const sparePart = await MasterSparePart.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    
    res.json(sparePart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch spare part' });
  }
});

// POST create new master spare part (Admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('partNumber').notEmpty().withMessage('Part number is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('availableQuantity').isNumeric().withMessage('Available quantity must be a number'),
    body('unitPrice').optional().isNumeric().withMessage('Unit price must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });
    }
    
    try {
      // Check if part number already exists
      const existingPart = await MasterSparePart.findOne({ partNumber: req.body.partNumber });
      if (existingPart) {
        return res.status(400).json({ message: 'Part number already exists' });
      }
      
      const sparePart = new MasterSparePart({
        ...req.body,
        createdBy: req.user._id
      });
      
      await sparePart.save();
      res.status(201).json(sparePart);
    } catch (err) {
      res.status(400).json({ message: err.message || 'Failed to create spare part' });
    }
  }
);

// PUT update master spare part (Admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    body('partNumber').optional().notEmpty().withMessage('Part number is required'),
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('category').optional().notEmpty().withMessage('Category is required'),
    body('model').optional().notEmpty().withMessage('Model is required'),
    body('availableQuantity').optional().isNumeric().withMessage('Available quantity must be a number'),
    body('unitPrice').optional().isNumeric().withMessage('Unit price must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });
    }
    
    try {
      // Check if part number already exists (excluding current part)
      if (req.body.partNumber) {
        const existingPart = await MasterSparePart.findOne({ 
          partNumber: req.body.partNumber,
          _id: { $ne: req.params.id }
        });
        if (existingPart) {
          return res.status(400).json({ message: 'Part number already exists' });
        }
      }
      
      const sparePart = await MasterSparePart.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.user._id },
        { new: true }
      );
      
      if (!sparePart) {
        return res.status(404).json({ message: 'Spare part not found' });
      }
      
      res.json(sparePart);
    } catch (err) {
      res.status(400).json({ message: err.message || 'Failed to update spare part' });
    }
  }
);

// DELETE master spare part (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const sparePart = await MasterSparePart.findByIdAndDelete(req.params.id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    res.json({ message: 'Spare part deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete spare part' });
  }
});

// PATCH update quantity (for usage tracking)
router.patch('/:id/quantity', authenticate, async (req, res) => {
  try {
    const { quantity, action } = req.body; // action: 'add', 'subtract', 'set'
    
    if (!quantity || !action) {
      return res.status(400).json({ message: 'Quantity and action are required' });
    }
    
    const sparePart = await MasterSparePart.findById(req.params.id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    
    let newQuantity = sparePart.availableQuantity;
    
    switch (action) {
      case 'add':
        newQuantity += quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, newQuantity - quantity);
        break;
      case 'set':
        newQuantity = quantity;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    
    sparePart.availableQuantity = newQuantity;
    sparePart.totalUsed = sparePart.totalUsed + (action === 'subtract' ? quantity : 0);
    sparePart.lastUsedDate = action === 'subtract' ? new Date() : sparePart.lastUsedDate;
    sparePart.updatedBy = req.user._id;
    
    await sparePart.save();
    res.json(sparePart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quantity' });
  }
});

// GET low stock items
router.get('/inventory/low-stock', authenticate, async (req, res) => {
  try {
    const lowStockItems = await MasterSparePart.find({
      availableQuantity: { $lte: '$reorderThreshold' },
      status: 'Active'
    }).sort({ availableQuantity: 1 });
    
    res.json(lowStockItems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch low stock items' });
  }
});

// GET usage statistics
router.get('/stats/usage', authenticate, async (req, res) => {
  try {
    const stats = await MasterSparePart.aggregate([
      {
        $group: {
          _id: '$category',
          totalParts: { $sum: 1 },
          totalUsed: { $sum: '$totalUsed' },
          totalValue: { $sum: { $multiply: ['$availableQuantity', { $ifNull: ['$unitPrice', 0] }] } }
        }
      },
      { $sort: { totalUsed: -1 } }
    ]);
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch usage statistics' });
  }
});

module.exports = router; 