import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createBooking,
  getCustomerBookings,
  getServiceProviderBookings,
  updateBookingStatus,
  getBookingDetails,
  getProviders
} from "../controllers/BookingController.js";

const router = express.Router();

// Get available service providers for booking (must be before parameterized routes)
router.post("/getProviders", getProviders);

// Get all bookings for a customer
router.get("/customer", verifyToken, getCustomerBookings);

// Get all bookings for a service provider
router.get("/provider", verifyToken, getServiceProviderBookings);

// Get booking details by ID
router.get("/:bookingId", verifyToken, getBookingDetails);

// Create a new booking
router.post("/", verifyToken, createBooking);

// Update booking status
router.patch("/:bookingId/status", verifyToken, updateBookingStatus);

export default router; 
