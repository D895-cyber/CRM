const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_person: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema); 