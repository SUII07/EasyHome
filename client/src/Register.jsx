import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";
import "./Register.css";
import { FaEye, FaEyeSlash, FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaLock, FaUserTie } from "react-icons/fa";

const Register = () => {
  const [FullName, setFullName] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [ZipCode, setZipCode] = useState("");
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

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmail(email);
    setShowRoleSelection(!email.includes(".admin@"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (Password !== ConfirmPassword) {
      toast.error("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const request = await axios.post("http://localhost:4000/api/auth/register", {
        FullName,
        PhoneNumber,
        ZipCode,
        Email,
        password: Password,
        ConfirmPassword,
        role: Role,
        serviceType: Role === "serviceprovider" ? ServiceType : undefined,
        price: Role === "serviceprovider" ? parseFloat(Price) : undefined,
      });

      toast.success(request.data.message || "Registration successful!");
      navigate("/login"); 
    } catch (error) {
      if (error.response) {
        console.log("Server Response:", error.response.data);
        toast.error(error.response.data.message || "Registration failed!");
      } else {
        console.log(error);
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
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="zipCode" className="input-label">
                <FaMapMarkerAlt className="input-icon" /> Zip Code
              </label>
              <input
                id="zipCode"
                type="text"
                placeholder="Enter your zip code"
                className="input-field"
                value={ZipCode}
                onChange={(e) => setZipCode(e.target.value)}
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
                      <FaUserTie className="input-icon" /> Service Type
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
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="price" className="input-label">
                      <FaUserTie className="input-icon" /> Service Price (per hour)
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