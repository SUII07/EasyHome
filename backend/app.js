const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const emergencyRoutes = require('./routes/emergencyService');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const serviceProviderRoutes = require('./routes/serviceProvider');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/serviceprovider', serviceProviderRoutes);
app.use('/api/emergency', emergencyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easyhome', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 