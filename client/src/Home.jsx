import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { FaTools, FaPaintRoller, FaWater, FaThermometerHalf, FaHouseUser, FaExclamationTriangle, FaTwitter, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

const Home = () => {
  return (
    <div className="home-container">
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

      <header className="hero-section">
        <div className="hero-content">
          <h2>Professional Home Services at Your Fingertips</h2>
          <p>Expert technicians, reliable service, and competitive pricing for all your home maintenance needs.</p>
          <button className="btn-primary">Book a Service</button>
        </div>
        <div className="hero-image">
          <img src="/HSP.png" alt="Home Service" />
        </div>
      </header>

      <section className="services">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card emergency">
            <FaExclamationTriangle className="service-icon emergency-icon" />
            <h3>Emergency Response</h3>
            <p>24/7 Rapid Emergency Response Team</p>
            <Link to="/emergency">
              <button className="btn-danger">Request Service</button>
            </Link> 
          </div>
          <div className="service-card">
            <FaHouseUser className="service-icon" />
            <h3>House Cleaning</h3>
            <p>Professional Cleaning services for entire home</p>
            <Link to="/Booking">
            <button className="btn-primary">Request Service</button>
            </Link>
          </div>
          <div className="service-card">
            <FaTools className="service-icon" />
            <h3>Repairs & Maintenance</h3>
            <p>Expert repair services for all house systems</p>
            <Link to="/Booking">
            <button className="btn-primary">Request Service</button>
            </Link>
          </div>
          <div className="service-card">
            <FaPaintRoller className="service-icon" />
            <h3>Painting</h3>
            <p>Interior and exterior painting services</p>
            <Link to="/Booking">
            <button className="btn-primary">Request Service</button>
            </Link>
          </div>
          <div className="service-card">
            <FaWater className="service-icon" />
            <h3>Plumbing</h3>
            <p>Plumbing and Water Damage Services</p>
            <Link to="/Booking">
              <button className="btn-primary">Request Service</button>
            </Link> 
          </div>
          <div className="service-card">
            <FaThermometerHalf className="service-icon" />
            <h3>HVAC Services</h3>
            <p>Heating, and air conditioning maintenance</p>
            <Link to="/Booking">
            <button className="btn-primary">Request Service</button>
            </Link> 
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How it Works</h2>
        <div className="how-grid">
          <div className="how-step">
            <img src="./public/Service.png" alt="Select Services" />
            <h3>Select Services</h3>
            <p>Browse through our wide range of home services</p>
          </div>
          <div className="how-step">
            <img src="./public/Book.png" alt="Book Services" />
            <h3>Book Services</h3>
            <p>Choose your preferred Services</p>
          </div>
          <div className="how-step">
            <img src="./public/Get.png" alt="Get Services" />
            <h3>Get Services</h3>
            <p>Our verified professional will deliver the services</p>
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

export default Home;
