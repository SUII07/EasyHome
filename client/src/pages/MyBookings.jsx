import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaTools, FaDollarSign, FaUser, FaMapMarkerAlt, FaPhone, FaFilter } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/bookings/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const BookingCard = ({ booking }) => {
    const otherParty = user.role === 'customer' ? booking.providerId : booking.customerId;
    
    return (
      <div className="booking-card">
        <div className="booking-header">
          <div className="user-info">
            <FaUser className="icon" />
            <h3>{otherParty?.fullName || otherParty?.FullName || 'Name not available'}</h3>
          </div>
          <span className={`status-badge ${booking.status}`}>
            {booking.status}
          </span>
        </div>

        <div className="booking-details">
          <div className="detail-row">
            <FaTools className="icon" />
            <span>{booking.serviceType}</span>
          </div>
          <div className="detail-row">
            <FaCalendarAlt className="icon" />
            <span>{new Date(booking.bookingDateTime).toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <FaDollarSign className="icon" />
            <span>${booking.price}/hr</span>
          </div>
          {otherParty?.address && (
            <div className="detail-row">
              <FaMapMarkerAlt className="icon" />
              <span>{otherParty.address}</span>
            </div>
          )}
          {otherParty?.phoneNumber && (
            <div className="detail-row">
              <FaPhone className="icon" />
              <span>{otherParty.phoneNumber}</span>
            </div>
          )}
        </div>

        {booking.notes && (
          <div className="booking-notes">
            <p>{booking.notes}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <main className="my-bookings-container">
          <div className="loading">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Header />
        <main className="my-bookings-container">
          <div className="error">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />
      <main className="my-bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <div className="filter-section">
            <FaFilter className="filter-icon" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="bookings-stats">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p>{bookings.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
          <div className="stat-card">
            <h3>Accepted</h3>
            <p>{bookings.filter(b => b.status === 'accepted').length}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p>{bookings.filter(b => b.status === 'completed').length}</p>
          </div>
        </div>

        <div className="bookings-grid">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))
          ) : (
            <p className="no-bookings">
              No {filter !== 'all' ? filter : ''} bookings found
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings; 