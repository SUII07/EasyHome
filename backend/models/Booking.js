// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  serviceType: { type: String, required: true },
  serviceProviderName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "Pending" }, // Pending, Accepted, Declined
  customerPrice: { type: Number },
  serviceProviderPrice: { type: Number },
}, { timestamps: true });

const BookingModel = mongoose.model('Booking', bookingSchema);
export default BookingModel;