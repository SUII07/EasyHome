import React, { useState } from 'react';
import { FaStar, FaPhone, FaTools, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import BookingModal from './BookingModal';
import './ServiceProviderCard.css';

const ServiceProviderCard = ({ provider }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const navigate = useNavigate();

  const handleBook = () => {
    setShowBookingModal(true);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="provider-card">
      <div className="provider-header">
        <FaUser className="provider-icon" />
        <h3>{provider.FullName}</h3>
      </div>

      <div className="provider-details">
        <div className="detail-item">
          <FaPhone className="detail-icon" />
          <span>{provider.PhoneNumber}</span>
        </div>
        
        <div className="detail-item">
          <FaTools className="detail-icon" />
          <span>{provider.serviceType}</span>
        </div>

        <div className="detail-item">
          <FaStar className="detail-icon" />
          <span>
            {provider.rating > 0 
              ? `${provider.rating.toFixed(1)} (${provider.totalReviews} reviews)`
              : 'No reviews yet'}
          </span>
        </div>
      </div>

      <div className="provider-actions">
        <button className="book-button" onClick={handleBook}>
          Book Now
        </button>
        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>

      {showBookingModal && (
        <BookingModal 
          provider={provider} 
          onClose={() => setShowBookingModal(false)} 
        />
      )}
    </div>
  );
};

export default ServiceProviderCard; 