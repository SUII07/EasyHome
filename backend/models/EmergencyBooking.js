import mongoose from "mongoose";

const emergencyBookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer',
    required: true
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'serviceprovider',
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  location: {
    type: String,
    required: true
  },
  isEmergency: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

const EmergencyBooking = mongoose.models.emergencybooking || mongoose.model('emergencybooking', emergencyBookingSchema);
export default EmergencyBooking; 