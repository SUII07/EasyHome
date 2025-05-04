import express from 'express'
import { Login, Logout, register, getUser, updateUser, deleteUser } from '../controllers/Auth.js'
import { verifyToken } from '../middleware/verifyToken.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Customer from '../models/Customer.js'
import ServiceProvider from '../models/ServiceProvider.js'
import Admin from '../models/admin.js'
import multer from 'multer'
import cloudinary from '../config/cloudinary.js'
import nodemailer from 'nodemailer'
import { geocodeAddress } from '../utils/geocoding.js'

const AuthRoutes = express.Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Public routes
AuthRoutes.post('/register', upload.single('verificationDocument'), async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, confirmPassword, address, role, serviceType, price } = req.body

    // Detailed validation
    const missingFields = [];
    if (!fullName) missingFields.push('Full Name');
    if (!email) missingFields.push('Email');
    if (!phoneNumber) missingFields.push('Phone Number');
    if (!password) missingFields.push('Password');
    if (!confirmPassword) missingFields.push('Confirm Password');
    if (!address) missingFields.push('Address');
    if (!role) missingFields.push('Role');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "All fields are required", 
        missingFields: missingFields.join(', ') 
      });
    }

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber.toString())) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if phone number already exists
    const existingPhoneNumber = await Promise.all([
      Customer.findOne({ phoneNumber }),
      ServiceProvider.findOne({ phoneNumber }),
      Admin.findOne({ phoneNumber })
    ]);

    if (existingPhoneNumber.some(user => user !== null)) {
      return res.status(400).json({ message: "Phone number is already registered" });
    }

    // Check if email already exists
    const existingUser = await Promise.all([
      Customer.findOne({ email }),
      ServiceProvider.findOne({ email }),
      Admin.findOne({ email })
    ]);

    if (existingUser.some(user => user !== null)) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Additional validation for service providers
    if (role === "serviceprovider") {
      if (!serviceType) {
        return res.status(400).json({ message: "Service type is required for service providers" });
      }
      if (!price) {
        return res.status(400).json({ message: "Price is required for service providers" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Verification document is required for service providers" });
      }
    }

    // Geocode the address
    const geocodedAddress = await geocodeAddress(address);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    let user
    if (role === "customer") {
      user = new Customer({
        FullName: fullName,
        Email: email,
        PhoneNumber: phoneNumber,
        password: hashedPassword,
        Address: address,
        latitude: geocodedAddress.latitude,
        longitude: geocodedAddress.longitude,
        plusCode: geocodedAddress.plusCode,
        location: {
          type: 'Point',
          coordinates: geocodedAddress.longitude && geocodedAddress.latitude 
            ? [geocodedAddress.longitude, geocodedAddress.latitude]
            : [0, 0]
        }
      })
    } else if (role === "serviceprovider") {
      // Upload document to Cloudinary
      const base64Data = req.file.buffer.toString('base64')
      const uploadResponse = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64Data}`,
        {
          folder: 'service_providers/verification_documents',
          resource_type: 'auto'
        }
      )

      user = new ServiceProvider({
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        address,
        latitude: geocodedAddress.latitude,
        longitude: geocodedAddress.longitude,
        plusCode: geocodedAddress.plusCode,
        location: {
          type: 'Point',
          coordinates: geocodedAddress.longitude && geocodedAddress.latitude 
            ? [geocodedAddress.longitude, geocodedAddress.latitude]
            : [0, 0]
        },
        serviceType,
        price: parseFloat(price),
        verificationStatus: "pending",
        verificationDocument: {
          publicId: uploadResponse.public_id,
          url: uploadResponse.secure_url,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype
        }
      })

      // Send email notification to admin
      const adminEmail = process.env.EMAIL_USER
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: 'New Service Provider Registration',
        html: `
          <h2>New Service Provider Registration</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Service Type:</strong> ${serviceType}</p>
          <p><strong>Price per Hour:</strong> $${price}</p>
          <p>Please review their application in the admin dashboard.</p>
        `
      })

      // Send confirmation email to service provider
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Registration Confirmation - EasyHome',
        html: `
          <h2>Thank you for registering with EasyHome!</h2>
          <p>Your application as a service provider is being reviewed by our team.</p>
          <p>We will notify you once your account has been verified.</p>
          <p>Please note that you won't be able to log in until your account is approved.</p>
        `
      })
    } else if (role === "admin") {
      // Validate admin email format
      if (!email.includes(".admin@")) {
        return res.status(400).json({ message: "Invalid admin email format. Must contain '.admin@'" });
      }

      user = new Admin({
        FullName: fullName,
        Email: email,
        PhoneNumber: phoneNumber,
        password: hashedPassword,
        Address: address,
        role: "admin"
      });
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    await user.save()

    res.status(201).json({
      message: role === "serviceprovider" 
        ? "Registration successful! Please wait for admin verification." 
        : "Registration successful!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role,
        plusCode: user.plusCode
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
})

AuthRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // First, try to find the user in any collection
    let user = null;
    let userType = null;

    // Try each model in sequence instead of using Promise.any
    if (!user) {
      // For customer, use capitalized Email field
      user = await Customer.findOne({ Email: email });
      if (user) userType = 'customer';
    }
    
    if (!user) {
      user = await ServiceProvider.findOne({ email });
      if (user) userType = 'serviceprovider';
    }
    
    if (!user) {
      // For admin, use capitalized Email field
      user = await Admin.findOne({ Email: email });
      if (user) userType = 'admin';
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check service provider verification status
    if (userType === "serviceprovider") {
      if (user.verificationStatus === "pending") {
        return res.status(403).json({ 
          success: false,
          message: "Your account is pending verification. Please wait for admin approval." 
        });
      }
      if (user.verificationStatus === "rejected") {
        return res.status(403).json({ 
          success: false,
          message: "Your account has been rejected. Please contact support for more information." 
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: userType,
        email: userType === 'admin' || userType === 'customer' ? user.Email : user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return user data with correct field names based on user type
    const userData = {
      id: user._id,
      fullName: userType === 'admin' || userType === 'customer' ? user.FullName : user.fullName,
      email: userType === 'admin' || userType === 'customer' ? user.Email : user.email,
      role: userType,
      verificationStatus: user.verificationStatus
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Login failed", 
      error: error.message 
    });
  }
});

AuthRoutes.post('/logout', (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logged out successfully" })
})

// Protected routes - require authentication
AuthRoutes.get('/user/:id', verifyToken, getUser)
AuthRoutes.put('/update/:id', verifyToken, updateUser)
AuthRoutes.delete('/delete/:id', verifyToken, deleteUser)

export default AuthRoutes
