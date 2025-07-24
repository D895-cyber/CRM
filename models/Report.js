const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  fse: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: Date,
  cinemaName: String,
  address: String,
  contactDetails: String,
  engineerVisited: String,
  projectorModel: String,
  serialNo: String,
  lampModel: String,
  lampHours: String,
  sections: [{
    section: String,
    description: String,
    status: String,
    remarks: String,
  }],
  imageEvaluation: [{ item: String, ok: Boolean }],
  testResults: [{ name: String, value: String, unit: String }],
  remarks: [String],
  photos: [String], // file paths
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema); 