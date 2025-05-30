import mongoose from 'mongoose';
import axios from 'axios';

const emergencyServiceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  },
  isEmergency: {
    type: Boolean,
    default: true
  },
  emergencyNotes: String,
  price: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  customerLocation: {
    lat: { type: Number },
    lon: { type: Number }
  }
});

// Add index for better query performance
emergencyServiceSchema.index({ status: 1, providerId: 1 });
emergencyServiceSchema.index({ status: 1, customerId: 1 });

export default mongoose.model('EmergencyService', emergencyServiceSchema);