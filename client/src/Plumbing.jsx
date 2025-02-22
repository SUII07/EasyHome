import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {FaTwitter, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa"; 
import "./Plumbing.css";

const Plumbing = () => {
  const [state, setState] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    serviceType: "Fixing leakage",
    description: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/serviceProvider/create", formData);
      navigate("/getprice"); // Redirect to GetPrice.jsx
    } catch (error) {
      console.error("Error submitting form:", error);
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
        <p>Please fill the below form for the better service.</p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter Your Full Name" required />

          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />

          <label>Phone Number</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />

          <label>Available Services</label>
          <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
            <option>Fixing leakage</option>
            <option>Unclogging sinks</option>
            <option>Installing Items</option>
            <option>Repairing Items</option>
          </select>

          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="About the Problem"></textarea>


          <button className="btn">Get Price</button>
        </form>
      </div>

      <section>
        <div className="plumbing-services">
          <h2>What We Offer In Plumber Service</h2>
          <div className="service-content">
            <img src="Plumber.png" alt="Plumber" />
            <ul>
              <li>Fixing leaking taps, pipes, and flush tanks</li>
              <li>Unclogging sinks, drains, and bathrooms</li>
              <li>Installing or repairing water heaters, showers, and bathtubs</li>
              <li>Setting up washing machines, dishwashers, and new taps</li>
              <li>Emergency plumbing help for water issues</li>
            </ul>
          </div>
        </div>
      </section>


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
                  <li>Cleaning</li>
                  <li>Repairs</li>
                  <li>Painting</li>
                  <li>Plumbing</li>
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

export default Plumbing;
