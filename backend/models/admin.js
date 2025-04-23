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
    default: "admin",
  },
  profilePicture: {
    public_id: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
}, { timestamps: true });

// Check if the model is already defined
const Admin = mongoose.models.admin || mongoose.model('admin', adminSchema);
export default Admin;
