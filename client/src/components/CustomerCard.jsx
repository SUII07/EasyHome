import React from 'react';
import { FaUser, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaTools, FaDollarSign } from 'react-icons/fa';
import './CustomerCard.css';

const CustomerCard = ({ customer, bookingDetails, onAccept, onDecline }) => {
  // Add default values and null checks
  if (!customer || !bookingDetails) {
    return null; // Don't render if required props are missing
  }

  return (
    <div className="customer-card">
      <div className="customer-header">
        <div className="customer-avatar">
          <FaUser />
        </div>
        <div className="customer-info">
          <h3>{customer.name || 'Customer Name'}</h3>
          <div className="service-type">
            <FaTools className="icon" />
            <span>{bookingDetails.serviceType || 'Service Type'}</span>
          </div>
        </div>
      </div>

      <div className="customer-details">
        <div className="detail-row">
          <FaMapMarkerAlt className="icon" />
          <span>{customer.address || 'No address provided'}</span>
        </div>
        <div className="detail-row">
          <FaPhone className="icon" />
          <span>{customer.phone || 'No phone provided'}</span>
        </div>
        <div className="detail-row">
          <FaCalendarAlt className="icon" />
          <span>{new Date(bookingDetails.bookingDateTime).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <FaDollarSign className="icon" />
          <span>${bookingDetails.price || 0}/hr</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="decline-button" onClick={onDecline}>
          Decline
        </button>
        <button className="accept-button" onClick={onAccept}>
          Accept
        </button>
      </div>
    </div>
  );
};

export default CustomerCard; 