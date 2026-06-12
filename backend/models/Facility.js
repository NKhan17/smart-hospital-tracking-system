const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Human', 'Pet'], required: true },
  liveLoad: { type: Number, default: 0 },
  lat: { type: Number },
  lng: { type: Number }
});

module.exports = mongoose.model('Facility', FacilitySchema);
