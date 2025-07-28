const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { authenticate, requireAdminOrManager, requireAdmin } = require('../middleware/auth');
const Client = require('../models/Client');
const Site = require('../models/Site');
const Equipment = require('../models/Equipment');
const Voucher = require('../models/Voucher');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const MasterSparePart = require('../models/MasterSparePart');

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

// Configure multer for file uploads
const storageMemory = multer.memoryStorage();
const uploadMemory = multer({ 
  storage: storageMemory,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Import data endpoint
router.post('/', upload.single('file'), authenticate, requireAdminOrManager, async (req, res) => {
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

// Import spare parts from Excel
router.post('/spare-parts', authenticate, requireAdmin, uploadMemory.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { mapping, updateExisting } = req.body;
    const columnMapping = JSON.parse(mapping);
    const shouldUpdateExisting = updateExisting === 'true';

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      return res.status(400).json({ message: 'Excel file must have at least a header row and one data row' });
    }

    const headers = data[0];
    const rows = data.slice(1);

    // Validate required mappings
    const requiredFields = ['partNumber', 'name', 'category', 'model'];
    const missingFields = requiredFields.filter(field => !columnMapping[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required field mappings: ${missingFields.join(', ')}` 
      });
    }

    // Convert column letters to indices
    const columnIndices = {};
    Object.keys(columnMapping).forEach(field => {
      if (columnMapping[field]) {
        const columnLetter = columnMapping[field];
        const columnIndex = xlsx.utils.decode_col(columnLetter);
        columnIndices[field] = columnIndex;
      }
    });

    // Process rows and create spare parts
    const spareParts = [];
    const errors = [];
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every(cell => !cell)) continue; // Skip empty rows

      try {
        const sparePartData = {
          partNumber: row[columnIndices.partNumber]?.toString().trim(),
          name: row[columnIndices.name]?.toString().trim(),
          category: row[columnIndices.category]?.toString().trim(),
          model: row[columnIndices.model]?.toString().trim(),
          manufacturer: columnIndices.manufacturer !== undefined ? row[columnIndices.manufacturer]?.toString().trim() : '',
          supplier: columnIndices.supplier !== undefined ? row[columnIndices.supplier]?.toString().trim() : '',
          availableQuantity: columnIndices.availableQuantity !== undefined ? 
            parseInt(row[columnIndices.availableQuantity]) || 0 : 0,
          unitPrice: columnIndices.unitPrice !== undefined ? 
            parseFloat(row[columnIndices.unitPrice]) || 0 : 0,
          status: 'Active',
          createdBy: req.user._id
        };

        // Validate required fields
        if (!sparePartData.partNumber || !sparePartData.name || !sparePartData.category || !sparePartData.model) {
          errors.push(`Row ${i + 2}: Missing required fields`);
          skipped++;
          continue;
        }

        // Check if part number already exists
        const existingPart = await MasterSparePart.findOne({ partNumber: sparePartData.partNumber });
        if (existingPart) {
          if (shouldUpdateExisting) {
            // Update existing part
            await MasterSparePart.findOneAndUpdate(
              { partNumber: sparePartData.partNumber },
              {
                $set: {
                  name: sparePartData.name,
                  category: sparePartData.category,
                  model: sparePartData.model,
                  manufacturer: sparePartData.manufacturer,
                  supplier: sparePartData.supplier,
                  availableQuantity: sparePartData.availableQuantity,
                  unitPrice: sparePartData.unitPrice,
                  status: sparePartData.status,
                  updatedBy: req.user._id,
                  updatedAt: new Date()
                }
              }
            );
            imported++;
          } else {
            errors.push(`Row ${i + 2}: Part number ${sparePartData.partNumber} already exists`);
            skipped++;
          }
          continue;
        }

        // Validate category
        const validCategories = ['Lamp', 'Board', 'Fan', 'Filter', 'Lens', 'Electronics', 'Mechanical', 'Optical', 'Other'];
        if (!validCategories.includes(sparePartData.category)) {
          sparePartData.category = 'Other'; // Default to Other if invalid
        }

        spareParts.push(sparePartData);
        imported++;

      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
        skipped++;
      }
    }

    // Insert all valid spare parts
    if (spareParts.length > 0) {
      try {
        await MasterSparePart.insertMany(spareParts);
      } catch (error) {
        // Handle duplicate key errors from insertMany
        if (error.code === 11000) {
          // Extract the duplicate part number from the error
          const duplicatePartNumber = error.keyValue?.partNumber || 'unknown';
          errors.push(`Duplicate part number found: ${duplicatePartNumber}`);
          skipped++;
          
          // Try to insert the remaining parts one by one
          for (const sparePart of spareParts) {
            try {
              await MasterSparePart.create(sparePart);
              imported++;
            } catch (insertError) {
              if (insertError.code === 11000) {
                errors.push(`Part number ${sparePart.partNumber} already exists`);
                skipped++;
              } else {
                errors.push(`Error importing ${sparePart.partNumber}: ${insertError.message}`);
                skipped++;
              }
            }
          }
        } else {
          throw error; // Re-throw non-duplicate errors
        }
      }
    }

    res.json({
      message: 'Import completed',
      imported,
      skipped,
      errors: errors.slice(0, 10), // Limit error messages
      totalErrors: errors.length
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Failed to import data: ' + error.message });
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