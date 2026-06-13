const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { HumanProfile, PetProfile, PatientProfile } = require('../models/PatientProfile');

const MOCK_USER_ID = new mongoose.Types.ObjectId('60e5a60b9432f700150b6a2b');

router.post('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const { profileType, name, dob, ...rest } = req.body;
    let profile;
    
    if (profileType === 'Human') {
      profile = new HumanProfile({
        userId: MOCK_USER_ID,
        name,
        dob,
        ...rest
      });
    } else if (profileType === 'Pet') {
      profile = new PetProfile({
        userId: MOCK_USER_ID,
        name,
        dob,
        ...rest
      });
    } else {
      return res.status(400).json({ error: 'Invalid profile type' });
    }
    
    await profile.save();
    res.status(201).json(profile.toJSON());
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const profiles = await PatientProfile.find({ userId: MOCK_USER_ID });
    res.json(profiles.map(p => p.toJSON()));
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

module.exports = router;
