import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
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
  React.useEffect(() => {
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
          <li><Link to="/services" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
          <li className="user-profile-menu">
            <div 
              className={`profile-trigger ${isProfileOpen ? 'active' : ''}`}
              onClick={toggleProfile}
            >
              <FaUserCircle className="profile-icon" />
              <span>{user.FullName || user.fullName}</span>
              <div className={`profile-dropdown ${isProfileOpen ? 'show' : ''}`}>
                <Link 
                  to="/profile" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsProfileOpen(false);
                  }}
                >
                  My Profile
                </Link>
                <Link 
                  to="/my-bookings" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setIsProfileOpen(false);
                  }}
                >
                  My Bookings
                </Link>
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