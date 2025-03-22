import Booking from "../models/Booking.js";
import ServiceProvider from "../models/ServiceProvider.js";
import Customer from "../models/Customer.js";

// Helper function to get base price for service type
const getBasePrice = (serviceType) => {
  const basePrices = {
    "house cleaning": 25,
    "electrician": 75,
    "painting": 35,
    "plumbing": 65,
    "hvac services": 85
  };
  return basePrices[serviceType] || 50;
};

// Helper function to calculate estimated price based on rating and experience
const calculateEstimatedPrice = (basePrice, rating, experience) => {
  const ratingMultiplier = 1 + (rating / 10); // 10% increase per rating point
  const experienceMultiplier = 1 + (experience / 20); // 5% increase per year of experience
  return Math.round(basePrice * ratingMultiplier * experienceMultiplier);
};

// Get available service providers for booking
export const getProviders = async (req, res) => {
  try {
    const { serviceType, zipCode } = req.body;
    console.log('Received request:', { serviceType, zipCode });

    // Validate service type
    if (!serviceType) {
      return res.status(400).json({
        success: false,
        message: "Service type is required"
      });
    }

    // Validate service type is one of the allowed values
    const allowedServiceTypes = ['house cleaning', 'electrician', 'painting', 'plumbing', 'hvac services'];
    if (!allowedServiceTypes.includes(serviceType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid service type. Must be one of: ${allowedServiceTypes.join(', ')}`
      });
    }

    // Build query
    const query = {
      verificationStatus: "approved",
      availability: true,
      serviceType: { $regex: new RegExp(serviceType, 'i') }
    };

    // Only add zipCode to query if it's provided
    if (zipCode) {
      query.zipCode = zipCode;
    }

    console.log('Executing query:', query);

    const providers = await ServiceProvider.find(query)
      .select("-password") // Exclude password from response
      .sort({ rating: -1, experience: -1 }); // Sort by rating and experience

    console.log(`Found ${providers.length} providers`);

    if (providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: zipCode 
          ? `No service providers found for ${serviceType} in area ${zipCode}`
          : `No service providers found for ${serviceType}. Please try a different service type or contact support.`
      });
    }

    // Calculate estimated price for each provider
    const providersWithPrice = providers.map(provider => {
      const basePrice = provider.price || 50; // Use the price field from the model
      const ratingMultiplier = (provider.rating || 3) / 3; // Higher rating = higher price
      const experienceMultiplier = 1 + (provider.experience || 0) / 10; // More experience = higher price
      const estimatedPrice = Math.round(basePrice * ratingMultiplier * experienceMultiplier);

      return {
        ...provider.toObject(),
        estimatedPrice
      };
    });

    console.log('Sending response with providers:', providersWithPrice);
    res.status(200).json({
      success: true,
      providers: providersWithPrice
    });
  } catch (error) {
    console.error('Error in getProviders:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching service providers",
      error: error.message
    });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      serviceProviderId,
      serviceType,
      bookingDate,
      bookingTime,
      address,
      notes
    } = req.body;

    const customerId = req.user._id; // Get customer ID from authenticated user

    // Validate required fields
    if (!serviceProviderId || !serviceType || !bookingDate || !bookingTime || !address) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Check if service provider exists and is available
    const serviceProvider = await ServiceProvider.findOne({
      _id: serviceProviderId,
      verificationStatus: "approved",
      availability: true
    });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found or unavailable"
      });
    }

    // Create new booking
    const booking = new Booking({
      customerId,
      serviceProviderId,
      serviceType,
      bookingDate,
      bookingTime,
      address,
      notes,
      status: "pending"
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    console.error("Error in createBooking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking"
    });
  }
};

// Get all bookings for a customer
export const getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user._id;

    const bookings = await Booking.find({ customerId })
      .populate("serviceProviderId", "FullName PhoneNumber")
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error("Error in getCustomerBookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer bookings"
    });
  }
};

// Get all bookings for a service provider
export const getServiceProviderBookings = async (req, res) => {
  try {
    const serviceProviderId = req.user._id;

    const bookings = await Booking.find({ serviceProviderId })
      .populate("customerId", "FullName PhoneNumber")
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error("Error in getServiceProviderBookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching service provider bookings"
    });
  }
};

// Get booking details by ID
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ customerId: userId }, { serviceProviderId: userId }]
    })
      .populate("customerId", "FullName PhoneNumber")
      .populate("serviceProviderId", "FullName PhoneNumber");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Error in getBookingDetails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking details"
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      serviceProviderId: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: "Booking status updated successfully",
      booking
    });
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status"
    });
  }
}; 