import express from "express";
import ServiceProvider from "../models/ServiceProvider.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get service provider profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.user.userId).select('-password');
    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }
    res.json({ success: true, provider });
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
});

// Update service provider profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address, price } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !phoneNumber || !address || !price) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    // Check if email is already taken by another provider
    const existingProvider = await ServiceProvider.findOne({ 
      email, 
      _id: { $ne: req.user.userId } 
    });
    if (existingProvider) {
      return res.status(400).json({ success: false, message: "Email is already in use" });
    }

    const provider = await ServiceProvider.findById(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }

    // Update provider fields
    provider.fullName = fullName;
    provider.email = email;
    provider.phoneNumber = phoneNumber;
    provider.address = address;
    provider.price = price;

    await provider.save();

    res.json({ 
      success: true, 
      message: "Profile updated successfully",
      provider: {
        fullName: provider.fullName,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        address: provider.address,
        price: provider.price,
        serviceType: provider.serviceType,
        rating: provider.rating
      }
    });
  } catch (error) {
    console.error("Error updating provider profile:", error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
});

// Delete service provider account
router.delete("/profile", verifyToken, async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndDelete(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider account:", error);
    res.status(500).json({ success: false, message: "Error deleting account" });
  }
});

// Get service provider statistics
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.user.userId);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }

    // Calculate statistics
    const stats = {
      rating: provider.rating || 0,
      totalReviews: provider.totalReviews || 0,
      experience: provider.experience || 0,
      availability: provider.availability || false,
      serviceType: provider.serviceType,
      price: provider.price
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching provider stats:", error);
    res.status(500).json({ success: false, message: "Error fetching statistics" });
  }
});

// Get all service providers
router.get("/", async (req, res) => {
  try {
    const providers = await ServiceProvider.find({ verificationStatus: "approved" })
      .select("-Password")
      .sort({ rating: -1 });
    res.json({ success: true, providers });
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch service providers" });
  }
});

// Get service providers by service type
router.get("/:serviceType", async (req, res) => {
  try {
    const { serviceType } = req.params;
    const { zipCode } = req.query;

    // Convert hyphenated service type to space-separated lowercase and create a regex pattern
    const searchTerm = serviceType.replace(/-/g, ' ').toLowerCase();
    const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive search

    console.log('Searching for service type pattern:', searchTerm); // Debug log

    let query = {
      serviceType: searchRegex,
      verificationStatus: "approved",
      availability: true
    };

    if (zipCode) {
      query.zipCode = zipCode;
    }

    console.log('Query:', JSON.stringify(query)); // Debug log

    const providers = await ServiceProvider.find(query)
      .select("-password")
      .sort({ rating: -1, experience: -1 });

    console.log('Found providers:', providers.length); // Debug log

    if (!providers.length) {
      return res.status(404).json({
        success: false,
        message: `No service providers found for ${searchTerm}`
      });
    }

    res.json({ success: true, providers });
  } catch (error) {
    console.error("Error fetching providers by service type:", error);
    res.status(500).json({ success: false, message: "Failed to fetch service providers" });
  }
});

// Get service provider details by ID
router.get("/details/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await ServiceProvider.findById(providerId).select("-Password");

    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }

    res.json({ success: true, provider });
  } catch (error) {
    console.error("Error fetching provider details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch provider details" });
  }
});

export default router; 
