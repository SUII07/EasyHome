import CustomerModel from "../models/Customer.js";
import ServiceProviderModel from "../models/ServiceProvider.js";
import AdminModel from "../models/admin.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Register function
const register = async (req, res) => {
  try {
    const { FullName, PhoneNumber, ZipCode, Email, password, ConfirmPassword, role, serviceType } = req.body; // Add serviceType here

    console.log("Received registration request:", { FullName, PhoneNumber, ZipCode, Email, role, serviceType });

    if (!FullName || !PhoneNumber || !ZipCode || !Email || !password || !ConfirmPassword) {
      console.log("Missing required fields");
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if the email already exists in any of the role-specific collections
    const existingAdmin = await AdminModel.findOne({ Email });
    const existingCustomer = await CustomerModel.findOne({ Email });
    const existingServiceProvider = await ServiceProviderModel.findOne({ Email });

    if (existingAdmin || existingCustomer || existingServiceProvider) {
      console.log("User already exists:", Email);
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    if (password !== ConfirmPassword) {
      console.log("Passwords do not match");
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    let newUser;

    if (Email.includes(".admin@")) {
      newUser = new AdminModel({
        FullName,
        PhoneNumber,
        ZipCode,
        Email,
        password: await bcryptjs.hash(password, 10),
        role: "admin",
      });
    } else {
      // For non-admin users, ensure a valid role is provided
      if (!role || (role !== "customer" && role !== "serviceprovider")) {
        console.log("Invalid role selected:", role);
        return res.status(400).json({ success: false, message: "Please select a valid role (Customer or Service Provider)" });
      }

      if (role === "customer") {
        newUser = new CustomerModel({
          FullName,
          PhoneNumber,
          ZipCode,
          Email,
          password: await bcryptjs.hash(password, 10),
          role: "customer",
        });
      } else if (role === "serviceprovider") {
        // Ensure serviceType is provided for service providers
        if (!serviceType) {
          console.log("Service type is required for service providers");
          return res.status(400).json({ success: false, message: "Service type is required for service providers" });
        }

        newUser = new ServiceProviderModel({
          FullName,
          PhoneNumber,
          ZipCode,
          Email,
          password: await bcryptjs.hash(password, 10),
          role: "serviceprovider",
          serviceType, // Add serviceType here
        });
      }
    }

    console.log("Creating new user:", newUser);
    await newUser.save(); // Save the user in the role-specific collection

    res.status(201).json({ success: true, message: "User registered successfully", role });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const Login = async (req, res) => {
  try {
    const { Email, password } = req.body;

    // Check all role-specific collections for the user
    const admin = await AdminModel.findOne({ Email });
    const customer = await CustomerModel.findOne({ Email });
    const serviceProvider = await ServiceProviderModel.findOne({ Email });

    const user = admin || customer || serviceProvider;

    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Include role in the token payload
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures cookies are sent over HTTPS in production
      maxAge: 3600000, // 1 hour
    });
    
    res.status(200).json({ success: true, message: "Login successful", user: { _id: user._id, role: user.role } });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout function
const Logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { register, Login, Logout };