import mongoose from 'mongoose';

const ServiceProviderSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  serviceType: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: "pending" }, 
}, { timestamps: true });

export default mongoose.model('ServiceProvider', ServiceProviderSchema);
