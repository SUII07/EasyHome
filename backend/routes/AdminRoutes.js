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
import ServiceProvider from "../models/ServiceProvider.js";
import Customer from "../models/Customer.js";
import nodemailer from "nodemailer";

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

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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
AdminRoutes.get("/pending-providers", isAdmin, async (req, res) => {
  try {
    const pendingProviders = await ServiceProvider.find({ verificationStatus: "pending" })
      .select("-password")
      .select("+verificationDocument")
      .sort({ createdAt: -1 });

    const providers = pendingProviders.map(provider => ({
      _id: provider._id,
      fullName: provider.fullName,
      email: provider.email,
      phoneNumber: provider.phoneNumber,
      address: provider.address,
      serviceType: provider.serviceType,
      price: provider.price,
      createdAt: provider.createdAt,
      verificationDocument: provider.verificationDocument ? {
        url: provider.verificationDocument.url,
        originalName: provider.verificationDocument.originalName,
        mimeType: provider.verificationDocument.mimeType
      } : null
    }));

    res.json({
      success: true,
      providers
    });
  } catch (error) {
    console.error("Error fetching pending providers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending providers"
    });
  }
});

// Approve service provider
AdminRoutes.patch("/approve-provider/:providerId", isAdmin, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found"
      });
    }

    if (provider.verificationStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Provider is not in pending status"
      });
    }

    provider.verificationStatus = "approved";
    await provider.save();

    // Send approval email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: provider.email,
      subject: 'Account Approved - EasyHome',
      html: `
        <h2>Congratulations! Your EasyHome Account Has Been Approved</h2>
        <p>Dear ${provider.fullName},</p>
        <p>We are pleased to inform you that your service provider account has been approved.</p>
        <p>You can now log in to your account and start providing services through our platform.</p>
        <p>Thank you for choosing EasyHome!</p>
      `
    });

    res.json({
      success: true,
      message: "Service provider approved successfully",
      provider
    });
  } catch (error) {
    console.error("Error approving provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve provider"
    });
  }
});

// Reject service provider
AdminRoutes.put("/reject-provider/:providerId", isAdmin, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found"
      });
    }

    if (provider.verificationStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Provider is not in pending status"
      });
    }

    provider.verificationStatus = "rejected";
    await provider.save();

    // Send rejection email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: provider.email,
      subject: 'Account Status Update - EasyHome',
      html: `
        <h2>EasyHome Account Status Update</h2>
        <p>Dear ${provider.fullName},</p>
        <p>We regret to inform you that your service provider account application has been declined.</p>
        <p>This decision was made after careful review of your application and verification documents.</p>
        <p>If you believe this was a mistake or would like to submit a new application with updated information, please contact our support team.</p>
      `
    });

    res.json({
      success: true,
      message: "Service provider rejected successfully",
      provider
    });
  } catch (error) {
    console.error("Error rejecting provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject provider"
    });
  }
});

// Delete user (consolidated route)
AdminRoutes.delete("/delete/:userId", isAdmin, deleteUser);

export default AdminRoutes;
