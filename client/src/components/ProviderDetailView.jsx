import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaUser, FaMapMarkerAlt, FaTools, FaDollarSign, FaPhone, FaEnvelope, FaCertificate, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';
import './ProviderDetailView.css';

const ProviderDetailView = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:4000/api/serviceprovider/details/${providerId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setProvider(response.data.provider);
        } else {
          toast.error('Failed to fetch provider details');
        }
      } catch (error) {
        console.error('Error fetching provider details:', error);
        toast.error(error.response?.data?.message || 'Error loading provider details');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [providerId]);

  if (loading) {
    return (
      <div className="provider-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading">Loading provider details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-detail-page">
        <Header />
        <div className="error-container">
          <div className="error">Provider not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="provider-detail-page">
      <Header />
      <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
        <FaArrowLeft />
      </button>
      <div className="provider-detail-container">
        <div className="provider-detail-card">
          <div className="provider-header">
            <div className="provider-avatar">
              {provider.profilePicture?.url ? (
                <img 
                  src={provider.profilePicture.url} 
                  alt={provider.fullName} 
                  className="profile-image"
                />
              ) : (
                <FaUser className="default-avatar" />
              )}
            </div>
            <div className="provider-info">
              <h2>{provider.fullName}</h2>
              <div className="provider-rating">
                <FaStar className="star-icon" />
                <span>{provider.rating ? `${provider.rating.toFixed(1)} (${provider.totalReviews} reviews)` : 'No ratings yet'}</span>
              </div>
            </div>
          </div>

          <div className="provider-details">
            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-item">
                <FaPhone className="detail-icon" />
                <span>{provider.phoneNumber}</span>
              </div>
              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <span>{provider.email}</span>
              </div>
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <span>{provider.address}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Service Information</h3>
              <div className="detail-item">
                <FaTools className="detail-icon" />
                <span>{provider.serviceType}</span>
              </div>
              <div className="detail-item">
                <FaDollarSign className="detail-icon" />
                <span>${provider.price}/hr</span>
              </div>
              {provider.certificate?.url && (
                <div className="detail-item">
                  <FaCertificate className="detail-icon" />
                  <a href={provider.certificate.url} target="_blank" rel="noopener noreferrer">
                    View Certificate
                  </a>
                </div>
              )}
            </div>
          </div>

          {provider.reviews && provider.reviews.length > 0 && (
            <div className="reviews-section">
              <h3>Reviews</h3>
              <div className="reviews-list">
                {provider.reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-name">{review.customerName}</div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? 'star-filled' : 'star-empty'}
                          />
                        ))}
                      </div>
                    </div>
                    {review.review && <p className="review-text">{review.review}</p>}
                    <div className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProviderDetailView; 