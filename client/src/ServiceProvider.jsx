import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaEnvelope, FaBell, FaCheck, FaTimes, FaDollarSign, FaStar, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './ServiceProvider.css';
import CustomerCard from './components/CustomerCard';
import Sidebar from './components/Sidebar';

const ServiceProvider = () => {
  const [provider, setProvider] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [bookingRequests, setBookingRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'serviceprovider') {
      toast.error('Access denied. Only service providers can access this page.');
      navigate('/login');
      return;
    }
    fetchProviderDetails();
    fetchBookingRequests();
  }, [navigate]);

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
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/bookings/requests', {
        method: 'GET',
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
        throw new Error('HTTP error! Status: ' + response.status);
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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
        console.log('Fetched booking requests:', data.bookings); // Debug log
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

  const renderDashboard = () => (
    <div className="provider-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome, {provider?.fullName || "Service Provider"}!</h1>
        <p className="welcome-subtitle">Here's what's happening today</p>
      </div>

      {/* Booking Management Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Booking Management</h2>
          <div className="status-filter">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        <div className="bookings-list">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-info">
                  <h3>{booking.customerName}</h3>
                  <p className="service-type">{booking.serviceType}</p>
                  <p className="booking-date">
                    <FaCalendarAlt className="icon" />
                    {new Date(booking.bookingDateTime).toLocaleString()}
                  </p>
                  <p className="hourly-rate">
                    Hourly Rate: ${booking.hourlyRate}
                  </p>
                </div>
                <div className="booking-status">
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  {renderBookingActions(booking)}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No {selectedStatus} bookings found</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="service-provider-container">
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>Dashboard</h1>
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
          <>
            {bookingRequests && bookingRequests.length > 0 && (
              <div className="booking-requests-section">
                <h2>New Booking Requests</h2>
                <div className="booking-requests-grid">
                  {bookingRequests.map(booking => (
                    <CustomerCard
                      key={booking._id}
                      customer={booking.customerDetails}
                      bookingDetails={booking}
                      onAccept={() => handleBookingResponse(booking._id, 'accepted')}
                      onDecline={() => handleBookingResponse(booking._id, 'declined')}
                    />
                  ))}
                </div>
              </div>
            )}

            {renderDashboard()}
          </>
        )}
      </main>
    </div>
  );
};

export default ServiceProvider; 