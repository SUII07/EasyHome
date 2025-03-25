import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section company-info">
            <h2 className="footer-logo">EasyHome</h2>
            <p className="company-description">
              Your trusted partner for professional home services. Quality work, reliable service providers, and customer satisfaction guaranteed.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-icon" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section quick-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Our Services</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/careers">Join Our Team</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="footer-section services-links">
            <h3>Our Services</h3>
            <ul>
              <li><Link to="/services/cleaning">House Cleaning</Link></li>
              <li><Link to="/services/plumbing">Plumbing</Link></li>
              <li><Link to="/services/electrical">Electrical</Link></li>
              <li><Link to="/services/painting">Painting</Link></li>
              <li><Link to="/services/hvac">HVAC Services</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section contact-info">
            <h3>Contact Us</h3>
            <ul>
              <li>
                <FaMapMarkerAlt />
                <span>123 Service Street, City, State 12345</span>
              </li>
              <li>
                <FaPhone />
                <a href="tel:1-800-EASY-HOME">1-800-EASY-HOME</a>
              </li>
              <li>
                <FaEnvelope />
                <a href="mailto:support@easyhome.com">support@easyhome.com</a>
              </li>
              <li>
                <FaClock />
                <span>Mon - Sat: 8:00 AM - 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-content">
          <p className="copyright">© {new Date().getFullYear()} EasyHome. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 