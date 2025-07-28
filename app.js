const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const rmaRoutes = require('./routes/rma');
const voucherRoutes = require('./routes/voucher');
const scheduleRouter = require('./routes/schedule');
const importRoutes = require('./routes/import');
const sparePartsRoutes = require('./routes/spareParts');
const userRoutes = require('./routes/users');
const masterSparePartsRoutes = require('./routes/masterSpareParts');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:4001'] }));
app.use('/uploads/vouchers', express.static(path.join(__dirname, 'uploads/vouchers')));
app.use('/uploads/reports', express.static(path.join(__dirname, 'uploads/reports')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', clientRoutes);
app.use('/api/rma', rmaRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/schedule', scheduleRouter);
app.use('/api/import', importRoutes);
app.use('/api/spare-parts', sparePartsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/master-spare-parts', masterSparePartsRoutes);

// MongoDB connection
const MONGO_URI = 'mongodb+srv://dev:dev123@cluster0.es90y1z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
}); 