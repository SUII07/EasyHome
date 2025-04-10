import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaUser, FaMapMarkerAlt, FaTools, FaDollarSign, FaEye } from 'react-icons/fa';
import './ServiceProviderCard.css';

const ServiceProviderCard = ({ provider }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/provider/${provider._id}`);
  };

  return (
    <div className="provider-card">
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
          <h3>{provider.fullName}</h3>
          <div className="provider-rating">
            <FaStar className="star-icon" />
            <span>{provider.rating ? `${provider.rating.toFixed(1)} (${provider.totalReviews} reviews)` : 'No ratings'}</span>
          </div>
        </div>
      </div>
      
      <div className="provider-details">
        <div className="detail-item">
          <FaTools className="detail-icon" />
          <span>{provider.serviceType}</span>
        </div>
        <div className="detail-item">
          <FaMapMarkerAlt className="detail-icon" />
          <span>{provider.address}</span>
        </div>
        <div className="detail-item">
          <FaDollarSign className="detail-icon" />
          <span>${provider.price}/hr</span>
        </div>
      </div>

      <div className="provider-actions">
        <div className="provider-status">
          <span className={`status-badge ${provider.availability ? 'available' : 'unavailable'}`}>
            {provider.availability ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <button className="view-details-btn" onClick={handleViewDetails}>
          <FaEye /> View Details
        </button>
      </div>
    </div>
  );
};

export default ServiceProviderCard; 