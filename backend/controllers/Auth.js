import CustomerModel from "../models/Customer.js";
import ServiceProviderModel from "../models/ServiceProvider.js";
import AdminModel from "../models/admin.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Register function
const register = async (req, res) => {
  try {
    const { fullName, phoneNumber, address, email, password, confirmPassword, role, serviceType, price } = req.body;

    console.log("Received registration request:", { fullName, phoneNumber, address, email, role, serviceType, price });

    if (!fullName || !phoneNumber || !address || !email || !password || !confirmPassword) {
      console.log("Missing required fields");
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if the email already exists in any of the role-specific collections
    const existingAdmin = await AdminModel.findOne({ Email: email });
    const existingCustomer = await CustomerModel.findOne({ Email: email });
    const existingServiceProvider = await ServiceProviderModel.findOne({ email });

    if (existingAdmin || existingCustomer || existingServiceProvider) {
      console.log("User already exists:", email);
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    let newUser;

    if (email.includes(".admin@")) {
      newUser = new AdminModel({
        FullName: fullName,
        PhoneNumber: phoneNumber,
        Address: address,
        Email: email,
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
          FullName: fullName,
          PhoneNumber: phoneNumber,
          Address: address,
          Email: email,
          password: await bcryptjs.hash(password, 10),
          role: "customer",
        });
      } else if (role === "serviceprovider") {
        // Ensure serviceType and price are provided for service providers
        if (!serviceType || !price) {
          console.log("Service type and price are required for service providers");
          return res.status(400).json({ 
            success: false, 
            message: "Service type and price are required for service providers" 
          });
        }

        // Convert serviceType to lowercase for consistency
        const normalizedServiceType = serviceType.toLowerCase();

        // Validate service type against allowed values
        const validServiceTypes = ["house cleaning", "electrician", "painting", "plumbing", "hvac services"];
        if (!validServiceTypes.includes(normalizedServiceType)) {
          console.log("Invalid service type:", serviceType);
          return res.status(400).json({
            success: false,
            message: "Invalid service type. Please select from: House Cleaning, Electrician, Painting, Plumbing, or HVAC Services"
          });
        }

        // Validate price
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
          console.log("Invalid price:", price);
          return res.status(400).json({
            success: false,
            message: "Please enter a valid price greater than 0"
          });
        }

        newUser = new ServiceProviderModel({
          fullName,
          phoneNumber,
          address,
          email,
          password: await bcryptjs.hash(password, 10),
          role: "serviceprovider",
          serviceType: normalizedServiceType,
          price: numericPrice,
          verificationStatus: "pending",
          isVerified: false,
          rating: 0,
          totalReviews: 0,
          experience: 0,
          availability: true
        });
      }
    }

    console.log("Creating new user:", newUser);
    await newUser.save(); // Save the user in the role-specific collection

    res.status(201).json({ success: true, message: "User registered successfully", role });
  } catch (error) {
    console.error("Error during registration:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: "Validation error", 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check all role-specific collections for the user
    const admin = await AdminModel.findOne({ Email: email });
    const customer = await CustomerModel.findOne({ Email: email });
    const serviceProvider = await ServiceProviderModel.findOne({ email });

    let user = admin || customer || serviceProvider;

    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Set role based on which model found the user
    if (admin) {
      user.role = "admin";
    } else if (customer) {
      user.role = "customer";
    } else if (serviceProvider) {
      user.role = "serviceprovider";
    }

    // Special handling for service providers
    if (user.role === "serviceprovider") {
      if (user.verificationStatus === "pending") {
        return res.status(403).json({
          success: false,
          message: "Your account is pending admin approval. Please wait for verification."
        });
      }
      if (user.verificationStatus === "rejected") {
        return res.status(403).json({
          success: false,
          message: "Your account has been rejected. Please contact support for more information."
        });
      }
    }

    // Include role, verification status, and other relevant info in the token payload
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role, 
        fullName: user.fullName || user.FullName,
        FullName: user.FullName,
        verificationStatus: user.verificationStatus || 'approved'
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    // Prepare user data for response
    const userData = {
      _id: user._id,
      role: user.role,
      fullName: user.fullName || user.FullName,
      verificationStatus: user.verificationStatus || 'approved',
      email: user.email || user.Email,
      phoneNumber: user.phoneNumber || user.PhoneNumber,
      address: user.address || user.Address
    };

    // Add service provider specific data
    if (user.role === "serviceprovider") {
      userData.serviceType = user.serviceType;
      userData.price = user.price;
      userData.rating = user.rating;
      userData.totalReviews = user.totalReviews;
      userData.availability = user.availability;
      userData.profilePicture = user.profilePicture;
      userData.certificate = user.certificate;
    }

    const responseData = {
      success: true,
      message: "Login successful",
      token: token,
      user: userData
    };

    console.log("Login response sent:", responseData);
    res.status(200).json(responseData);
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

// Get user profile
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find user in any of the collections
    const admin = await AdminModel.findById(id).select('-password');
    const customer = await CustomerModel.findById(id).select('-password');
    const serviceProvider = await ServiceProviderModel.findById(id).select('-password');

    const user = admin || customer || serviceProvider;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching user data" });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.role;

    // Try to update in all collections (only one will succeed)
    const [updatedAdmin, updatedCustomer, updatedServiceProvider] = await Promise.all([
      AdminModel.findByIdAndUpdate(id, updates, { new: true }).select('-password'),
      CustomerModel.findByIdAndUpdate(id, updates, { new: true }).select('-password'),
      ServiceProviderModel.findByIdAndUpdate(id, updates, { new: true }).select('-password')
    ]);

    const updatedUser = updatedAdmin || updatedCustomer || updatedServiceProvider;

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Error updating user data" });
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to delete from all collections (only one will succeed)
    const [deletedAdmin, deletedCustomer, deletedServiceProvider] = await Promise.all([
      AdminModel.findByIdAndDelete(id),
      CustomerModel.findByIdAndDelete(id),
      ServiceProviderModel.findByIdAndDelete(id)
    ]);

    if (!deletedAdmin && !deletedCustomer && !deletedServiceProvider) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

export { register, Login, Logout, getUser, updateUser, deleteUser };
