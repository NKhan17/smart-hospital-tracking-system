require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const profileRoutes = require('./routes/profiles');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io); // Make io accessible in routes

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB: smart_hospital_tracking_db');
    initializeDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err));

async function initializeDatabase() {
  try {
    const { PatientProfile } = require('./models/PatientProfile');
    await PatientProfile.init();
    console.log('Database collections and indexes initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

app.use('/api/profiles', profileRoutes);
app.use('/api/appointments', appointmentRoutes);

// Housekeeping loop for expired tokens
setInterval(async () => {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  try {
    const Appointment = require('./models/Appointment');
    const result = await Appointment.updateMany(
      { status: 'Pending Verification', createdAt: { $lt: cutoff } },
      { $set: { status: 'Expired' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Housekeeping: Expired ${result.modifiedCount} pending appointments.`);
    }
  } catch (err) {
    console.error('Housekeeping error:', err);
  }
}, 60000);

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
