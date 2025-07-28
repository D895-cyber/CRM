const express = require('express');
const router = express.Router();
const RMA = require('../models/RMA');
const MasterSparePart = require('../models/MasterSparePart');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Middleware: Only allow Admin/Manager for create/update
function requireAdminOrManager(req, res, next) {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Manager')) {
    return next();
  }
  return res.status(403).json({ message: 'Admin or Manager access required' });
}

// GET all RMAs (authenticated)
router.get('/', authenticate, async (req, res) => {
  try {
    const rmas = await RMA.find()
      .populate('equipment', 'name serialNumber model manufacturer')
      .populate('sparePart', 'partNumber name description')
      .populate('clientId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ requested: -1 });
    res.json(rmas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch RMAs' });
  }
});

// POST create new RMA (Admin/Manager only)
router.post(
  '/',
  authenticate,
  requireAdminOrManager,
  [
    body('caseNumber').notEmpty().withMessage('Case number is required'),
    body('client').notEmpty().withMessage('Client is required'),
    body('equipment').notEmpty().withMessage('Equipment is required'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('statusUpdate').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const rma = new RMA({
        ...req.body,
        createdBy: req.user._id
      });

      await rma.save();

      // Update master spare part quantity if spare part RMA
      if (req.body.sparePart && req.body.rmaType === 'Spare Part') {
        try {
          await MasterSparePart.findByIdAndUpdate(
            req.body.sparePart,
            {
              $inc: { availableQuantity: -1 },
              $inc: { totalUsed: 1 },
              lastUsedDate: new Date()
            }
          );
        } catch (err) {
          console.error('Failed to update master spare part quantity:', err);
        }
      }

      res.status(201).json(rma);
    } catch (err) {
      res.status(400).json({ message: err.message || 'Failed to create RMA' });
    }
  }
);

// PUT update RMA (Admin/Manager only)
router.put(
  '/:id',
  authenticate,
  requireAdminOrManager,
  [
    body('caseNumber').optional().notEmpty().withMessage('Case number is required'),
    body('client').optional().notEmpty().withMessage('Client is required'),
    body('equipment').optional().notEmpty().withMessage('Equipment is required'),
    body('reason').optional().notEmpty().withMessage('Reason is required'),
    body('statusUpdate').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const rma = await RMA.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!rma) return res.status(404).json({ message: 'RMA not found' });
      res.json(rma);
    } catch (err) {
      res.status(400).json({ message: err.message || 'Failed to update RMA' });
    }
  }
);

module.exports = router; 