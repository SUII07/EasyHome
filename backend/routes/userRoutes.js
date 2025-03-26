import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// GET /api/users/customer/:id - Get customer details by ID
router.get('/customer/:id', verifyToken, async (req, res) => {
  try {
    const customerId = req.params.id;
    
    // Find the customer
    const customer = await Customer.findById(customerId).select('FullName Address PhoneNumber Email');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      customer: {
        _id: customer._id,
        FullName: customer.FullName,
        Address: customer.Address,
        PhoneNumber: customer.PhoneNumber,
        Email: customer.Email
      }
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer details',
      error: error.message
    });
  }
});

export default router; 