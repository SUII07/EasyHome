import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPhone, 
  FaCalendarAlt, 
  FaTools, 
  FaDollarSign, 
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaClock,
  FaUser,
  FaStar,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './Bookings.css';

const BookingCard = ({ booking, onResponse }) => {
  const formattedDate = new Date(booking.bookingDateTime || booking.createdAt).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const customerName = booking.customerId?.FullName || 'Customer Name Unavailable';
  const customerPhone = booking.customerId?.PhoneNumber || 'No phone available';
  const customerAddress = booking.customerId?.Address || 'No address available';

  const handleMarkAsComplete = () => {
    onResponse(booking._id, 'completed', booking.isEmergency);
  };

  return (
    <div className={`customer-card ${booking.isEmergency ? 'emergency' : ''}`}>
      {booking.isEmergency && (
        <div className="emergency-badge">
          <FaExclamationTriangle />
          Emergency Request
        </div>
      )}
      <div className="customer-header">
        <div className="customer-info">
          <h3>{customerName}</h3>
          <div className="service-type">
            <FaTools className="icon" />
            <span>{booking.serviceType}</span>
          </div>
          {booking.rating && (
            <div className="rating-badge">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`star ${star <= booking.rating ? 'active' : ''}`}
                  />
                ))}
              </div>
              {booking.review && (
                <span className="review-tooltip" title={booking.review}>
                  View Review
                </span>
              )}
            </div>
          )}
        </div>
        <div className="status-section">
          <span className={`status-badge ${booking.status} ${booking.isEmergency ? 'emergency' : ''}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="customer-details">
        <div className="detail-row">
          <FaMapMarkerAlt className="icon" />
          <span>{customerAddress}</span>
        </div>
        <div className="detail-row">
          <FaPhone className="icon" />
          <span>{customerPhone}</span>
        </div>
        <div className="detail-row">
          <FaCalendarAlt className="icon" />
          <span>{formattedDate}</span>
        </div>
        <div className="detail-row">
          <FaDollarSign className="icon" />
          <span>${booking.price}/hr</span>
          {booking.isEmergency && (
            <span className="emergency-rate-note">Emergency Rate</span>
          )}
        </div>
      </div>

      {booking.status === 'pending' && (
        <div className="card-actions">
          <button
            className="decline-button"
            onClick={() => onResponse(booking._id, 'declined', booking.isEmergency)}
          >
            <FaTimes />
            <span>Decline</span>
          </button>
          <button
            className={`accept-button ${booking.isEmergency ? 'emergency' : ''}`}
            onClick={() => onResponse(booking._id, 'accepted', booking.isEmergency)}
          >
            <FaCheck />
            <span>{booking.isEmergency ? 'Accept Emergency' : 'Accept'}</span>
          </button>
        </div>
      )}

      {booking.status === 'accepted' && (
        <div className="card-actions">
          <button
            className="complete-button"
            onClick={handleMarkAsComplete}
          >
            <FaCheck />
            <span>Mark as Complete</span>
          </button>
        </div>
      )}
    </div>
  );
};

const Bookings = ({ activeSection = 'bookings' }) => {
  const [allBookings, setAllBookings] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get the provider ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        throw new Error('User information not found');
      }

      // Fetch both normal bookings and emergency requests
      const [normalBookings, emergencyBookings] = await Promise.all([
        // Fetch normal bookings
        axios.get(`http://localhost:4000/api/bookings?providerId=${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        // Fetch emergency bookings
        axios.get('http://localhost:4000/api/emergency/provider-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Process normal bookings
      const processedNormalBookings = normalBookings.data.success ? 
        normalBookings.data.bookings.map(booking => ({
          ...booking,
          isEmergency: false
        })) : [];

      // Process emergency bookings
      const processedEmergencyBookings = emergencyBookings.data.success ?
        emergencyBookings.data.requests.map(booking => ({
          ...booking,
          isEmergency: true
        })) : [];

      // Combine and sort all bookings
      const combinedBookings = [...processedEmergencyBookings, ...processedNormalBookings]
        .sort((a, b) => {
          // Sort by emergency status first
          if (a.isEmergency !== b.isEmergency) {
            return a.isEmergency ? -1 : 1;
          }
          // Then sort by date
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

      setAllBookings(combinedBookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
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
        : `http://localhost:4000/api/bookings/${bookingId}/status`;

      const response = await axios({
        method: isEmergency ? 'put' : 'patch',
        url: endpoint,
        data: { status },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Update the status in the local state
        setAllBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status } 
              : booking
          )
        );
        
        const actionMessage = status === 'completed' 
          ? 'Service marked as completed' 
          : `Service ${status} successfully`;
        toast.success(actionMessage);
        
        // Refresh the bookings list after a short delay
        setTimeout(() => {
          fetchAllBookings();
        }, 1000);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getFilteredBookings = () => {
    // For the dashboard, only show pending requests
    if (activeSection === 'dashboard') {
      return allBookings.filter(booking => booking.status === 'pending');
    }
    
    // For the bookings page, apply the selected filter
    if (selectedFilter === 'all') {
      return allBookings;
    }
    return allBookings.filter(booking => booking.status === selectedFilter);
  };

  const renderBookingCard = (booking) => {
    // Don't render non-pending bookings in dashboard
    if (activeSection === 'dashboard' && booking.status !== 'pending') {
      return null;
    }

    if (!booking) return null;

    return (
      <BookingCard 
        key={booking._id}
        booking={booking}
        onResponse={handleBookingResponse}
      />
    );
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h2>{activeSection === 'dashboard' ? 'New Booking Requests' : 'My Bookings'}</h2>
        {activeSection !== 'dashboard' && (
          <div className="filter-section">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Bookings</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        )}
      </div>

      <div className="bookings-grid">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : getFilteredBookings().length > 0 ? (
          getFilteredBookings().map(booking => (
            <div key={booking._id} className="booking-card-wrapper">
              {renderBookingCard(booking)}
            </div>
          ))
        ) : (
          <p className="no-bookings">
            {activeSection === 'dashboard' 
              ? 'No new booking requests' 
              : `No ${selectedFilter === 'all' ? '' : selectedFilter} bookings found`}
          </p>
        )}
      </div>
    </div>
  );
};

export default Bookings; 