// components/Booking.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaUser, FaMapMarkerAlt, FaPhone, FaTools, FaCalendarAlt, FaFileAlt, FaArrowRight } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./Booking.css";

const Booking = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    serviceType: "House Cleaning",
    description: "",
    preferredDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!formData.preferredDate) {
      newErrors.preferredDate = "Preferred date is required";
    } else if (new Date(formData.preferredDate) < new Date()) {
      newErrors.preferredDate = "Please select a future date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleGetPrice = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/api/booking/getProviders", {
        serviceType: formData.serviceType,
      });
      navigate("/providers", { state: { providers: response.data, formData } });
    } catch (error) {
      console.error("Error fetching prices:", error);
      toast.error(error.response?.data?.message || "Failed to fetch service providers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    { value: "House Cleaning", label: "House Cleaning", icon: <FaTools /> },
    { value: "Repairs & Maintenance", label: "Repairs & Maintenance", icon: <FaTools /> },
    { value: "Painting", label: "Painting", icon: <FaTools /> },
    { value: "Plumbing", label: "Plumbing", icon: <FaTools /> },
    { value: "HVAC Services", label: "HVAC Services", icon: <FaTools /> },
  ];

  return (
    <div className="container">
      <nav className="navbar">
        <h1 className="logo">
          <Link to="/">EasyHome</Link>
        </h1>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/login">Sign In</Link></li>
        </ul>
      </nav>

      <div className="service-form">
        <div className="form-header">
          <h2>Book a Service</h2>
          <p>Please fill out the form below for a better service experience.</p>
        </div>

        <form onSubmit={handleGetPrice} className="booking-form">
          <div className="form-group">
            <label>
              <FaUser className="input-icon" />
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? "error" : ""}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaMapMarkerAlt className="input-icon" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your complete address"
              className={errors.address ? "error" : ""}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaPhone className="input-icon" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={errors.phoneNumber ? "error" : ""}
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaTools className="input-icon" />
              Service Type
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="service-select"
            >
              {services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <FaCalendarAlt className="input-icon" />
              Preferred Date
            </label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={errors.preferredDate ? "error" : ""}
            />
            {errors.preferredDate && <span className="error-message">{errors.preferredDate}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaFileAlt className="input-icon" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your service requirements in detail"
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Finding Providers...' : 'Get Price'}
            <FaArrowRight className="arrow-icon" />
          </button>
        </form>
      </div>

      <footer className="footer">
        <div className="social-links">
          <a href="#" className="social-icon"><FaTwitter /></a>
          <a href="#" className="social-icon"><FaFacebook /></a>
          <a href="#" className="social-icon"><FaInstagram /></a>
          <a href="#" className="social-icon"><FaYoutube /></a>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h3>EasyHome</h3>
            <p>Your Trusted Partner For All Services</p>
          </div>
          <div className="footer-column">
            <h3>Services</h3>
            <ul>
              <li><Link to="/services#cleaning">House Cleaning</Link></li>
              <li><Link to="/services#repairs">Repairs & Maintenance</Link></li>
              <li><Link to="/services#painting">Painting</Link></li>
              <li><Link to="/services#plumbing">Plumbing</Link></li>
              <li><Link to="/services#hvac">HVAC Services</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact</h3>
            <ul>
              <li><a href="mailto:support@homeservice.com">support@homeservice.com</a></li>
              <li><a href="tel:1-800-EASY-HOME">1-800-EASY-HOME</a></li>
            </ul>
          </div>
        </div>

        <p className="footer-note">© 2025 EasyHome All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Booking;