import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
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
  serviceType: {
    type: String,
    required: true
  },
  bookingDateTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'canceled'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ bookingDateTime: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; 