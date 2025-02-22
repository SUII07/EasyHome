import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  providerId: { type: String, required: true },
  serviceType: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'pending' },
});

export default mongoose.model('Booking', BookingSchema);