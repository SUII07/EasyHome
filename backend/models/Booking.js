import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true }, 
  serviceType: { type: String, required: true }, 
  serviceProviderName: { type: String, required: true }, 
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true }, 
  description: { type: String }, 
  status: { type: String, default: "Pending" }, 
});

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
