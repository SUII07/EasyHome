import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaTools, FaDollarSign, FaUser, FaMapMarkerAlt, FaPhone, FaFilter, FaStar, FaTimes, FaArrowLeft } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CustomerMap from '../components/CustomerMap';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
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
        toast.error('Please login to view your bookings');
        navigate('/login');
        return;
      }

      // Fetch both normal bookings and emergency bookings
      const [normalResponse, emergencyResponse] = await Promise.all([
        fetch('http://localhost:4000/api/bookings/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:4000/api/emergency/customer-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (normalResponse.status === 401 || emergencyResponse.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
        return;
      }

      if (!normalResponse.ok || !emergencyResponse.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const normalData = await normalResponse.json();
      const emergencyData = await emergencyResponse.json();

      // Process normal bookings
      const normalBookings = normalData.bookings.map(booking => ({
        ...booking,
        isEmergency: false
      }));

      // Process emergency bookings
      const emergencyBookings = emergencyData.requests.map(booking => ({
        ...booking,
        isEmergency: true
      }));

      // Combine and sort all bookings
      const allBookings = [...normalBookings, ...emergencyBookings].sort((a, b) => {
        // Sort by emergency status first
        if (a.isEmergency !== b.isEmergency) {
          return a.isEmergency ? -1 : 1;
        }
        // Then sort by date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.message === 'Failed to fetch bookings') {
        toast.error('Unable to load your bookings. Please try again later.');
      } else {
        toast.error('An unexpected error occurred');
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user?.fullName) {
        toast.error('User information not found. Please log in again.');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/serviceprovider/${selectedBooking.providerId._id}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          review,
          bookingId: selectedBooking._id,
          customerName: user.fullName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit rating');
      }

      toast.success('Rating submitted successfully');
      setShowRatingModal(false);
      setRating(0);
      setReview('');
      setSelectedBooking(null);
      fetchBookings(); // Refresh bookings to update the rating status
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.message || 'Failed to submit rating');
    }
  };

  const RatingModal = () => {
    const [localReview, setLocalReview] = useState('');

    useEffect(() => {
      setLocalReview(review);
    }, [review]);

    const handleSubmit = () => {
      handleRatingSubmit();
    };

    const handleReviewChange = (e) => {
      const newValue = e.target.value;
      setLocalReview(newValue);
      setReview(newValue);
    };

    return (
      <div className="rating-modal-overlay">
        <div className="rating-modal">
          <button className="close-modal" onClick={() => setShowRatingModal(false)}>
            <FaTimes />
          </button>
          <h2>Rate Your Service Provider</h2>
          <div className="provider-info">
            <FaUser className="provider-icon" />
            <span>{selectedBooking?.providerId?.fullName}</span>
          </div>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${star <= (hoveredStar || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
              />
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="review">Your Review</label>
            <input
              type="text"
              id="review"
              name="review"
              value={localReview}
              onChange={handleReviewChange}
              placeholder="Write your review here..."
              className="review-input"
            />
          </div>
          <button 
            className="submit-rating"
            onClick={handleSubmit}
            disabled={!rating}
          >
            Submit Rating
          </button>
        </div>
      </div>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const BookingCard = ({ booking }) => {
    const otherParty = user.role === 'customer' ? booking.providerId : booking.customerId;
    const canRate = booking.status === 'completed' && user.role === 'customer' && !booking.isRated;
    const [isRating, setIsRating] = useState(false);
    const [localRating, setLocalRating] = useState(0);
    const [localReview, setLocalReview] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [showMap, setShowMap] = useState(false);

    // Format the date based on whether it's an emergency booking or regular booking
    const getFormattedDate = () => {
      const date = booking.isEmergency ? booking.createdAt : booking.bookingDateTime;
      return date ? new Date(date).toLocaleString() : 'Invalid Date';
    };

    const handleRatingSubmit = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user?.fullName) {
          toast.error('User information not found. Please log in again.');
          return;
        }

        const response = await fetch(`http://localhost:4000/api/serviceprovider/${booking.providerId._id}/rate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rating: localRating,
            review: localReview,
            bookingId: booking._id,
            customerName: user.fullName
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit rating');
        }

        toast.success('Rating submitted successfully');
        setIsRating(false);
        setLocalRating(0);
        setLocalReview('');
        fetchBookings(); // Refresh bookings to update the rating status
      } catch (error) {
        console.error('Error submitting rating:', error);
        toast.error(error.message || 'Failed to submit rating');
      }
    };

    const handleViewMap = () => {
      setShowMap(!showMap);
    };

    // Get coordinates for both parties
    const getCoordinates = () => {
      // For customer
      let customerLat = parseFloat(booking.customerId?.latitude);
      let customerLng = parseFloat(booking.customerId?.longitude);
      let customerPlusCode = booking.customerId?.plusCode;

      // For provider
      let providerLat = parseFloat(booking.providerId?.latitude);
      let providerLng = parseFloat(booking.providerId?.longitude);
      let providerPlusCode = booking.providerId?.plusCode;

      return {
        customerLat,
        customerLng,
        customerPlusCode,
        providerLat,
        providerLng,
        providerPlusCode
      };
    };

    const coords = getCoordinates();
    
    return (
      <div className={`booking-card ${booking.isEmergency ? 'emergency' : ''}`}>
        <div className="booking-header">
          <div className="user-info">
            <FaUser className="icon" />
            <h3>{otherParty?.fullName || otherParty?.FullName || 'Name not available'}</h3>
            {booking.rating && !isRating && (
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
          <div className="booking-status-section">
            <span className={`booking-status-badge ${booking.status} ${booking.isEmergency ? 'emergency' : ''}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              {booking.isEmergency && ' (Emergency)'}
            </span>
          </div>
        </div>

        <div className="booking-details">
          <div className="detail-row">
            <FaTools className="icon" />
            <span>{booking.serviceType}</span>
          </div>
          <div className="detail-row">
            <FaCalendarAlt className="icon" />
            <span>{getFormattedDate()}</span>
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

        {/* View Map button only for accepted bookings */}
        {booking.status === 'accepted' && otherParty?.address && (
          <div className="view-map-button-container">
            <button className="view-map-button" onClick={handleViewMap}>
              <FaMapMarkerAlt />
              <span>{showMap ? 'Hide Map' : 'View Map'}</span>
            </button>
          </div>
        )}

        {showMap && (
          <div className="map-section">
            <CustomerMap 
              latitude={coords.customerLat}
              longitude={coords.customerLng}
              plusCode={coords.customerPlusCode}
              address={booking.customerId?.Address || booking.customerId?.address}
              providerLatitude={coords.providerLat}
              providerLongitude={coords.providerLng}
              providerPlusCode={coords.providerPlusCode}
              providerName={booking.providerId?.fullName || booking.providerId?.FullName}
            />
          </div>
        )}

        {canRate && !isRating && (
          <div className="rate-button-container">
            <button 
              className="rate-button"
              onClick={() => setIsRating(true)}
            >
              <FaStar className="star-icon" />
              Rate & Review
            </button>
          </div>
        )}

        {isRating && (
          <div className="rating-section">
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`star ${star <= (hoveredStar || localRating) ? 'active' : ''}`}
                  onClick={() => setLocalRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                />
              ))}
            </div>
            <div className="form-group">
              <input
                type="text"
                value={localReview}
                onChange={(e) => setLocalReview(e.target.value)}
                placeholder="Write your review here..."
                className="review-input"
              />
            </div>
            <div className="rating-actions">
              <button 
                className="submit-rating"
                onClick={handleRatingSubmit}
                disabled={!localRating}
              >
                Submit
              </button>
              <button 
                className="cancel-rating"
                onClick={() => {
                  setIsRating(false);
                  setLocalRating(0);
                  setLocalReview('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
      {showRatingModal && <RatingModal />}
      <Footer />
    </div>
  );
};

export default MyBookings; 