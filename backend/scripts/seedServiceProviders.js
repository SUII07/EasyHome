import mongoose from "mongoose";
import dotenv from "dotenv";
import ServiceProvider from "../models/ServiceProvider.js";

dotenv.config();

const serviceProviders = [
  {
    FullName: "John Smith",
    PhoneNumber: "+1234567890",
    ZipCode: "12345",
    Email: "john.smith@example.com",
    password: "$2b$10$YourHashedPasswordHere", // You'll need to hash this
    role: "serviceprovider",
    serviceType: "House Cleaning",
    rating: 4.5,
    reviews: [
      {
        customerId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: "Excellent service!"
      }
    ],
    profilePhoto: "https://example.com/profile1.jpg",
    certificatePhoto: "https://example.com/cert1.jpg",
    isVerified: true
  },
  {
    FullName: "Sarah Johnson",
    PhoneNumber: "+1987654321",
    ZipCode: "12345",
    Email: "sarah.j@example.com",
    password: "$2b$10$YourHashedPasswordHere", // You'll need to hash this
    role: "serviceprovider",
    serviceType: "Plumbing",
    rating: 4.8,
    reviews: [
      {
        customerId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: "Very professional!"
      }
    ],
    profilePhoto: "https://example.com/profile2.jpg",
    certificatePhoto: "https://example.com/cert2.jpg",
    isVerified: true
  },
  {
    FullName: "Mike Wilson",
    PhoneNumber: "+1122334455",
    ZipCode: "12345",
    Email: "mike.w@example.com",
    password: "$2b$10$YourHashedPasswordHere", // You'll need to hash this
    role: "serviceprovider",
    serviceType: "Painting",
    rating: 4.2,
    reviews: [
      {
        customerId: new mongoose.Types.ObjectId(),
        rating: 4,
        comment: "Good work!"
      }
    ],
    profilePhoto: "https://example.com/profile3.jpg",
    certificatePhoto: "https://example.com/cert3.jpg",
    isVerified: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    // Clear existing service providers
    await ServiceProvider.deleteMany({});
    console.log("Cleared existing service providers");

    // Insert new service providers
    await ServiceProvider.insertMany(serviceProviders);
    console.log("Seeded service providers successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase(); 