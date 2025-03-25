import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';
import ServiceProvider from '../models/ServiceProvider.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedBookings = async () => {
  try {
    // First, get a customer and service provider from the database
    const customer = await Customer.findOne();
    const serviceProvider = await ServiceProvider.findOne();

    if (!customer || !serviceProvider) {
      console.error('No customer or service provider found in the database');
      process.exit(1);
    }

    // Create sample bookings
    const sampleBookings = [
      {
        customer: customer._id,
        serviceProvider: serviceProvider._id,
        serviceType: 'Cleaning',
        bookingDateTime: new Date(),
        status: 'pending',
        notes: 'Regular house cleaning service',
        hourlyRate: 25,
        isEmergency: false
      },
      {
        customer: customer._id,
        serviceProvider: serviceProvider._id,
        serviceType: 'Plumbing',
        bookingDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'pending',
        notes: 'Emergency pipe leak',
        hourlyRate: 40,
        isEmergency: true
      },
      {
        customer: customer._id,
        serviceProvider: serviceProvider._id,
        serviceType: 'Electrical',
        bookingDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: 'completed',
        notes: 'Wiring installation',
        hourlyRate: 35,
        isEmergency: false
      }
    ];

    // Clear existing bookings
    await Booking.deleteMany({});

    // Insert new bookings
    await Booking.insertMany(sampleBookings);

    console.log('Sample bookings have been added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding bookings:', error);
    process.exit(1);
  }
};

seedBookings(); 