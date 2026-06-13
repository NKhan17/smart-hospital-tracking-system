const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['OPD', 'Lab', 'Pharmacy', 'Emergency', 'Ward'] },
  floor: { type: Number, required: true },
  roomNumber: { type: String, required: true },
  currentQueueCount: { type: Number, default: 0 },
  averageWaitTimeMin: { type: Number, default: 15 }
}, { timestamps: true });

module.exports = mongoose.model('Facility', FacilitySchema);
