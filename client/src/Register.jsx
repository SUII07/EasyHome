import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";
import "./Register.css";
import { FaEye, FaEyeSlash, FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaLock, FaUserTie, FaTools, FaDollarSign, FaFileUpload } from "react-icons/fa";

const Register = () => {
  const [FullName, setFullName] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [Address, setAddress] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [Role, setRole] = useState("customer");
  const [ServiceType, setServiceType] = useState("");
  const [Price, setPrice] = useState("");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationDocument, setVerificationDocument] = useState(null);
  const [documentError, setDocumentError] = useState("");

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmail(email);
    setShowRoleSelection(!email.includes(".admin@"));
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setDocumentError("File size must be less than 5MB");
        setVerificationDocument(null);
        e.target.value = null;
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setDocumentError("Only PDF, JPEG, and PNG files are allowed");
        setVerificationDocument(null);
        e.target.value = null;
        return;
      }
      
      setDocumentError("");
      setVerificationDocument(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(PhoneNumber)) {
      toast.error("Phone number must be exactly 10 digits!");
      setIsLoading(false);
      return;
    }

    // Convert phone number to integer for validation
    const phoneInt = parseInt(PhoneNumber);
    if (isNaN(phoneInt)) {
      toast.error("Phone number must contain only numbers!");
      setIsLoading(false);
      return;
    }

    // Validate name (only letters and spaces)
    if (!FullName.match(/^[a-zA-Z\s]+$/)) {
      toast.error("Name should only contain letters and spaces!");
      setIsLoading(false);
      return;
    }

    // Validate email (must be Gmail)
    if (!Email.toLowerCase().includes("@gmail.com")) {
      toast.error("Please use a Gmail address!");
      setIsLoading(false);
      return;
    }

    if (Password !== ConfirmPassword) {
      toast.error("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    if (Password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      setIsLoading(false);
      return;
    }

    if (!Address.trim()) {
      toast.error("Please enter your address!");
      setIsLoading(false);
      return;
    }

    try {
      let requestData;
      const isAdmin = Email.includes(".admin@");

      if (isAdmin) {
        // Admin registration data
        requestData = {
          fullName: FullName.trim(),
          phoneNumber: phoneInt,
          address: Address.trim(),
          email: Email.trim().toLowerCase(),
          password: Password,
          confirmPassword: ConfirmPassword,
          role: "admin"
        };
      } else if (Role === "serviceprovider") {
        // Validate service provider specific fields
        if (!ServiceType || !Price) {
          toast.error("Please fill in all service provider details!");
          setIsLoading(false);
          return;
        }

        const validServiceTypes = ["house cleaning", "electrician", "painting", "plumbing", "hvac services", "carpentry"];
        if (!validServiceTypes.includes(ServiceType.toLowerCase())) {
          toast.error("Invalid service type. Please select from: House Cleaning, Electrician, Painting, Plumbing, or HVAC Services");
          setIsLoading(false);
          return;
        }

        if (isNaN(Price) || parseFloat(Price) <= 0) {
          toast.error("Please enter a valid price greater than 0");
          setIsLoading(false);
          return;
        }

        // Service provider registration data
        const formData = new FormData();
        formData.append("fullName", FullName.trim());
        formData.append("phoneNumber", phoneInt);
        formData.append("address", Address.trim());
        formData.append("email", Email.trim().toLowerCase());
        formData.append("password", Password);
        formData.append("confirmPassword", ConfirmPassword);
        formData.append("role", "serviceprovider");
        formData.append("serviceType", ServiceType.trim().toLowerCase());
        formData.append("price", Price);
        formData.append("verificationStatus", "pending");
        
        if (verificationDocument) {
          formData.append("verificationDocument", verificationDocument);
        }
        
        requestData = formData;
      } else {
        // Customer registration data
        requestData = {
          fullName: FullName.trim(),
          phoneNumber: phoneInt,
          address: Address.trim(),
          email: Email.trim().toLowerCase(),
          password: Password,
          confirmPassword: ConfirmPassword,
          role: "customer"
        };
      }

      console.log("Sending registration request with data:", 
        requestData instanceof FormData 
          ? "FormData (contains file)" 
          : JSON.stringify(requestData, null, 2)
      );
      
      const headers = requestData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const request = await axios.post(
        "http://localhost:4000/api/auth/register",
        requestData,
        { headers }
      );

      console.log("Registration response:", request.data);
      toast.success(request.data.message || "Registration successful!");
      navigate("/login");
    } catch (error) {
      if (error.response) {
        console.log("Server Response Status:", error.response.status);
        console.log("Server Response Data:", error.response.data);
        console.log("Server Response Headers:", error.response.headers);
        console.log("Request data that caused error:", JSON.stringify(error.config.data, null, 2));
        
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          console.log("Validation Errors:", error.response.data.errors);
          error.response.data.errors.forEach(err => {
            console.log("Error:", err);
            toast.error(err.message || "Validation error");
          });
        } else {
          toast.error(error.response.data.message || "Registration failed!");
        }
      } else if (error.request) {
        console.log("Request was made but no response received:", error.request);
        toast.error("No response from server. Please check if the server is running.");
      } else {
        console.log("Error setting up the request:", error.message);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="background-container">
      <div className="register-user">
        <h1 className="lets-get-started">Let's Get Started!</h1>
        <p className="register-subtitle">Create your account to access our services</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label htmlFor="fullname" className="input-label">
              <FaUser className="input-icon" /> Full Name
            </label>
            <input
              id="fullname"
              type="text"
              placeholder="Enter your full name"
              className="input-field"
              value={FullName}
              onChange={(e) => setFullName(e.target.value)}
              pattern="[a-zA-Z\s]+"
              title="Name should only contain letters and spaces"
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="phoneNumber" className="input-label">
                <FaPhone className="input-icon" /> Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                className="input-field"
                value={PhoneNumber}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '');
                  // Limit to 10 digits
                  if (value.length <= 10) {
                    setPhoneNumber(value);
                  }
                }}
                pattern="[0-9]{10}"
                maxLength="10"
                title="Phone number must be exactly 10 digits"
                required
              />
              <small className="input-hint">Enter a 10-digit phone number</small>
            </div>

            <div className="input-group">
              <label htmlFor="address" className="input-label">
                <FaMapMarkerAlt className="input-icon" /> Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Enter your address"
                className="input-field"
                value={Address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              <FaEnvelope className="input-icon" /> Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="input-field"
              value={Email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              <FaLock className="input-icon" /> Password
            </label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="input-field"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">
              <FaLock className="input-icon" /> Confirm Password
            </label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="input-field"
                value={ConfirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {showRoleSelection && (
            <>
              <div className="input-group">
                <label htmlFor="role" className="input-label">
                  <FaUserTie className="input-icon" /> Role
                </label>
                <select
                  id="role"
                  className="input-field"
                  value={Role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="serviceprovider">Service Provider</option>
                </select>
              </div>

              {Role === "serviceprovider" && (
                <>
                  <div className="input-group">
                    <label htmlFor="serviceType" className="input-label">
                      <FaTools className="input-icon" /> Service Type
                    </label>
                    <select
                      id="serviceType"
                      className="input-field"
                      value={ServiceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      required
                    >
                      <option value="">Select a service type</option>
                      <option value="house cleaning">House Cleaning</option>
                      <option value="electrician">Electrician</option>
                      <option value="painting">Painting</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="hvac services">HVAC Services</option>
                      <option value="carpentry">Carpentry</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="price" className="input-label">
                      <FaDollarSign className="input-icon" /> Service Price (per hour)
                    </label>
                    <input
                      id="price"
                      type="number"
                      placeholder="Enter service price"
                      className="input-field"
                      value={Price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="verificationDocument" className="input-label">
                      <FaFileUpload className="input-icon" /> Upload Verification Document
                    </label>
                    <input
                      id="verificationDocument"
                      type="file"
                      className="input-field file-input"
                      onChange={handleDocumentChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {documentError && (
                      <p className="error-message">{documentError}</p>
                    )}
                    <p className="file-requirements">
                      Accepted formats: PDF, JPEG, PNG (Max size: 5MB)
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          <button 
            type="submit" 
            className={`button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="account-sign-in">
          Already have an account? <Link to="/login" className="sign-in">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;