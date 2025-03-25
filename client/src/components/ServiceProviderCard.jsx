import React from 'react';
import { FaStar, FaUser, FaMapMarkerAlt, FaTools, FaDollarSign } from 'react-icons/fa';
import './ServiceProviderCard.css';

const ServiceProviderCard = ({ provider }) => {
  return (
    <div className="provider-card">
      <div className="provider-header">
        <div className="provider-avatar">
          <FaUser />
        </div>
        <div className="provider-info">
          <h3>{provider.fullName}</h3>
          <div className="provider-rating">
            <FaStar className="star-icon" />
            <span>{provider.rating || 'No ratings'}</span>
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
          <span>{provider.zipCode}</span>
        </div>
        <div className="detail-item">
          <FaDollarSign className="detail-icon" />
          <span>${provider.price}/hr</span>
        </div>
      </div>

      <div className="provider-status">
        <span className={`status-badge ${provider.isAvailable ? 'available' : 'unavailable'}`}>
          {provider.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>
    </div>
  );
};

export default ServiceProviderCard; 