import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import ServiceProvider from '../models/ServiceProvider.js';

const router = express.Router();

// GET /api/serviceprovider/profile - Get service provider profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Verify user is a service provider
    if (req.user.role !== 'serviceprovider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only service providers can access this endpoint.'
      });
    }

    const provider = await ServiceProvider.findById(req.user.userId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    res.json({
      success: true,
      provider: {
        _id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        address: provider.address,
        serviceType: provider.serviceType,
        price: provider.price,
        rating: provider.rating,
        ratingCount: provider.ratingCount,
        isAvailable: provider.isAvailable
      }
    });
  } catch (error) {
    console.error('Error fetching service provider profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service provider profile',
      error: error.message
    });
  }
});

// GET /api/serviceprovider/:serviceType - Get service providers by service type
router.get('/:serviceType', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const providers = await ServiceProvider.find({
      serviceType: serviceType,
      isAvailable: true
    });

    res.json({
      success: true,
      providers: providers.map(provider => ({
        _id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        address: provider.address,
        serviceType: provider.serviceType,
        price: provider.price,
        rating: provider.rating,
        ratingCount: provider.ratingCount,
        isAvailable: provider.isAvailable
      }))
    });
  } catch (error) {
    console.error('Error fetching service providers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service providers',
      error: error.message
    });
  }
});

// Update service provider profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    // Verify user is a service provider
    if (req.user.role !== 'serviceprovider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a service provider.'
      });
    }

    const { fullName, serviceType, price, experience, address, phoneNumber } = req.body;

    const provider = await ServiceProvider.findByIdAndUpdate(
      req.user.userId,
      {
        fullName,
        serviceType,
        price,
        experience,
        address,
        phoneNumber
      },
      { new: true }
    ).select('-password');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      provider
    });
  } catch (error) {
    console.error('Error updating service provider profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service provider profile'
    });
  }
});

export default router; 