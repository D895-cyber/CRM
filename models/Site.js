const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  address: { type: String },
  region: { type: String },
  contact_person: { type: String },
  phone: { type: String },
  email: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema); 