import express from 'express';
import { Getuser, GetUserCounts, getCustomerById, getServiceProviderById, updateServiceProvider, updateCustomer } from '../controllers/Admin.js';
import { isAdmin, verifyToken } from '../middleware/verifyToken.js';
import {
  getPendingProviders,
  approveProvider,
  rejectProvider,
  deleteUser,
  deleteServiceProvider
} from "../controllers/AdminController.js";

const AdminRoutes = express.Router();

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

// Get pending service provider requests
AdminRoutes.get("/pending-providers", verifyToken, getPendingProviders);

// Approve service provider
AdminRoutes.patch("/approve-provider/:providerId", verifyToken, approveProvider);

// Reject service provider
AdminRoutes.patch("/reject-provider/:providerId", verifyToken, rejectProvider);

// Delete user (consolidated route)
AdminRoutes.delete("/delete/:userId", isAdmin, deleteUser);

export default AdminRoutes;
