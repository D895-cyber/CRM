const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Site = require('../models/Site');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authenticate, requireAdmin } = require('../middleware/auth');

// --- Client Routes ---
// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new client
router.post('/clients', authenticate, requireAdmin, async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a client by ID
router.get('/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a client
router.put('/clients/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a client
router.delete('/clients/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Site Routes ---
// Get all sites for a client
router.get('/clients/:clientId/sites', async (req, res) => {
  try {
    const sites = await Site.find({ client: req.params.clientId });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a site to a client
router.post('/clients/:clientId/sites', authenticate, requireAdmin, async (req, res) => {
  try {
    const site = new Site({ ...req.body, client: req.params.clientId });
    await site.save();
    res.status(201).json(site);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a site by ID
router.get('/sites/:id', async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    res.json(site);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a site
router.put('/sites/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const site = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!site) return res.status(404).json({ message: 'Site not found' });
    res.json(site);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a site
router.delete('/sites/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    res.json({ message: 'Site deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Equipment Routes ---
// Get all equipment
router.get('/equipment', authenticate, async (req, res) => {
  try {
    const equipment = await Equipment.find().populate('site', 'name');
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all equipment for a site
router.get('/sites/:siteId/equipment', async (req, res) => {
  try {
    const equipment = await Equipment.find({ site: req.params.siteId });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add equipment to a site
router.post('/sites/:siteId/equipment', authenticate, requireAdmin, async (req, res) => {
  try {
    const equipment = new Equipment({ ...req.body, site: req.params.siteId });
    await equipment.save();
    res.status(201).json(equipment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get equipment by ID
router.get('/equipment/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update equipment
router.put('/equipment/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete equipment
router.delete('/equipment/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- User Management (Admin Only) ---
// List all users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add a new user
router.post('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Delete a user
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 