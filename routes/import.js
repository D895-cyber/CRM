const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { authenticate, requireAdminOrManager } = require('../middleware/auth');
const Client = require('../models/Client');
const Site = require('../models/Site');
const Equipment = require('../models/Equipment');
const Voucher = require('../models/Voucher');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/imports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Import data endpoint
router.post('/', authenticate, requireAdminOrManager, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let data = [];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Parse file based on type
    if (fileExtension === '.csv') {
      data = await parseCSV(file.path);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      data = await parseExcel(file.path);
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'No data found in file' });
    }

    let result;
    switch (type) {
      case 'vouchers':
        result = await importVouchers(data, req.user);
        break;
      case 'clients':
        result = await importClients(data);
        break;
      case 'sites':
        result = await importSites(data);
        break;
      case 'equipment':
        result = await importEquipment(data);
        break;
      case 'schedules':
        result = await importSchedules(data);
        break;
      default:
        return res.status(400).json({ message: 'Invalid import type' });
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.json({
      message: 'Import completed successfully',
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors
    });

  } catch (error) {
    console.error('Import error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      message: 'Import failed', 
      error: error.message 
    });
  }
});

// Parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Parse Excel file
const parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  } catch (error) {
    throw new Error('Failed to parse Excel file');
  }
};

// Import vouchers
const importVouchers = async (data, user) => {
  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const row of data) {
    try {
      // Validate required fields
      if (!row.fseName || !row.amount || !row.date) {
        skipped++;
        errors.push(`Row ${imported + skipped}: Missing required fields`);
        continue;
      }

      // Check if voucher already exists
      const existingVoucher = await Voucher.findOne({
        fseName: row.fseName,
        amount: parseFloat(row.amount),
        date: new Date(row.date)
      });

      if (existingVoucher) {
        skipped++;
        continue;
      }

      // Create new voucher
      const voucher = new Voucher({
        fseId: user._id,
        fseName: row.fseName,
        amount: parseFloat(row.amount),
        date: new Date(row.date),
        description: row.description || '',
        status: row.status || 'Pending'
      });

      await voucher.save();
      imported++;
    } catch (error) {
      skipped++;
      errors.push(`Row ${imported + skipped}: ${error.message}`);
    }
  }

  return { imported, skipped, errors };
};

// Import clients
const importClients = async (data) => {
  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const row of data) {
    try {
      if (!row.name || !row.email) {
        skipped++;
        errors.push(`Row ${imported + skipped}: Missing required fields`);
        continue;
      }

      const existingClient = await Client.findOne({ email: row.email });
      if (existingClient) {
        skipped++;
        continue;
      }

      const client = new Client({
        name: row.name,
        email: row.email,
        phone: row.phone || '',
        address: row.address || ''
      });

      await client.save();
      imported++;
    } catch (error) {
      skipped++;
      errors.push(`Row ${imported + skipped}: ${error.message}`);
    }
  }

  return { imported, skipped, errors };
};

// Import sites
const importSites = async (data) => {
  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const row of data) {
    try {
      if (!row.name || !row.clientId) {
        skipped++;
        errors.push(`Row ${imported + skipped}: Missing required fields`);
        continue;
      }

      const client = await Client.findById(row.clientId);
      if (!client) {
        skipped++;
        errors.push(`Row ${imported + skipped}: Client not found`);
        continue;
      }

      const existingSite = await Site.findOne({ 
        name: row.name, 
        client: row.clientId 
      });
      
      if (existingSite) {
        skipped++;
        continue;
      }

      const site = new Site({
        name: row.name,
        address: row.address || '',
        client: row.clientId,
        contactPerson: row.contactPerson || ''
      });

      await site.save();
      imported++;
    } catch (error) {
      skipped++;
      errors.push(`Row ${imported + skipped}: ${error.message}`);
    }
  }

  return { imported, skipped, errors };
};

// Import equipment
const importEquipment = async (data) => {
  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const row of data) {
    try {
      if (!row.serialNumber || !row.siteId) {
        skipped++;
        errors.push(`Row ${imported + skipped}: Missing required fields`);
        continue;
      }

      const site = await Site.findById(row.siteId);
      if (!site) {
        skipped++;
        errors.push(`Row ${imported + skipped}: Site not found`);
        continue;
      }

      const existingEquipment = await Equipment.findOne({ 
        serialNumber: row.serialNumber 
      });
      
      if (existingEquipment) {
        skipped++;
        continue;
      }

      const equipment = new Equipment({
        serialNumber: row.serialNumber,
        model: row.model || '',
        site: row.siteId,
        installationDate: row.installationDate ? new Date(row.installationDate) : new Date()
      });

      await equipment.save();
      imported++;
    } catch (error) {
      skipped++;
      errors.push(`Row ${imported + skipped}: ${error.message}`);
    }
  }

  return { imported, skipped, errors };
};

// Import schedules
const importSchedules = async (data) => {
  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const row of data) {
    try {
      if (!row.date || !row.equipmentId || !row.fseId) {
        skipped++;
        errors.push(`Row ${imported + skipped}: Missing required fields`);
        continue;
      }

      const equipment = await Equipment.findById(row.equipmentId);
      if (!equipment) {
        skipped++;
        errors.push(`Row ${imported + skipped}: Equipment not found`);
        continue;
      }

      const fse = await User.findById(row.fseId);
      if (!fse) {
        skipped++;
        errors.push(`Row ${imported + skipped}: FSE not found`);
        continue;
      }

      const existingSchedule = await Schedule.findOne({
        date: new Date(row.date),
        equipment: row.equipmentId,
        fse: row.fseId
      });
      
      if (existingSchedule) {
        skipped++;
        continue;
      }

      const schedule = new Schedule({
        date: new Date(row.date),
        equipment: row.equipmentId,
        fse: row.fseId,
        status: row.status || 'Pending'
      });

      await schedule.save();
      imported++;
    } catch (error) {
      skipped++;
      errors.push(`Row ${imported + skipped}: ${error.message}`);
    }
  }

  return { imported, skipped, errors };
};

module.exports = router; 