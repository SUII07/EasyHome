import express from "express";
import ServiceProvider from "../models/ServiceProvider.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get service provider profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.user.userId).select("-Password");

    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }

    res.json({ success: true, provider });
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    res.status(500).json({ success: false, message: "Failed to fetch provider profile" });
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

    let query = {
      serviceType,
      verificationStatus: "approved",
      availability: true
    };

    if (zipCode) {
      query.ZipCode = zipCode;
    }

    const providers = await ServiceProvider.find(query)
      .select("-Password")
      .sort({ rating: -1, experience: -1 });

    if (!providers.length) {
      return res.status(404).json({
        success: false,
        message: "No service providers found for the specified criteria"
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
