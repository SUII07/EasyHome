import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: String,
    required: true,
  },
  Address: {
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
    default: "customer",
  },
}, { timestamps: true });

const CustomerModel = mongoose.model('Customer', customerSchema);
export default CustomerModel;
