import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaTools, FaDollarSign, FaCheck, FaTimes } from 'react-icons/fa';
import './CustomerCard.css';

const CustomerCard = ({ customer, bookingDetails, onAccept, onDecline }) => {
  if (!bookingDetails) {
    return null;
  }

  // Get customer details from the populated customerId field
  const customerDetails = bookingDetails.customerId || {};
  console.log('Customer Details:', customerDetails); // Add this for debugging
  
  // Format the date
  const formattedDate = new Date(bookingDetails.bookingDateTime).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="customer-card">
      <div className="customer-header">
        <div className="customer-info">
          <h3>{customerDetails.FullName || 'Customer Name Unavailable'}</h3>
          <div className="service-type">
            <FaTools className="icon" />
            <span>{bookingDetails.serviceType}</span>
          </div>
        </div>
      </div>

      <div className="customer-details">
        <div className="detail-row">
          <FaMapMarkerAlt className="icon" />
          <span>{customerDetails.Address || 'No address available'}</span>
        </div>
        <div className="detail-row">
          <FaPhone className="icon" />
          <span>{customerDetails.PhoneNumber || 'No phone available'}</span>
        </div>
        <div className="detail-row date">
          <FaCalendarAlt className="icon" />
          <span>{formattedDate}</span>
        </div>
        <div className="detail-row price">
          <FaDollarSign className="icon" />
          <span>${bookingDetails.price || 0}/hr</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="decline-button" onClick={onDecline}>
          <FaTimes />
          <span>Decline</span>
        </button>
        <button className="accept-button" onClick={onAccept}>
          <FaCheck />
          <span>Accept</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerCard; 