const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const Site = require('../models/Site');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const Report = require('../models/Report');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const DRIVE_KEY_PATH = path.join(__dirname, '../config/drive-service-account.json');
const PARENT_FOLDER_ID = '1CvEE902i55rj4dy1R55P7zfUB8sGiNY_'; // Set this to your Drive folder ID
const cloudinary = require('../config/cloudinary');

cloudinary.config({
  cloud_name: 'dxepnpgw7', // replace with your Cloudinary cloud name
  api_key: '287815833958953',       // replace with your Cloudinary API key
  api_secret: 'dQDFju6yXN5WXI1SAcyaxdd7wqw' 
});

module.exports = cloudinary;

const auth = new google.auth.GoogleAuth({
  keyFile: DRIVE_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });

async function getOrCreateFolder(serialNumber, parentFolderId) {
  const res = await drive.files.list({
    q: `'${parentFolderId}' in parents and name='${serialNumber}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });
  if (res.data.files.length > 0) return res.data.files[0].id;
  const folder = await drive.files.create({
    resource: {
      name: serialNumber,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  });
  return folder.data.id;
}

async function uploadPhotoToDrive(localFilePath, serialNumber, parentFolderId) {
  const folderId = await getOrCreateFolder(serialNumber, parentFolderId);
  const fileMetadata = {
    name: path.basename(localFilePath),
    parents: [folderId],
  };
  const media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream(localFilePath),
  };
  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink',
  });
  return file.data;
}

const uploadReportsDir = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(uploadReportsDir)) {
  fs.mkdirSync(uploadReportsDir, { recursive: true });
}

// Middleware to check admin or coordinator
function isAdminOrCoordinator(req, res, next) {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Service Coordinator')) return next();
  return res.status(403).json({ message: 'Admin or Service Coordinator access required' });
}
// Middleware to check FSE
function isFSE(req, res, next) {
  if (req.user && req.user.role === 'FSE') return next();
  return res.status(403).json({ message: 'FSE access required' });
}

// Multer setup for report photo uploads
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reports/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const reportUpload = multer({ storage: reportStorage });

// Create a schedule (Admin/Coordinator)
router.post('/', authenticate, isAdminOrCoordinator, async (req, res) => {
  try {
    const { equipmentId, siteId, fseId, date, notes } = req.body;
    if (!equipmentId || !siteId || !fseId || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const schedule = new Schedule({
      equipment: equipmentId,
      site: siteId,
      assignedFSE: fseId,
      date,
      notes,
      status: 'Scheduled',
      createdBy: req.user._id,
    });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all schedules (Admin/Coordinator)
router.get('/', authenticate, isAdminOrCoordinator, async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('equipment site assignedFSE createdBy');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get schedules for a specific FSE
router.get('/fse/:fseId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Service Coordinator' && req.user._id.toString() !== req.params.fseId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const schedules = await Schedule.find({ assignedFSE: req.params.fseId }).populate('equipment site assignedFSE createdBy');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all equipment with warranty/EW info
router.get('/equipment/warranty', authenticate, isAdminOrCoordinator, async (req, res) => {
  try {
    const equipment = await Equipment.find()
      .populate('client', 'name')
      .populate('site', 'name')
      .populate('ewHistory.renewedBy', 'name')
      .populate('createdBy', 'name');
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get schedules for a specific equipment
router.get('/equipment/:equipmentId', authenticate, async (req, res) => {
  try {
    const schedules = await Schedule.find({ equipment: req.params.equipmentId }).populate('equipment site assignedFSE createdBy');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a schedule (Admin/Coordinator)
router.put('/:id', authenticate, isAdminOrCoordinator, async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a schedule (Admin/Coordinator)
router.delete('/:id', authenticate, isAdminOrCoordinator, async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FSE updates job status/notes
router.patch('/:id/status', authenticate, isFSE, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (schedule.assignedFSE.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your job' });
    }
    schedule.status = req.body.status || schedule.status;
    schedule.notes = req.body.notes || schedule.notes;
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Attendance summary for a given date (Admin only)
router.get('/attendance', authenticate, isAdminOrCoordinator, async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ message: 'Date is required' });
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    // Find all schedules for the date
    const schedules = await Schedule.find({
      date: { $gte: start, $lte: end }
    }).populate('assignedFSE');
    // Group by FSE
    const attendance = {};
    schedules.forEach(s => {
      const fse = s.assignedFSE;
      if (!fse) return;
      if (!attendance[fse._id]) attendance[fse._id] = { name: fse.name, email: fse.email, jobs: [] };
      attendance[fse._id].jobs.push({
        jobId: s._id,
        status: s.status,
        notes: s.notes,
        equipment: s.equipment,
        site: s.site,
      });
    });
    // Format summary
    const summary = Object.values(attendance).map(fse => {
      const completed = fse.jobs.filter(j => j.status === 'Completed').length;
      const notDone = fse.jobs.filter(j => j.status === 'Cancelled').length;
      const pending = fse.jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled').length;
      return {
        name: fse.name,
        email: fse.email,
        jobsScheduled: fse.jobs.length,
        completed,
        notDone,
        pending,
        jobs: fse.jobs
      };
    });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new report (FSE)
router.post('/report', authenticate, isFSE, reportUpload.array('photos', 10), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data); // All form fields except files
    const schedule = await Schedule.findById(data.schedule).populate('equipment');
    const serialNumber = schedule && schedule.equipment && schedule.equipment.serialNumber;
    console.log('Schedule:', schedule);
    console.log('Equipment:', schedule && schedule.equipment);
    console.log('Serial Number:', serialNumber);
    const folderName = serialNumber || 'unknown';
    const photos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload to Cloudinary, folder by serial number or 'unknown'
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `reports/${folderName}`
        });
        photos.push(result.secure_url); // Use the secure URL
        fs.unlinkSync(file.path); // Remove local file after upload
      }
    }
    const report = new Report({
      ...data,
      fse: req.user._id,
      photos,
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get report by scheduleId (Admin/Coordinator/FSE)
router.get('/report/:scheduleId', authenticate, async (req, res) => {
  try {
    const report = await Report.findOne({ schedule: req.params.scheduleId })
      .populate({ path: 'schedule', populate: [{ path: 'equipment' }, { path: 'site' }] });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reports for a particular equipment (Admin/Coordinator)
router.get('/reports/equipment/:equipmentId', authenticate, isAdminOrCoordinator, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate({
        path: 'schedule',
        match: { equipment: req.params.equipmentId },
        populate: [{ path: 'equipment' }, { path: 'site' }]
      })
      .populate('fse');
    // Filter out reports where schedule is null (not matching equipment)
    res.json(reports.filter(r => r.schedule));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Renew EW for a piece of equipment
router.post('/equipment/:id/renew-ew', authenticate, isAdminOrCoordinator, async (req, res) => {
  try {
    const { ew_expiry, notes } = req.body;
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    
    equipment.ewStatus = 'Active';
    equipment.ewEndDate = ew_expiry;
    equipment.ewHistory.push({
      renewalDate: new Date(),
      renewedBy: req.user._id,
      ewExpiry: ew_expiry,
      notes
    });
    await equipment.save();
    
    // Populate the updated equipment before sending response
    const updatedEquipment = await Equipment.findById(req.params.id)
      .populate('client', 'name')
      .populate('site', 'name')
      .populate('ewHistory.renewedBy', 'name')
      .populate('createdBy', 'name');
    
    res.json(updatedEquipment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 