import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import Booking from '../models/Booking.js';
import ServiceProvider from '../models/ServiceProvider.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// GET /api/bookings/requests - Get pending booking requests for a service provider
router.get('/requests', verifyToken, async (req, res) => {
  try {
    console.log('User requesting bookings:', req.user);
    
    // Verify user is a service provider
    if (req.user.role !== 'serviceprovider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only service providers can view booking requests.'
      });
    }

    // Get pending bookings for the logged-in service provider
    const bookings = await Booking.find({
      providerId: req.user.userId,
      status: 'pending'
    })
    .populate('customerId', 'FullName Address PhoneNumber')
    .sort({ bookingDateTime: -1 });

    console.log('Found bookings:', bookings);

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking requests',
      error: error.message
    });
  }
});

// POST /api/bookings/request - Create a new booking request
router.post('/request', verifyToken, async (req, res) => {
  try {
    console.log('User making request:', req.user);
    
    // Verify user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only customers can create booking requests.'
      });
    }

    const { providerId, serviceType, isEmergency, notes } = req.body;

    // Validate required fields
    if (!providerId || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID and service type are required'
      });
    }

    // Get customer and provider details
    const customer = await Customer.findById(req.user.userId);
    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create new booking
    const booking = new Booking({
      customerId: req.user.userId,
      providerId,
      serviceType,
      price: provider.price,
      isEmergency: isEmergency || false,
      notes,
      status: 'pending',
      bookingDateTime: new Date()
    });

    // Save the booking
    const savedBooking = await booking.save();
    console.log('New booking created:', savedBooking);

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking request',
      error: error.message
    });
  }
});

// PUT /api/bookings/response/:bookingId - Accept or decline a booking request
router.put('/response/:bookingId', verifyToken, async (req, res) => {
  try {
    // Verify user is a service provider
    if (req.user.role !== 'serviceprovider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only service providers can respond to booking requests.'
      });
    }

    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either accepted or declined.'
      });
    }

    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.bookingId,
        providerId: req.user.userId,
        status: 'pending'
      },
      { status },
      { new: true }
    ).populate('customerId', 'fullName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already processed'
      });
    }

    const message = status === 'accepted' 
      ? 'Booking request accepted successfully'
      : 'Booking request declined';

    res.json({
      success: true,
      message,
      booking
    });
  } catch (error) {
    console.error('Error processing booking response:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing booking response',
      error: error.message
    });
  }
});

// GET /api/bookings - Get all bookings for a user with optional status filter
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // Set query based on user role
    if (req.user.role === 'customer') {
      query.customerId = req.user.userId;
    } else if (req.user.role === 'serviceprovider') {
      query.providerId = req.user.userId;
    }

    if (status) {
      query.status = status;
    }

    console.log('Fetching bookings with query:', query);

    const bookings = await Booking.find(query)
      .populate({
        path: 'customerId',
        select: 'FullName Address PhoneNumber Email',
        model: 'Customer'
      })
      .populate('providerId', 'fullName price')
      .sort({ bookingDateTime: -1 });

    console.log('Found bookings:', bookings);

    // Transform the response to include flattened customer details
    const transformedBookings = bookings.map(booking => {
      const { customerId, ...rest } = booking.toObject();
      return {
        ...rest,
        customerName: customerId?.FullName || 'Customer Name Unavailable',
        customerAddress: customerId?.Address || 'No address available',
        customerPhone: customerId?.PhoneNumber || 'No phone available',
        customerEmail: customerId?.Email,
        customerId: customerId?._id
      };
    });

    res.json({
      success: true,
      bookings: transformedBookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// GET /booking/history - Get booking history for customer or provider
router.get('/history', verifyToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'customer') {
      query.customerId = req.user.userId;
    } else if (req.user.role === 'serviceprovider') {
      query.providerId = req.user.userId;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'fullName address phoneNumber')
      .populate('providerId', 'fullName price')
      .sort({ bookingDateTime: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking history',
      error: error.message
    });
  }
});

// Update booking status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating booking ${id} to status: ${status}`);

    // Validate status
    const validStatuses = ['pending', 'accepted', 'declined', 'completed', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user has permission to update this booking
    if (booking.providerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['accepted', 'declined'],
      'accepted': ['completed', 'canceled'],
      'completed': [],
      'declined': [],
      'canceled': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${booking.status} to ${status}`
      });
    }

    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    console.log(`Successfully updated booking ${id} to status: ${status}`);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user has permission to view this booking
    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'serviceprovider' && booking.providerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

// Get all bookings for a service provider with status filter
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { providerId: req.user.userId };
    
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'fullName')
      .sort({ bookingDateTime: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

export default router; 