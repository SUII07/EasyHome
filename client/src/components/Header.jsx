import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';
import { toast } from 'react-hot-toast';

const Header = ({ onServicesClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
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
    setIsProfileOpen(false); // Close profile dropdown when menu is toggled
  };

  const toggleProfile = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setIsProfileOpen(!isProfileOpen);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <nav className="main-header">
      <div className="header-content">
        <h1 className="logo">
          <Link to="/">EasyHome</Link>
        </h1>
        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/home" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
          <li>
            <a 
              href="#services" 
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                onServicesClick(e);
              }}
            >
              Services
            </a>
          </li>
          <li className="user-profile-menu">
            <div 
              className={`profile-trigger ${isProfileOpen ? 'active' : ''}`}
              onClick={toggleProfile}
            >
              <FaUserCircle className="profile-icon" />
              <span>{user.FullName || user.fullName}</span>
              <div className={`profile-dropdown ${isProfileOpen ? 'show' : ''}`}>
                {user.role === 'admin' && <Link 
                  to="/admin" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsProfileOpen(false);
                  }}
                >
                  Dashboard
                </Link>}
                {user.role === 'serviceprovider' && <Link 
                  to="/serviceprovider" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsProfileOpen(false);
                  }}
                >
                  Dashboard
                </Link>}
                {user.role === 'customer' && <Link 
                  to="/profile" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsProfileOpen(false);
                  }}
                >
                  My Profile
                </Link>}
                {user.role === 'customer' && <Link 
                  to="/my-bookings" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsProfileOpen(false);
                  }}
                >
                  My Bookings
                </Link>}
                {user.role === 'customer' && <Link 
                  to="/feedback" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsProfileOpen(false);
                  }}
                >
                  Feedback
                </Link>}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header; 