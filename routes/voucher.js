const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/vouchers/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Middleware: Only allow Admin/Manager for verify/pay
function requireAdminOrManager(req, res, next) {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Manager')) {
    return next();
  }
  return res.status(403).json({ message: 'Admin or Manager access required' });
}

// POST /api/vouchers (FSE uploads voucher)
router.post(
  '/',
  authenticate,
  upload.single('billFile'),
  [
    body('amount').isNumeric().withMessage('Amount is required'),
    body('date').notEmpty().withMessage('Date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const voucher = new Voucher({
        fseId: req.user.userId,
        fseName: req.user.name,
        amount: req.body.amount,
        date: req.body.date,
        description: req.body.description,
        billFile: req.file ? req.file.path : '',
      });
      await voucher.save();
      res.status(201).json(voucher);
    } catch (err) {
      res.status(400).json({ message: err.message || 'Failed to create voucher' });
    }
  }
);

// GET /api/vouchers (role-based)
router.get('/', authenticate, async (req, res) => {
  try {
    let vouchers;
    if (req.user.role === 'FSE') {
      vouchers = await Voucher.find({ fseId: req.user.userId }).sort({ createdAt: -1 });
    } else {
      vouchers = await Voucher.find().populate('fseId', 'name').sort({ createdAt: -1 });
    }
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vouchers' });
  }
});

// PUT /api/vouchers/:id/verify (Admin/Manager)
router.put('/:id/verify', authenticate, requireAdminOrManager, async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, { status: 'Verified' }, { new: true });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json(voucher);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to verify voucher' });
  }
});

// PUT /api/vouchers/:id/pay (Admin/Manager)
router.put('/:id/pay', authenticate, requireAdminOrManager, async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, { status: 'Paid' }, { new: true });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json(voucher);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to mark voucher as paid' });
  }
});

module.exports = router; 