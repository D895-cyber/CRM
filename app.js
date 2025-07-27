const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const rmaRoutes = require('./routes/rma');
const voucherRoutes = require('./routes/voucher');
const scheduleRouter = require('./routes/schedule');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:4000' }));
app.use('/uploads/vouchers', express.static(path.join(__dirname, 'uploads/vouchers')));
app.use('/uploads/reports', express.static(path.join(__dirname, 'uploads/reports')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', clientRoutes);
app.use('/api/rma', rmaRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/schedule', scheduleRouter);

// MongoDB connection
const MONGO_URI = 'mongodb+srv://dev:dev123@cluster0.es90y1z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
}); 