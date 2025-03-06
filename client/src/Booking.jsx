import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import "./Booking.css";

const Booking = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    serviceType: "House Cleaning",
    description: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetPrice = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/api/serviceProvider/getPrice", formData);
      navigate("/providers", { state: { providers: response.data, formData } });
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

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
        <h2>Book a Service</h2>
        <p>Please fill out the form below for a better service.</p>

        <form onSubmit={handleGetPrice}>
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />

          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} required />

          <label>Phone Number</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />

          <label>Available Services</label>
          <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
            <option>House Cleaning</option>
            <option>Repairs & Maintenance</option>
            <option>Painting</option>
            <option>Plumbing</option>
            <option>HVAC Services</option>
          </select>

          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />

          <button type="submit" className="btn">Get Price</button>
        </form>
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <div className="social-links">
          <FaTwitter className="social-icon" />
          <FaFacebook className="social-icon" />
          <FaInstagram className="social-icon" />
          <FaYoutube className="social-icon" />
        </div>

        <div className="footer-columns">
          <div>
            <h3>EasyHome</h3>
            <p>Your Trusted Partner For All Services</p>
          </div>
          <div>
            <h3>Services</h3>
            <ul>
              <li>House Cleaning</li>
              <li>Repairs & Maintenance</li>
              <li>Painting</li>
              <li>Plumbing</li>
              <li>HVAC Services</li>
            </ul>
          </div>
          <div>
            <h3>Company</h3>
            <ul>
              <li>About Us</li>
              <li>Contact</li>
              <li>Careers</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h3>Contact</h3>
            <ul>
              <li>support@homeservice.com</li>
              <li>1-800-EASY-HOME</li>
            </ul>
          </div>
        </div>

        <p className="footer-note">© 2025 EasyHome All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Booking;
