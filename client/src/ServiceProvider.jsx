import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaEnvelope, FaBell, FaCheck, FaTimes, FaDollarSign, FaStar, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
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
    // Initialize provider state with localStorage data
    setProvider(user);
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

      const response = await axios.get('http://localhost:4000/api/serviceprovider/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        const providerData = response.data.provider;
        
        // Get current user data
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        // Merge with new data, preserving existing image data
        const updatedUser = {
          ...currentUser,
          ...providerData,
          profilePicture: providerData.profilePicture || currentUser.profilePicture,
          certificate: providerData.certificate || currentUser.certificate
        };

        // Update state and localStorage
        setProvider(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Updated provider data:', updatedUser);
      } else {
        setError('Failed to fetch provider details');
      }
    } catch (error) {
      console.error('Error fetching provider details:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Fetching requests with token:', token.substring(0, 20) + '...');

      const [bookingsResponse, emergencyResponse] = await Promise.all([
        fetch('http://localhost:4000/api/bookings/requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://localhost:4000/api/emergency/provider-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      console.log('Bookings Response Status:', bookingsResponse.status);
      console.log('Emergency Response Status:', emergencyResponse.status);

      if (!bookingsResponse.ok || !emergencyResponse.ok) {
        // Log detailed error information
        const bookingsError = await bookingsResponse.text().catch(() => 'No error details');
        const emergencyError = await emergencyResponse.text().catch(() => 'No error details');
        
        console.error('Bookings Error:', bookingsError);
        console.error('Emergency Error:', emergencyError);

        if (bookingsResponse.status === 401 || emergencyResponse.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        if (bookingsResponse.status === 403 || emergencyResponse.status === 403) {
          throw new Error('Access denied. Only service providers can view booking requests.');
        }
        throw new Error(`Failed to fetch requests. Bookings: ${bookingsResponse.status}, Emergency: ${emergencyResponse.status}`);
      }

      const [bookingsData, emergencyData] = await Promise.all([
        bookingsResponse.json(),
        emergencyResponse.json()
      ]);

      // Combine and format both types of requests
      const normalBookings = bookingsData.success ? bookingsData.bookings : [];
      const emergencyBookings = emergencyData.success ? 
        emergencyData.requests
          .filter(req => req.status === 'pending') // Only include pending emergency requests
          .map(req => ({
            ...req,
            isEmergency: true,
            price: req.price || 0
          })) : [];

      // Combine both types of requests and sort by creation date
      const allRequests = [...normalBookings, ...emergencyBookings].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log('All booking requests:', allRequests);
      setBookingRequests(allRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingResponse = async (bookingId, status, isEmergency = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const endpoint = isEmergency
        ? `http://localhost:4000/api/emergency/response/${bookingId}`
        : `http://localhost:4000/api/bookings/response/${bookingId}`;

      console.log('Sending response:', {
        endpoint,
        bookingId,
        status,
        isEmergency
      });

      const response = await axios.put(
        endpoint,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Remove the responded booking from the list
        setBookingRequests(prevRequests => 
          prevRequests.filter(booking => booking._id !== bookingId)
        );
        // Refresh the booking requests to ensure the list is up to date
        fetchBookingRequests();
      } else {
        toast.error(response.data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error(error.response?.data?.message || 'Failed to process request');
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
          <h2>Booking Requests</h2>
        </div>

        <div className="booking-requests-section">
          <h3>New Booking Requests</h3>
          <div className="booking-requests-grid">
            {bookingRequests.map(booking => (
              <CustomerCard
                key={booking._id}
                bookingDetails={{
                  ...booking,
                  isEmergency: booking.isEmergency || false,
                  price: booking.isEmergency ? `${booking.price}/hr (Emergency Rate)` : `${booking.price}/hr`
                }}
                onAccept={() => handleBookingResponse(booking._id, 'accepted', booking.isEmergency)}
                onDecline={() => handleBookingResponse(booking._id, 'declined', booking.isEmergency)}
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
              {provider?.profilePicture?.url ? (
                <img 
                  src={provider.profilePicture.url} 
                  alt="Profile" 
                  className="profile-icon profile-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = null;
                    e.target.className = "profile-icon";
                    const icon = document.createElement('i');
                    icon.className = "fas fa-user-circle profile-icon";
                    e.target.parentElement.replaceChild(icon, e.target);
                  }}
                />
              ) : (
                <FaUserCircle className="profile-icon" />
              )}
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