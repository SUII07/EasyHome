import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: String,
    required: true,
  },
  ZipCode: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "admin",
  },
}, { timestamps: true });

const adminModel = mongoose.model('admin', adminSchema);
export default adminModel;