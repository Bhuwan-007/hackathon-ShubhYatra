require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shubhyatra';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB.');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:');
    console.error(err.message);
    console.error('💡 Please ensure MongoDB is running and MONGODB_URI is correct in .env');
  });

// Health Check Route
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    database: dbState,
    timestamp: new Date().toISOString() 
  });
});

// Import Routes
const briefingRoutes = require('./routes/briefing');
const scanRoutes = require('./routes/scan');
const emergencyRoutes = require('./routes/emergency');
const reportRoutes = require('./routes/reports');

app.use('/api/briefing', briefingRoutes);
app.use('/api/scan-image', scanRoutes);
app.use('/api/emergency-plan', emergencyRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
