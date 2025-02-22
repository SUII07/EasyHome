import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaUserFriends, FaEnvelope, FaSignOutAlt, FaBell } from "react-icons/fa";
import "./ServiceProvider.css";

const ServiceProvider = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">EasyHome</h2>
        <nav>
          <ul>
            <li className="nav-item">
              <span className="hover-link">
                <Link to="/dashboard">
                  <FaHome className="icon" />
                  Dashboard
                </Link>
              </span>
            </li>
            <li className="nav-item">
              <span className="hover-link">
                <Link to="/appointments">
                  <FaCalendarAlt className="icon" />
                  Appointments
                </Link>
              </span>
            </li>
            <li className="nav-item">
              <span className="hover-link">
                <Link to="/customers">
                  <FaUserFriends className="icon" />
                  Customers
                </Link>
              </span>
            </li>
            <li className="nav-item">
              <span className="hover-link">
                <Link to="/messages">
                  <FaEnvelope className="icon" />
                  Messages
                </Link>
              </span>
            </li>
          </ul>
        </nav>
        <div className="logout">
          <span className="hover-link">
            <Link to="/logout">
              <FaSignOutAlt className="icon" />
              Logout
            </Link>
          </span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h3>Dashboard</h3>
          <div className="profile">
            <FaBell className="icon notification" />
            <img
              src="https://i.pravatar.cc/40"
              alt="User Profile"
              className="profile-pic"
            />
          </div>
        </header>

        {/* Content Area */}
        <section className="content">
          {/* Content will be added here */}
        </section>
      </main>
    </div>
  );
};

export default ServiceProvider;
