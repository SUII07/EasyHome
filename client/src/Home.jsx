import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import { FaBroom, FaBolt, FaPaintRoller, FaWrench, FaSnowflake, FaArrowRight, FaCheck } from 'react-icons/fa';
import { toast } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FaHammer } from "react-icons/fa";


const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const scrollToServices = (e) => {
    if (e) e.preventDefault();
    
    const servicesSection = document.querySelector('.services');
    if (servicesSection) {
      const headerOffset = 80;
      const elementPosition = servicesSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setIsScrollingUp(currentScrollY < lastScrollY || currentScrollY <= 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (window.location.hash === '#services') {
      setTimeout(() => {
        scrollToServices();
      }, 100);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("user");
        setUser(null);
        toast.success("Logged out successfully");
        navigate("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const services = [
    {
      title: "House Cleaning",
      description: "Professional house cleaning services",
      icon: <FaBroom />,
      link: "/providers/house-cleaning"
    },
    {
      title: "Electrician",
      description: "Expert electrical repair and installation",
      icon: <FaBolt />,
      link: "/providers/electrician"
    },
    {
      title: "Painting",
      description: "Interior and exterior painting services",
      icon: <FaPaintRoller />,
      link: "/providers/painting"
    },
    {
      title: "Plumbing",
      description: "Professional plumbing services",
      icon: <FaWrench />,
      link: "/providers/plumbing"
    },
    {
      title: "HVAC Services",
      description: "Heating and cooling system services",
      icon: <FaSnowflake />,
      link: "/providers/hvac"
    },
    {
      title: "Carpentry",
      description: "Expert carpentry services",
      icon: <FaHammer />,
      link: "/providers/carpentry"
    }
  ];

  const features = [
    "Verified Professional Service Providers",
    "Flexible Scheduling Options",
    "Competitive Pricing",
    "100% Satisfaction Guarantee"
  ];

  const howItWorks = [
    {
      title: "Find Service Providers",
      description: "Explore our extensive network of verified and skilled service providers. Use the dropdown search to easily find the right professional based on the service you need.",
      image: "./Service.png",
    },
    {
      title: "Book Services",
      description: "Booking a service is quick and easy. Browse through the list of available service providers, select the one that suits your needs, and send a booking request directly through the platform. The service provider will get back to you to confirm the details.",
      image: "./Book.png",
    },
    {
      title: "Get Quality Service",
      description: "Enjoy reliable and professional service right at your doorstep. Our trusted and verified service providers come to your home and make sure the work is done properly. We focus on giving you quality service and making sure you're fully satisfied with the results.",
      image: "./Get.png",
    }
  ];

  return (
    <> 
      <Header onServicesClick={scrollToServices} />
      <div className="home-container">
        <header className="hero-section">
          <div className="hero-content">
            <h2>Professional Home Services at Your Fingertips</h2>
            <p>Experience reliable and professional home services with our network of verified experts. Book your service today and enjoy peace of mind.</p>
            <button className="btn-primary" onClick={scrollToServices}>
              Book a Service <FaArrowRight className="arrow-icon" />
            </button>
          </div>
          <div className="hero-image">
            <img src="/HSP.png" alt="Professional Home Services" />
          </div>
        </header>

        <section className="services" id="services">
          <h2>Our Services</h2>
          <p className="section-subtitle">Choose from our wide range of professional home services</p>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                {service.icon}
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.link}>
                  <button className="btn-primary">
                    Request Service <FaArrowRight className="arrow-icon" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="how-it-works">
          <h2>How it Works</h2>
          <p className="section-subtitle">Get your home services done in three simple steps</p>
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
      </div>
      <Footer />
    </>
  );
};

export default Home;
