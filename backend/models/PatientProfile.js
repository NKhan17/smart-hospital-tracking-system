const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const polymorphicOptions = { discriminatorKey: 'profileType' };

const PatientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  dob: { type: Date },
}, polymorphicOptions);

const PatientProfile = mongoose.model('PatientProfile', PatientProfileSchema);

const HumanProfileSchema = new mongoose.Schema({
  bloodGroup: { type: String },
  allergies: { 
    type: String,
    set: encrypt,
    get: decrypt
  },
  medicalConditions: {
    type: String,
    set: encrypt,
    get: decrypt
  }
});

const HumanProfile = PatientProfile.discriminator('Human', HumanProfileSchema);

const PetProfileSchema = new mongoose.Schema({
  species: { type: String, required: true },
  breed: { type: String },
  vaccinations: {
    type: String,
    set: encrypt,
    get: decrypt
  }
});

const PetProfile = PatientProfile.discriminator('Pet', PetProfileSchema);

PatientProfileSchema.set('toJSON', { getters: true });
HumanProfileSchema.set('toJSON', { getters: true });
PetProfileSchema.set('toJSON', { getters: true });

module.exports = { PatientProfile, HumanProfile, PetProfile };
