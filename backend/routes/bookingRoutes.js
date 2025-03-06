// routes/bookingRoutes.js
import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// Create a new booking
router.post("/create", async (req, res) => {
  const { customerName, serviceType, serviceProviderName, address, phoneNumber, description } = req.body;

  try {
    console.log("Received booking data:", req.body); // Log the received data

    const newBooking = new Booking({
      customerName,
      serviceType,
      serviceProviderName,
      address,
      phoneNumber,
      description,
    });

    await newBooking.save();
    console.log("Booking saved:", newBooking); // Log the saved booking
    res.json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking", error });
  }
});

export default router;