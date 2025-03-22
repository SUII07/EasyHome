import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import DbCon from "./utils/db.js";
import AuthRoutes from "./routes/Auth.js";
import AdminRoutes from "./routes/AdminRoutes.js";
import serviceProviderRoutes from "./routes/serviceProviderController.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

// Initialize the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await DbCon();

    // Middleware
    app.use(express.json());
    app.use(cookieParser());
    app.use(
      cors({
        credentials: true,
        origin: ["http://localhost:5173", "http://localhost:5174"],
      })
    );

    // Routes
    app.use("/api/auth", AuthRoutes);
    app.use("/api/admin", AdminRoutes);
    app.use("/api/serviceProvider", serviceProviderRoutes);
    app.use("/api/booking", bookingRoutes);

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
