import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ["house cleaning", "electrician", "painting", "plumbing", "hvac services"]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add indexes for better query performance
serviceProviderSchema.index({ serviceType: 1, verificationStatus: 1 });
serviceProviderSchema.index({ zipCode: 1 });

const ServiceProvider = mongoose.model("ServiceProvider", serviceProviderSchema);

export default ServiceProvider;
