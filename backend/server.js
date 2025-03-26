import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import AuthRoutes from "./routes/Auth.js";
import AdminRoutes from "./routes/AdminRoutes.js";
import ServiceProviderRoutes from "./routes/serviceProviderRoutes.js";
import CustomerRoutes from "./routes/CustomerRoutes.js";
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Database connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Routes
    app.use("/api/auth", AuthRoutes);
    app.use("/api/admin", AdminRoutes);
    app.use("/api/serviceprovider", ServiceProviderRoutes);
    app.use("/api/customer", CustomerRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/users", userRoutes);

    // Start the server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
