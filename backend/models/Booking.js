import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ["house cleaning", "electrician", "painting", "plumbing", "hvac services"]
  },
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add indexes for better query performance
bookingSchema.index({ customerId: 1, bookingDate: -1 });
bookingSchema.index({ serviceProviderId: 1, bookingDate: -1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
