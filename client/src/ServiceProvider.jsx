import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTools, FaCalendarAlt, FaStar, FaSignOutAlt, FaChartBar, FaBell, FaCog, FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./ServiceProvider.css";

const ServiceProvider = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    // Check if user is authenticated and is a service provider
    if (!user || user.role !== "serviceprovider") {
      toast.error("Access denied. Please login as a service provider.");
      navigate("/login");
      return;
    }

    fetchProviderDetails();
  }, [navigate, user]);

  const fetchProviderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("http://localhost:4000/api/serviceProvider/profile", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.provider) {
        setProvider(data.provider);
      } else {
        throw new Error(data.message || "Provider data not found");
      }
    } catch (error) {
      console.error("Error fetching provider details:", error);
      setError(error.message);
      toast.error("Failed to fetch profile details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        toast.success("Logged out successfully");
        navigate("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p className="stat-value">{provider?.bookings?.length || 0}</p>
            <span className="stat-trend positive">+12% this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-info">
            <h3>Rating</h3>
            <p className="stat-value">
              <FaStar className="star-icon" />
              {provider?.rating || 'N/A'}
            </p>
            <span className="stat-trend positive">+0.2 this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaTools />
          </div>
          <div className="stat-info">
            <h3>Services Completed</h3>
            <p className="stat-value">18</p>
            <span className="stat-trend positive">+8% this month</span>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <FaCalendarAlt />
            </div>
            <div className="activity-content">
              <h4>New Booking</h4>
              <p>John Doe booked your service for tomorrow</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <FaStar />
            </div>
            <div className="activity-content">
              <h4>New Review</h4>
              <p>Jane Smith left a 5-star review</p>
              <span className="activity-time">5 hours ago</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <FaTools />
            </div>
            <div className="activity-content">
              <h4>Service Completed</h4>
              <p>Completed service for Mike Johnson</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-content">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser />
        </div>
        <div className="profile-info">
          <h2>{provider?.FullName}</h2>
          <p>Service Provider</p>
        </div>
        <button className="edit-profile-button">
          <FaEdit /> Edit Profile
        </button>
      </div>

      <div className="profile-details">
        <div className="detail-section">
          <h3>Contact Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Email</label>
              <p>{provider?.Email}</p>
            </div>
            <div className="detail-item">
              <label>Phone Number</label>
              <p>{provider?.PhoneNumber}</p>
            </div>
            <div className="detail-item">
              <label>Service Type</label>
              <p>{provider?.ServiceType}</p>
            </div>
            <div className="detail-item">
              <label>Location</label>
              <p>{provider?.ZipCode}</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <h4>Completion Rate</h4>
              <p className="metric-value">95%</p>
            </div>
            <div className="metric-card">
              <h4>Response Time</h4>
              <p className="metric-value">2.5h</p>
            </div>
            <div className="metric-card">
              <h4>Customer Satisfaction</h4>
              <p className="metric-value">4.8/5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchProviderDetails} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="service-provider-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">EasyHome</h2>
          <p className="provider-role">Service Provider</p>
        </div>
        <nav>
          <ul>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <FaChartBar className="icon" />
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <FaUser className="icon" />
                Profile
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <FaCalendarAlt className="icon" />
                Bookings
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <FaTools className="icon" />
                Services
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <FaCog className="icon" />
                Settings
              </button>
            </li>
          </ul>
        </nav>
        <div className="logout">
          <button onClick={handleLogout} className="nav-link">
            <FaSignOutAlt className="icon" />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>{activeTab === "dashboard" ? "Dashboard Overview" : "Profile"}</h1>
          </div>
          <div className="header-right">
            <div className="notifications">
              <FaBell className="icon" />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </div>
            <div className="profile">
              <FaUser className="profile-icon" />
              <span>{provider?.FullName}</span>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" ? renderDashboard() : renderProfile()}
      </main>
    </div>
  );
};

export default ServiceProvider;
