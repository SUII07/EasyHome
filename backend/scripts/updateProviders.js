import mongoose from "mongoose";
import dotenv from "dotenv";
import ServiceProvider from "../models/ServiceProvider.js";
import bcrypt from "bcryptjs";

dotenv.config();

const updateProviders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    // Clear existing providers
    await ServiceProvider.deleteMany({});
    console.log("Cleared existing providers");

    // Hash password for all providers
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Add new providers with correct data
    const providers = [
      {
        fullName: "John Smith",
        email: "john.smith@example.com",
        phoneNumber: "+1234567890",
        zipCode: "2345",
        serviceType: "house cleaning",
        price: 25,
        password: hashedPassword,
        verificationStatus: "approved",
        isVerified: true,
        rating: 4.5,
        experience: 5,
        availability: true
      },
      {
        fullName: "Sarah Johnson",
        email: "sarah.j@example.com",
        phoneNumber: "+1987654321",
        zipCode: "2345",
        serviceType: "electrician",
        price: 75,
        password: hashedPassword,
        verificationStatus: "approved",
        isVerified: true,
        rating: 4.8,
        experience: 8,
        availability: true
      },
      {
        fullName: "Bijay Gurung",
        email: "bijay.g@example.com",
        phoneNumber: "+1122334455",
        zipCode: "2345",
        serviceType: "painting",
        price: 35,
        password: hashedPassword,
        verificationStatus: "approved",
        isVerified: true,
        rating: 4.2,
        experience: 3,
        availability: true
      },
      {
        fullName: "Vibek Rana",
        email: "vibek.r@example.com",
        phoneNumber: "+5544332211",
        zipCode: "2345",
        serviceType: "plumbing",
        price: 65,
        password: hashedPassword,
        verificationStatus: "approved",
        isVerified: true,
        rating: 4.5,
        experience: 6,
        availability: true
      },
      {
        fullName: "Arjun Das",
        email: "arjun.d@example.com",
        phoneNumber: "+6677889900",
        zipCode: "2345",
        serviceType: "hvac services",
        price: 85,
        password: hashedPassword,
        verificationStatus: "approved",
        isVerified: true,
        rating: 4.8,
        experience: 7,
        availability: true
      }
    ];

    await ServiceProvider.insertMany(providers);
    console.log("Added new providers");

    // Display updated providers
    const updatedProviders = await ServiceProvider.find({});
    console.log("\nUpdated provider details:");
    updatedProviders.forEach(provider => {
      console.log(`\nName: ${provider.fullName}`);
      console.log(`Service Type: ${provider.serviceType}`);
      console.log(`ZIP Code: ${provider.zipCode}`);
      console.log(`Verified: ${provider.isVerified}`);
      console.log(`Verification Status: ${provider.verificationStatus}`);
      console.log(`Available: ${provider.availability}`);
      console.log(`Rating: ${provider.rating}`);
      console.log(`Price: ${provider.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error updating providers:", error);
    process.exit(1);
  }
};

updateProviders(); 