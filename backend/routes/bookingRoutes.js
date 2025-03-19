// routes/bookingRoutes.js
import express from "express";
import Booking from "../models/Booking.js";
import ServiceProvider from "../models/ServiceProvider.js";

const router = express.Router();

// Fetch service providers by service type
router.post("/getProviders", async (req, res) => {
  const { serviceType } = req.body;

  console.log("Received request for service type:", serviceType); // Log the service type

  if (!serviceType) {
    return res.status(400).json({ message: "Service type is required" });
  }

  try {
    const providers = await ServiceProvider.find({ serviceType });
    if (providers.length === 0) {
      return res.status(404).json({ message: "No service providers found for the given service type" });
    }
    res.json(providers);
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({ message: "Error fetching service providers", error: error.message });
  }
});

// Create a new booking
router.post("/create", async (req, res) => {
  const { customerName, serviceType, serviceProviderName, address, phoneNumber, description, price, customerPrice } = req.body;

  try {
    const newBooking = new Booking({
      customerName,
      serviceType,
      serviceProviderName,
      address,
      phoneNumber,
      description,
      price,
      customerPrice,
    });

    await newBooking.save();
    res.json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error });
  }
});

// Update booking status (Accept/Decline)
router.put("/updateStatus/:id", async (req, res) => {
  const { id } = req.params;
  const { status, serviceProviderPrice } = req.body;

  try {
    const booking = await Booking.findByIdAndUpdate(id, { status, serviceProviderPrice }, { new: true });
    res.json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status", error });
  }
});

export default router;