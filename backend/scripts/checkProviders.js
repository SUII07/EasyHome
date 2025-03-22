import mongoose from "mongoose";
import dotenv from "dotenv";
import ServiceProvider from "../models/ServiceProvider.js";

dotenv.config();

const checkProviders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    // Get all providers
    const allProviders = await ServiceProvider.find({});
    console.log("\nTotal providers:", allProviders.length);

    // Get approved providers
    const approvedProviders = await ServiceProvider.find({ isVerified: true });
    console.log("Approved providers:", approvedProviders.length);

    // Get providers by service type
    const serviceTypes = ['house cleaning', 'electrician', 'painting', 'plumbing', 'hvac services'];
    console.log("\nProviders by service type:");
    for (const type of serviceTypes) {
      const providers = await ServiceProvider.find({ 
        serviceType: { $regex: new RegExp(type, 'i') },
        isVerified: true
      });
      console.log(`${type}: ${providers.length} providers`);
    }

    // Display provider details
    console.log("\nProvider details:");
    allProviders.forEach(provider => {
      console.log(`\nName: ${provider.fullName}`);
      console.log(`Service Type: ${provider.serviceType}`);
      console.log(`ZIP Code: ${provider.zipCode}`);
      console.log(`Verified: ${provider.isVerified}`);
      console.log(`Available: ${provider.isAvailable}`);
      console.log(`Rating: ${provider.rating}`);
      console.log(`Price per hour: ${provider.pricePerHour}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error checking providers:", error);
    process.exit(1);
  }
};

checkProviders(); 