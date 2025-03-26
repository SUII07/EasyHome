import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaDollarSign, FaStar, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', icon: <FaUserCircle />, label: 'Dashboard' },
    { id: 'bookings', icon: <FaCalendarAlt />, label: 'Bookings' },
    { id: 'earnings', icon: <FaDollarSign />, label: 'Earnings' },
    { id: 'reviews', icon: <FaStar />, label: 'Reviews' },
    { id: 'profile', icon: <FaUser />, label: 'Profile' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>EasyHome</h2>
        <p>Service Provider</p>
      </div>
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        <button className="nav-item logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar; 