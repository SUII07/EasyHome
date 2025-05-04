import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import Booking from '../models/Booking.js';
import ServiceProvider from '../models/ServiceProvider.js';
import Customer from '../models/Customer.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
    .populate('customerId', 'FullName Address PhoneNumber latitude longitude plusCode')
    .populate('providerId', 'fullName address phoneNumber latitude longitude plusCode price')
    .sort({ bookingDateTime: -1 });

    // Format the response to handle null customerId
    const formattedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Handle case where customerId might be null
      if (!booking.customerId) {
        return {
          ...bookingObj,
          customerId: {
            FullName: 'Unknown Customer',
            Address: 'N/A',
            PhoneNumber: 'N/A'
          }
        };
      }

      return bookingObj;
    });

    console.log('Found bookings:', formattedBookings);

    res.json({
      success: true,
      bookings: formattedBookings
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

    // Send email notification to service provider
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const emailHtml = `
          <h2>New Booking Request</h2>
          <p>You have received a new booking request.</p>
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Service Type:</strong> ${serviceType}</li>
            <li><strong>Customer Name:</strong> ${customer.FullName}</li>
            <li><strong>Customer Phone:</strong> ${customer.PhoneNumber}</li>
            <li><strong>Customer Address:</strong> ${customer.Address}</li>
            <li><strong>Price:</strong> $${provider.price}/hr</li>
            <li><strong>Notes:</strong> ${notes || 'No additional notes'}</li>
          </ul>
          <p>Please log in to your account to accept or decline this request.</p>
        `;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: provider.email,
          subject: 'New Booking Request',
          html: emailHtml
        };

        await transporter.sendMail(mailOptions);
        console.log('Booking notification email sent to provider');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue with the request even if email fails
    }

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
    ).populate('customerId', 'FullName Email PhoneNumber latitude longitude plusCode');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already processed'
      });
    }

    // Send email notification to customer
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const emailHtml = `
          <h2>Booking Request ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
          <p>Your booking request has been ${status}.</p>
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Service Type:</strong> ${booking.serviceType}</li>
            <li><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</li>
            <li><strong>Price:</strong> $${booking.price}/hr</li>
          </ul>
          <p>You can view the details of this booking in your account.</p>
        `;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: booking.customerId.Email,
          subject: `Booking Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          html: emailHtml
        };

        await transporter.sendMail(mailOptions);
        console.log('Booking response email sent to customer');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue with the response even if email fails
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
        select: 'FullName Address PhoneNumber Email latitude longitude plusCode',
        model: 'Customer'
      })
      .populate('providerId', 'fullName address phoneNumber latitude longitude plusCode price')
      .sort({ bookingDateTime: -1 });

    console.log('Found bookings:', bookings);

    // Transform the response while keeping original field names
    const transformedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      return {
        ...bookingObj,
        customerId: bookingObj.customerId || {
          FullName: 'Unknown Customer',
          Address: 'No address available',
          PhoneNumber: 'No phone available',
          Email: 'No email available'
        }
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
      .populate('customerId', 'fullName address phoneNumber latitude longitude plusCode')
      .populate('providerId', 'fullName address phoneNumber latitude longitude plusCode price')
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
      .populate('providerId', 'fullName address phoneNumber latitude longitude plusCode price')
      .sort({ bookingDateTime: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

export default router; 