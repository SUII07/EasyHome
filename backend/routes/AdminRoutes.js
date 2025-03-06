import express from 'express';
import { Getuser, deletUser, GetUserCounts, getCustomerById, getServiceProviderById } from '../controllers/Admin.js';
import { isAdmin } from '../middleware/verifyToken.js';

const AdminRoutes = express.Router();

// Test route
AdminRoutes.get('/test', isAdmin, (req, res) => {
  res.json({ message: 'You are an admin!' });
});

// Existing routes
AdminRoutes.get('/getuser', isAdmin, Getuser);
AdminRoutes.delete('/delete/:id', isAdmin, deletUser);
AdminRoutes.get('/getusercounts', isAdmin, GetUserCounts);

// New routes for fetching individual user details
AdminRoutes.get('/customers/:id', isAdmin, getCustomerById);
AdminRoutes.get('/serviceproviders/:id', isAdmin, getServiceProviderById);

export default AdminRoutes;