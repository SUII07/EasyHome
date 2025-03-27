import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaEnvelope, FaBell, FaCheck, FaTimes, FaDollarSign, FaStar, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './ServiceProvider.css';
import CustomerCard from './components/CustomerCard';
import Sidebar from './components/Sidebar';
import Bookings from './components/Bookings';
import ServiceProviderProfile from './ServiceProviderProfile';
import Reviews from './components/Reviews';

const ServiceProvider = () => {
  const [provider, setProvider] = useState(null);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'serviceprovider') {
      toast.error('Access denied. Only service providers can access this page.');
      navigate('/login');
      return;
    }
    fetchProviderDetails();
    fetchBookingRequests();

    // Set active section based on URL path
    const path = location.pathname.split('/').pop();
    if (path) {
      setActiveSection(path);
    }
  }, [navigate, location]);

  const fetchProviderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/serviceprovider/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch provider details');
      }

      const data = await response.json();
      if (data.success) {
        setProvider(data.provider);
      } else {
        setError(data.message || 'Failed to fetch provider details');
      }
    } catch (error) {
      console.error('Error fetching provider details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/bookings/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Only service providers can view booking requests.');
        }
        throw new Error('Failed to fetch booking requests');
      }

      const data = await response.json();
      if (data.success) {
        console.log('Booking requests received:', data.bookings);
        // The API now returns bookings with populated customer details
        setBookingRequests(data.bookings);
      } else {
        setError(data.message || 'Failed to fetch booking requests');
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingResponse = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/bookings/response/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to process booking response');
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        // Remove the responded booking from the list
        setBookingRequests(prevRequests => 
          prevRequests.filter(booking => booking._id !== bookingId)
        );
      } else {
        toast.error(data.message || 'Failed to process booking response');
      }
    } catch (error) {
      console.error('Error responding to booking:', error);
      toast.error('Failed to process booking response');
    }
  };

  const renderBookingActions = (booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <div className="booking-actions">
            <button
              className="action-button accept"
              onClick={() => handleBookingResponse(booking._id, 'accepted')}
            >
              <FaCheck /> Accept
            </button>
            <button
              className="action-button decline"
              onClick={() => handleBookingResponse(booking._id, 'declined')}
            >
              <FaTimes /> Decline
            </button>
          </div>
        );
      case 'accepted':
        return (
          <button
            className="action-button complete"
            onClick={() => handleBookingResponse(booking._id, 'completed')}
          >
            <FaCheck /> Mark as Completed
          </button>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'bookings':
        return <Bookings activeSection={activeSection} />;
      case 'dashboard':
        return renderDashboard();
      case 'profile':
        return <ServiceProviderProfile />;
      case 'reviews':
        return <Reviews />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="provider-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome, {provider?.fullName || "Service Provider"}!</h1>
        <p className="welcome-subtitle">Here's what's happening today</p>
      </div>

      {/* Booking Request Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Booking Request</h2>
        </div>

        <div className="booking-requests-section">
          <h3>New Booking Requests</h3>
          <div className="booking-requests-grid">
            {bookingRequests.map(booking => (
              <CustomerCard
                key={booking._id}
                bookingDetails={booking}
                onAccept={() => handleBookingResponse(booking._id, 'accepted')}
                onDecline={() => handleBookingResponse(booking._id, 'declined')}
              />
            ))}
            {bookingRequests.length === 0 && (
              <p className="no-data">No pending booking requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="service-provider-container">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
          </div>
          <div className="header-right">
            <div className="profile">
              <FaUserCircle className="profile-icon" />
              <span>{provider?.fullName}</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => navigate('/login')} className="primary-button">
              Login as Service Provider
            </button>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default ServiceProvider; 