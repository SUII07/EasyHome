import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import { FaBroom, FaBolt, FaPaintRoller, FaWrench, FaSnowflake, FaArrowRight } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
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
    }
  ];

  const howItWorks = [
    {
      title: "Find Service Providers",
      description: "Browse through our verified service providers and find the perfect match for your needs.",
      image: "./Service.png",
    },
    {
      title: "Book Services",
      description: "Easily book services with just a few clicks and manage your appointments in one place.",
      image: "./Book.png",
    },
    {
      title: "Get Quality Service",
      description: "Receive high-quality services from our professional and experienced service providers.",
      image: "./Get.png",
    }
  ];

  return (
    <> 
      <Header />
      <div className="home-container">
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
      </div>
      <Footer />
    </>
  );
};

export default Home;
