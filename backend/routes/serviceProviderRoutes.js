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
    
    // Convert the serviceType to lowercase and handle URL encoding
    const normalizedServiceType = decodeURIComponent(serviceType).toLowerCase().replace(/-/g, ' ');
    
    console.log('Fetching providers for service type:', normalizedServiceType);

    // First, find all providers of this type to check if they exist
    const allProvidersOfType = await ServiceProvider.find({
      serviceType: normalizedServiceType
    });

    console.log('Total providers of this type (before filters):', allProvidersOfType.length);
    
    if (allProvidersOfType.length === 0) {
      console.log('No providers found with service type:', normalizedServiceType);
      console.log('Available service types in the system:', 
        await ServiceProvider.distinct('serviceType'));
    } else {
      console.log('Provider verification status breakdown:',
        allProvidersOfType.reduce((acc, provider) => {
          acc[provider.verificationStatus] = (acc[provider.verificationStatus] || 0) + 1;
          return acc;
        }, {}));
    }

    // Now apply all filters
    const providers = await ServiceProvider.find({
      serviceType: normalizedServiceType,
      verificationStatus: 'approved',
      isVerified: true,
      availability: true
    });

    console.log(`Found ${providers.length} approved and available providers`);

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
        averageRating: provider.averageRating,
        totalReviews: provider.totalReviews,
        experience: provider.experience,
        description: provider.description,
        verificationStatus: provider.verificationStatus,
        isVerified: provider.isVerified,
        availability: provider.availability
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

// POST /api/serviceprovider/:id/rate - Rate a service provider
router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating, review, bookingId, customerName } = req.body;
    const providerId = req.params.id;
    const customerId = req.user.userId;

    console.log('Rating request received:', {
      providerId,
      customerId,
      customerName,
      rating,
      review,
      bookingId
    });

    // Validate required fields
    if (!rating || !bookingId || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        details: {
          rating: !rating ? 'Rating is required' : null,
          bookingId: !bookingId ? 'Booking ID is required' : null,
          customerName: !customerName ? 'Customer name is required' : null
        }
      });
    }

    // Validate rating
    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5'
      });
    }

    // Find the service provider
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      console.log('Provider not found:', providerId);
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    // Check if the customer has already rated this booking
    const existingRating = provider.ratings.find(
      r => r.bookingId.toString() === bookingId
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this booking'
      });
    }

    // Add the new rating with customer name
    provider.ratings.push({
      rating,
      review,
      customerId,
      bookingId,
      customerName
    });

    // Save the provider (this will trigger the pre-save middleware)
    try {
      await provider.save();
    } catch (saveError) {
      console.error('Error saving provider:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving rating',
        error: saveError.message,
        details: saveError.errors
      });
    }

    // Fetch the updated provider
    const updatedProvider = await ServiceProvider.findById(providerId);

    console.log('Rating saved successfully:', {
      providerId,
      averageRating: provider.averageRating,
      totalReviews: provider.totalReviews
    });

    // Get the latest rating
    const latestRating = updatedProvider.ratings[updatedProvider.ratings.length - 1];

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      provider: {
        averageRating: provider.averageRating,
        totalReviews: provider.totalReviews
      },
      rating: {
        ...latestRating.toObject(),
        customerName: latestRating.customerName
      }
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router; 