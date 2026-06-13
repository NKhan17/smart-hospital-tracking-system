const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const Facility = require('../models/Facility');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

router.post('/', async (req, res) => {
  try {
    const { patientId, facilityId, userId } = req.body;
    const appointment = new Appointment({ patientId, facilityId, userId });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.post('/generate-qr', async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    
    const token = jwt.sign({ appointmentId: appointment._id, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '5m' });
    
    res.json({ token, qrData: token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR pass' });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
    
    const appointment = await Appointment.findById(decoded.appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.status !== 'Pending Verification') {
      return res.status(400).json({ error: 'Appointment already processed or expired' });
    }
    
    appointment.status = 'Checked-In/Completed';
    await appointment.save();
    
    const facility = await Facility.findByIdAndUpdate(appointment.facilityId, { $inc: { currentQueueCount: 1 } }, { new: true });
    
    const io = req.app.get('io');
    if (io && facility) {
      io.emit('load-updated', { facilityId: facility._id, newLoad: facility.currentQueueCount });
    }
    
    res.json({ success: true, appointment, facility });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error during scanning process' });
  }
});

module.exports = router;
