import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaDollarSign, FaStar, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo">EasyHome</h2>
        <p className="provider-role">Service Provider</p>
      </div>
      
      <nav>
        <ul>
          <li className="nav-item">
            <button 
              onClick={() => navigate('/serviceprovider')}
              className={`nav-link ${location.pathname === "/serviceprovider" ? "active" : ""}`}
            >
              <FaUserCircle className="icon" />
              <span>Dashboard</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => navigate('/serviceprovider/bookings')}
              className={`nav-link ${location.pathname === "/serviceprovider/bookings" ? "active" : ""}`}
            >
              <FaCalendarAlt className="icon" />
              <span>Bookings</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => navigate('/serviceprovider/earnings')}
              className={`nav-link ${location.pathname === "/serviceprovider/earnings" ? "active" : ""}`}
            >
              <FaDollarSign className="icon" />
              <span>Earnings</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => navigate('/serviceprovider/reviews')}
              className={`nav-link ${location.pathname === "/serviceprovider/reviews" ? "active" : ""}`}
            >
              <FaStar className="icon" />
              <span>Reviews</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => navigate('/serviceprovider/profile')}
              className={`nav-link ${location.pathname === "/serviceprovider/profile" ? "active" : ""}`}
            >
              <FaUser className="icon" />
              <span>Profile</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt className="icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 