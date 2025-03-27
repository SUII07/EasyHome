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
        totalReviews: provider.totalReviews,
        availability: provider.availability
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

// GET /api/serviceprovider/reviews - Get service provider reviews
router.get('/reviews', verifyToken, async (req, res) => {
  try {
    console.log('Fetching reviews for provider:', req.user);
    
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

    console.log('Found provider reviews:', provider.reviews);

    res.json({
      success: true,
      reviews: provider.reviews
    });
  } catch (error) {
    console.error('Error fetching service provider reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// GET /api/serviceprovider/details/:providerId - Get service provider details by ID
router.get('/details/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await ServiceProvider.findById(providerId).select('-password');

    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }

    res.json({ success: true, provider });
  } catch (error) {
    console.error("Error fetching provider details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch provider details" });
  }
});

// GET /api/serviceprovider/:serviceType - Get service providers by type
router.get('/:serviceType', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const formattedServiceType = serviceType.toLowerCase().replace(/-/g, ' ');
    console.log('Fetching providers for service type:', formattedServiceType);

    // Find all providers of the specified type
    const allProviders = await ServiceProvider.find({ 
      serviceType: { $regex: new RegExp(formattedServiceType, 'i') },
      verificationStatus: 'approved',
      availability: true
    });

    console.log('Found providers:', allProviders.length);

    if (allProviders.length === 0) {
      // Get all available service types to help with debugging
      const allServiceTypes = await ServiceProvider.distinct('serviceType');
      console.log('Available service types in the system:', allServiceTypes);
      
      return res.json({
        success: true,
        providers: [],
        message: `No available providers found for ${formattedServiceType}`
      });
    }

    res.json({
      success: true,
      providers: allProviders.map(provider => ({
        _id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        address: provider.address,
        serviceType: provider.serviceType,
        price: provider.price || 0,
        rating: provider.rating || 0,
        totalReviews: provider.totalReviews || 0,
        experience: provider.experience,
        availability: provider.availability,
        profileImage: provider.profileImage
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
    const existingReview = provider.reviews.find(
      r => r.bookingId.toString() === bookingId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this booking'
      });
    }

    // Add the new review
    provider.reviews.push({
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
        message: 'Error saving review',
        error: saveError.message,
        details: saveError.errors
      });
    }

    // Fetch the updated provider
    const updatedProvider = await ServiceProvider.findById(providerId);

    console.log('Review saved successfully:', {
      providerId,
      rating: provider.rating,
      totalReviews: provider.totalReviews
    });

    // Get the latest review
    const latestReview = updatedProvider.reviews[updatedProvider.reviews.length - 1];

    res.json({
      success: true,
      message: 'Review submitted successfully',
      provider: {
        rating: provider.rating,
        totalReviews: provider.totalReviews
      },
      review: {
        ...latestReview.toObject(),
        customerName: latestReview.customerName
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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