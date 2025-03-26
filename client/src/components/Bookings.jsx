import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaCalendarAlt, 
  FaTools, 
  FaDollarSign, 
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './Bookings.css';

const Bookings = ({ activeSection = 'bookings' }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
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

      console.log('Fetching bookings for provider:', user._id);

      // Fetch all bookings for the provider
      const response = await fetch(`http://localhost:4000/api/bookings?providerId=${user._id}`, {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('Received bookings data:', data);

      if (data.success) {
        // Fetch customer details for each booking
        const bookingsWithCustomers = await Promise.all(
          data.bookings.map(async (booking) => {
            try {
              // Extract customer ID, handling both object and string cases
              const customerId = booking.customerId?._id || booking.customerId;
              
              console.log(`Fetching customer details for booking ${booking._id}, customerId:`, customerId);
              
              const customerResponse = await fetch(`http://localhost:4000/api/users/customer/${customerId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (!customerResponse.ok) {
                console.error(`Failed to fetch customer details for booking ${booking._id}`);
                return booking;
              }

              const customerData = await customerResponse.json();
              console.log(`Customer data received for booking ${booking._id}:`, customerData);

              return {
                ...booking,
                customer: customerData.customer || customerData.user || customerData
              };
            } catch (error) {
              console.error(`Error fetching customer details for booking ${booking._id}:`, error);
              return booking;
            }
          })
        );

        console.log('Final bookings with customer details:', bookingsWithCustomers);
        setBookings(bookingsWithCustomers);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

      console.log(`Updating booking ${bookingId} to status: ${status}`);

      const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to update booking status');
      }

      const data = await response.json();
      console.log('Status update response:', data);

      if (data.success || data.status === status) {
        toast.success(`Booking marked as ${status}`);
        // Refresh the bookings list
        fetchBookings();
      } else {
        toast.error(data.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(error.message || 'Failed to update booking status');
    }
  };

  const getFilteredBookings = () => {
    console.log('Current filter:', selectedFilter);
    console.log('All bookings:', bookings);

    // First filter out pending bookings unless specifically viewing dashboard
    let filteredBookings = bookings.filter(booking => 
      activeSection === 'dashboard' || booking.status !== 'pending'
    );

    // Then apply the selected filter
    if (selectedFilter !== 'all') {
      filteredBookings = filteredBookings.filter(booking => booking.status === selectedFilter);
    }

    console.log('Filtered bookings:', filteredBookings);
    return filteredBookings;
  };

  const renderBookingCard = (booking) => {
    if (!booking) return null;

    console.log('Rendering booking:', booking);

    const formattedDate = new Date(booking.bookingDateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const renderActionButtons = (booking) => {
      switch (booking.status) {
        case 'pending':
          return (
            <div className="card-actions">
              <button
                className="decline-button"
                onClick={() => handleBookingResponse(booking._id, 'declined')}
              >
                <FaTimes />
                <span>Decline</span>
              </button>
              <button
                className="accept-button"
                onClick={() => handleBookingResponse(booking._id, 'accepted')}
              >
                <FaCheck />
                <span>Accept</span>
              </button>
            </div>
          );
        case 'accepted':
          return (
            <div className="card-actions">
              <button
                className="complete-button"
                onClick={() => handleBookingResponse(booking._id, 'completed')}
              >
                <FaCheck />
                <span>Mark as Complete</span>
              </button>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="customer-card">
        <div className="customer-header">
          <div className="customer-info">
            <h3>{booking.customerName}</h3>
            <div className="service-type">
              <FaTools className="icon" />
              <span>{booking.serviceType}</span>
            </div>
          </div>
          <span className={`status-badge ${booking.status}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        <div className="customer-details">
          <div className="detail-row">
            <FaMapMarkerAlt className="icon" />
            <span>{booking.customerAddress}</span>
          </div>
          <div className="detail-row">
            <FaPhone className="icon" />
            <span>{booking.customerPhone}</span>
          </div>
          <div className="detail-row date">
            <FaCalendarAlt className="icon" />
            <span>{formattedDate}</span>
          </div>
          <div className="detail-row price">
            <FaDollarSign className="icon" />
            <span>${booking.price || 0}/hr</span>
          </div>
        </div>

        {renderActionButtons(booking)}
      </div>
    );
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h2>My Bookings</h2>
        <div className="filter-section">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Bookings</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="declined">Canceled</option>
          </select>
        </div>
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
            No {selectedFilter === 'all' ? '' : selectedFilter} bookings found
          </p>
        )}
      </div>
    </div>
  );
};

export default Bookings; 