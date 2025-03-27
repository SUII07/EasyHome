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
  address: {
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
  availability: {
    type: Boolean,
    default: true
  },
  reviews: [{
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: true
    },
    review: {
      type: String,
      trim: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add a pre-save middleware to calculate average rating
serviceProviderSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    this.rating = sum / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
  next();
});

// Add indexes for better query performance
serviceProviderSchema.index({ serviceType: 1, verificationStatus: 1 });
serviceProviderSchema.index({ address: 1 });

const ServiceProvider = mongoose.model("ServiceProvider", serviceProviderSchema);

export default ServiceProvider;
