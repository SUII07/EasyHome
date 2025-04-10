import express from "express";
import { verifyToken, isCustomer } from "../middleware/verifyToken.js";
import {
  getUser,
  updateUser,
  deleteUser,
  uploadProfilePicture
} from "../controllers/Auth.js";
import multer from 'multer';

const CustomerRoutes = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
});

// Get customer profile
CustomerRoutes.get("/profile", verifyToken, isCustomer, getUser);

// Update customer profile
CustomerRoutes.put("/profile", verifyToken, isCustomer, updateUser);

// Upload profile picture
CustomerRoutes.post("/profile/upload-picture", verifyToken, isCustomer, upload.single('profilePicture'), uploadProfilePicture);

// Delete customer account
CustomerRoutes.delete("/profile", verifyToken, isCustomer, deleteUser);

export default CustomerRoutes; 