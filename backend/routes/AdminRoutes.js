import express from 'express';
import { Getuser, GetUserCounts, getCustomerById, getServiceProviderById, updateServiceProvider, updateCustomer, getAdminProfile, updateAdminProfile } from '../controllers/Admin.js';
import { isAdmin, verifyToken } from '../middleware/verifyToken.js';
import {
  getPendingProviders,
  approveProvider,
  rejectProvider,
  deleteUser,
  deleteServiceProvider,
  uploadProfilePicture
} from "../controllers/AdminController.js";
import multer from 'multer';

const AdminRoutes = express.Router();

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

// Test route
AdminRoutes.get('/test', isAdmin, (req, res) => {
  res.json({ message: 'You are an admin!' });
});

// Existing routes
AdminRoutes.get('/getuser', isAdmin, Getuser);
AdminRoutes.get('/getusercounts', isAdmin, GetUserCounts);

// New routes for fetching individual user details
AdminRoutes.get('/customers/:id', isAdmin, getCustomerById);
AdminRoutes.put('/customers/:id', isAdmin, updateCustomer);
AdminRoutes.get('/serviceproviders/:id', isAdmin, getServiceProviderById);
AdminRoutes.put('/serviceproviders/:id', isAdmin, updateServiceProvider);
AdminRoutes.delete('/serviceproviders/:id', isAdmin, deleteServiceProvider);

// Admin profile routes
AdminRoutes.get('/profile/:id', isAdmin, getAdminProfile);
AdminRoutes.put('/profile/:id', isAdmin, updateAdminProfile);
AdminRoutes.post('/profile/:id/upload-picture', isAdmin, upload.single('profilePicture'), uploadProfilePicture);

// Get pending service provider requests
AdminRoutes.get("/pending-providers", isAdmin, getPendingProviders);

// Approve service provider
AdminRoutes.patch("/approve-provider/:providerId", isAdmin, approveProvider);

// Reject service provider
AdminRoutes.patch("/reject-provider/:providerId", isAdmin, rejectProvider);

// Delete user (consolidated route)
AdminRoutes.delete("/delete/:userId", isAdmin, deleteUser);

export default AdminRoutes;
