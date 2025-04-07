import express from 'express';
import EmergencyService from '../models/EmergencyService.js';
import ServiceProvider from '../models/ServiceProvider.js';
import { verifyToken as auth } from '../middleware/verifyToken.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Service type specific rates
const serviceRates = {
  electrician: 1.5,
  plumbing: 1.5,
  'hvac services': 1.5,
  'house cleaning': 1.3,
  painting: 1.3
};

// Create emergency service request
router.post('/request', auth, async (req, res) => {
  try {
    console.log('Received emergency service request:', req.body);
    const { providerId, address, serviceType } = req.body;

    if (!providerId || !address || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID, address, and service type are required'
      });
    }

    // Verify provider exists and is available
    const provider = await ServiceProvider.findOne({
      _id: providerId,
      availability: true,
      verificationStatus: 'approved'
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found or is not available'
      });
    }

    // Get emergency rate multiplier based on service type
    const rateMultiplier = serviceRates[serviceType.toLowerCase()] || 1.5;
    const emergencyPrice = provider.price * rateMultiplier;

    const emergencyService = new EmergencyService({
      customerId: req.user.userId,
      providerId,
      address,
      serviceType: serviceType.toLowerCase(),
      status: 'pending',
      isEmergency: true,
      price: emergencyPrice
    });

    await emergencyService.save();
    console.log('Emergency service request created:', emergencyService);

    // Try to send email notification, but don't fail if it errors
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const emailHtml = `
          <h2>Emergency Service Request</h2>
          <p>You have received an emergency service request.</p>
          <h3>Request Details:</h3>
          <ul>
            <li><strong>Service Type:</strong> ${serviceType}</li>
            <li><strong>Address:</strong> ${address}</li>
            <li><strong>Status:</strong> Pending</li>
            <li><strong>Emergency Rate:</strong> $${emergencyPrice}/hr (${rateMultiplier}x regular rate)</li>
          </ul>
          <p>Please log in to your account to accept or decline this request.</p>
          <p style="color: red;"><strong>Note:</strong> This is an emergency request and requires immediate attention.</p>
        `;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: provider.email,
          subject: '🚨 Emergency Service Request',
          html: emailHtml
        };

        await transporter.sendMail(mailOptions);
        console.log('Emergency notification email sent to provider');
      } else {
        console.log('Email notification skipped - missing email credentials');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue with the request even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Emergency service request created successfully',
      data: emergencyService
    });
  } catch (error) {
    console.error('Error in /request route:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating emergency service request',
      error: error.message
    });
  }
});

// Helper function to normalize address for comparison
const normalizeAddress = (address) => {
  if (!address) return [];
  // Remove any special characters and extra spaces
  return address
    .toLowerCase()
    .replace(/[^\w\s,]/g, '')
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0);
};

// Get nearby service providers
router.get('/providers', auth, async (req, res) => {
  try {
    console.log('Received emergency provider request:', req.query);
    const { address, serviceType } = req.query;

    if (!address || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Address and service type are required'
      });
    }

    // Normalize the user's input address
    const normalizedInputAddress = normalizeAddress(address);
    console.log('Normalized input address:', normalizedInputAddress);

    if (normalizedInputAddress.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid address with area and city'
      });
    }

    // Find all providers of the specified service type with case-insensitive search
    console.log('Searching for providers with serviceType:', serviceType);
    
    // First, let's find all providers without any filters to see what's in the database
    const allProvidersInDB = await ServiceProvider.find({});
    console.log('All providers in database:', JSON.stringify(allProvidersInDB, null, 2));

    // Create a case-insensitive regex pattern for service type
    const serviceTypePattern = new RegExp('^' + serviceType.replace(/[-\s]/g, '[-\\s]') + '$', 'i');
    console.log('Service type pattern:', serviceTypePattern);

    // Now try to find providers with our filters
    const allProviders = await ServiceProvider.find({
      serviceType: serviceTypePattern,
      availability: true,
      verificationStatus: 'approved'
    }).select('fullName phoneNumber address rating totalReviews profileImage price serviceType availability verificationStatus');

    console.log('Found providers with filters:', JSON.stringify(allProviders, null, 2));
    console.log('Query filters used:', {
      serviceType: serviceTypePattern,
      availability: true,
      verificationStatus: 'approved'
    });

    // Filter providers based on address match with more lenient matching
    const providers = allProviders.filter(provider => {
      if (!provider.address) {
        console.log(`Provider ${provider.fullName} has no address`);
        return false;
      }
      
      const normalizedProviderAddress = normalizeAddress(provider.address);
      console.log(`Comparing addresses for ${provider.fullName}:`, {
        provider: normalizedProviderAddress,
        user: normalizedInputAddress,
        rawProviderAddress: provider.address,
        rawUserAddress: address
      });

      // More lenient area matching - check if the area contains or is contained in the provider's area
      const areaMatch = 
        normalizedProviderAddress[0].includes(normalizedInputAddress[0]) ||
        normalizedInputAddress[0].includes(normalizedProviderAddress[0]) ||
        // Add fuzzy matching for common variations
        (normalizedProviderAddress[0].includes('tokha') && normalizedInputAddress[0].includes('tokha'));
      
      // More lenient city matching
      const cityMatch = 
        normalizedInputAddress.length < 2 || 
        normalizedProviderAddress[1].includes(normalizedInputAddress[1]) ||
        normalizedInputAddress[1].includes(normalizedProviderAddress[1]) ||
        // Add common variations of Kathmandu
        (normalizedProviderAddress[1].includes('kathmandu') && normalizedInputAddress[1].includes('kathmandu')) ||
        (normalizedProviderAddress[1].includes('ktm') && normalizedInputAddress[1].includes('kathmandu')) ||
        (normalizedProviderAddress[1].includes('kathmandu') && normalizedInputAddress[1].includes('ktm'));

      console.log(`Address match results for ${provider.fullName}:`, {
        areaMatch,
        cityMatch,
        finalMatch: areaMatch && cityMatch,
        normalizedProviderArea: normalizedProviderAddress[0],
        normalizedUserArea: normalizedInputAddress[0],
        normalizedProviderCity: normalizedProviderAddress[1],
        normalizedUserCity: normalizedInputAddress[1]
      });

      return areaMatch && cityMatch;
    });

    // Log the final results
    console.log('Final results:', {
      totalProvidersInDB: allProvidersInDB.length,
      providersMatchingServiceType: allProviders.length,
      providersMatchingAddress: providers.length,
      matchedProviders: providers.map(p => ({
        name: p.fullName,
        address: p.address,
        serviceType: p.serviceType,
        availability: p.availability,
        verificationStatus: p.verificationStatus
      }))
    });

    res.status(200).json({
      success: true,
      providers,
      message: providers.length > 0 
        ? `Found ${providers.length} providers in ${normalizedInputAddress[0]}`
        : `No providers found in ${normalizedInputAddress[0]}`
    });
  } catch (error) {
    console.error('Error in /providers route:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding service providers',
      error: error.message
    });
  }
});

// Accept emergency service request (for providers)
router.post('/accept/:requestId', auth, async (req, res) => {
  try {
    console.log('Received accept request for:', req.params.requestId);
    const emergencyService = await EmergencyService.findById(req.params.requestId);
    
    if (!emergencyService) {
      return res.status(404).json({
        success: false,
        message: 'Emergency service request not found'
      });
    }

    // Verify that the provider is available in the requested area
    const provider = await ServiceProvider.findById(req.user._id);
    if (!provider || !provider.address.match(new RegExp(emergencyService.address, 'i'))) {
      return res.status(400).json({
        success: false,
        message: 'Provider is not available in the requested area'
      });
    }

    emergencyService.providerId = req.user._id;
    emergencyService.status = 'accepted';
    await emergencyService.save();

    console.log('Emergency service request accepted:', emergencyService);

    res.status(200).json({
      success: true,
      message: 'Emergency service request accepted',
      data: emergencyService
    });
  } catch (error) {
    console.error('Error in /accept route:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting emergency service request',
      error: error.message
    });
  }
});

export default router; 