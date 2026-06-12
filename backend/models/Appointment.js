const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile', required: true, index: true },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  status: { type: String, enum: ['Pending Verification', 'Checked-In/Completed', 'Expired'], default: 'Pending Verification' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
