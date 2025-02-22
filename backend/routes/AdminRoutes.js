// import express from 'express'
// import { Getuser, deletUser } from '../controllers/Admin.js'
// import { isAdmin } from '../middleware/verifyToken.js'

// const AdminRoutes=express.Router()
// AdminRoutes.get('/getuser', isAdmin, Getuser)
// AdminRoutes.post('/delet/:id', isAdmin, deletUser)


// export default AdminRoutes


import express from 'express';
import { Getuser, GetServiceProviders, deletUser } from '../controllers/Admin.js';
import { isAdmin } from '../middleware/verifyToken.js';

const AdminRoutes = express.Router();

// Fetch all customers
AdminRoutes.get('/customers', isAdmin, Getuser);

// Fetch all service providers
AdminRoutes.get('/service-providers', isAdmin, GetServiceProviders);

// Delete a user (service provider or customer)
AdminRoutes.delete('/delete-user/:id', isAdmin, deletUser);

export default AdminRoutes;