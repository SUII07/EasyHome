import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { FaTools, FaPaintRoller, FaWater, FaThermometerHalf, FaHouseUser, FaExclamationTriangle, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaBars, FaTimes, FaArrowRight } from "react-icons/fa";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user"))); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const services = [
    {
      icon: <FaExclamationTriangle className="service-icon emergency-icon" />,
      title: "Emergency Response",
      description: "24/7 Rapid Emergency Response Team",
      link: "/emergency",
      buttonClass: "btn-danger",
      buttonText: "Request Service"
    },
    {
      icon: <FaHouseUser className="service-icon" />,
      title: "House Cleaning",
      description: "Professional Cleaning services for entire home",
      link: "/Booking",
      buttonClass: "btn-primary",
      buttonText: "Request Service"
    },
    {
      icon: <FaTools className="service-icon" />,
      title: "Electrician",
      description: "Expert electrical repair and installation services",
      link: "/Booking",
      buttonClass: "btn-primary",
      buttonText: "Request Service"
    },
    {
      icon: <FaPaintRoller className="service-icon" />,
      title: "Painting",
      description: "Interior and exterior painting services",
      link: "/Booking",
      buttonClass: "btn-primary",
      buttonText: "Request Service"
    },
    {
      icon: <FaWater className="service-icon" />,
      title: "Plumbing",
      description: "Plumbing and Water Damage Services",
      link: "/Booking",
      buttonClass: "btn-primary",
      buttonText: "Request Service"
    },
    {
      icon: <FaThermometerHalf className="service-icon" />,
      title: "HVAC Services",
      description: "Heating, and air conditioning maintenance",
      link: "/Booking",
      buttonClass: "btn-primary",
      buttonText: "Request Service"
    }
  ];

  const howItWorks = [
    {
      image: "./public/Service.png",
      title: "Select Services",
      description: "Browse through our wide range of home services"
    },
    {
      image: "./public/Book.png",
      title: "Book Services",
      description: "Choose your preferred Services"
    },
    {
      image: "./public/Get.png",
      title: "Get Services",
      description: "Our verified professional will deliver the services"
    }
  ];

  return (
    <div className="home-container">
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <h1 className="logo">
          <Link to="/">EasyHome</Link> 
        </h1>
        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/home" onClick={() => setIsMenuOpen(false)}>Home</Link></li> 
          <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
          <li><Link to="/user/serviceproviders" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
          <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link></li>
        </ul>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h2>Professional Home Services at Your Fingertips</h2>
          <p>Expert technicians, reliable service, and competitive pricing for all your home maintenance needs.</p>
          <Link to="/Booking">
            <button className="btn-primary">
              Book a Service <FaArrowRight className="arrow-icon" />
            </button>
          </Link>
        </div>
        <div className="hero-image">
          <img src="/HSP.png" alt="Home Service" />
        </div>
      </header>

      <section className="services">
        <h2>Our Services</h2>
        <p className="section-subtitle">Choose from our wide range of professional home services</p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              {service.icon}
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <Link to={service.link}>
                <button className={service.buttonClass}>
                  {service.buttonText} <FaArrowRight className="arrow-icon" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2>How it Works</h2>
        <p className="section-subtitle">Simple steps to get the service you need</p>
        <div className="how-grid">
          {howItWorks.map((step, index) => (
            <div key={index} className="how-step">
              <div className="step-number">{index + 1}</div>
              <img src={step.image} alt={step.title} />
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
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
                <li><Link to="/services#cleaning">Cleaning</Link></li>
                <li><Link to="/services#repairs">Repairs</Link></li>
                <li><Link to="/services#painting">Painting</Link></li>
                <li><Link to="/services#plumbing">Plumbing</Link></li>
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
        </div>
      </footer>
    </div>
  );
};

export default Home;
