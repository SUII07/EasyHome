import React, { useState, useEffect } from 'react';
import { FaStar, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!user || user.role !== 'serviceprovider') {
        throw new Error('User is not a service provider');
      }

      const response = await fetch('http://localhost:4000/api/serviceprovider/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }

      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        throw new Error(data.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message);
      toast.error(`Failed to load reviews: ${error.message}`);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      averageRating: (sum / reviews.length).toFixed(1),
      totalReviews: reviews.length
    };
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error Loading Reviews</h2>
        <p>{error}</p>
        <button onClick={fetchReviews} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="no-reviews">
        <div className="no-reviews-content">
          <FaStar className="no-reviews-icon" />
          <h2>No Reviews Yet</h2>
          <p>You haven't received any reviews from customers yet.</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <div className="reviews-title">
          <h2>Customer Reviews</h2>
          <p className="reviews-subtitle">See what customers are saying about your services</p>
        </div>
        <div className="reviews-summary">
          <div className="average-rating">
            <div className="rating-number">
              <FaStar className="star-icon" />
              <span>{stats.averageRating}</span>
            </div>
            <p className="rating-text">Average Rating</p>
          </div>
          <div className="total-reviews">
            <span className="reviews-count">{stats.totalReviews}</span>
            <p className="reviews-text">Total Reviews</p>
          </div>
        </div>
      </div>

      <div className="reviews-grid">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="review-rating">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`star ${index < review.rating ? 'active' : ''}`}
                  />
                ))}
              </div>
              <div className="review-date">
                <FaCalendarAlt className="date-icon" />
                <span>{new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
            <div className="review-content">
              {review.review && <p className="review-text">{review.review}</p>}
              <p className="customer-name">- {review.customerName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews; 