import React from 'react';
import { FaPhone, FaCalendarAlt, FaTools, FaDollarSign, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './CustomerCard.css';

const CustomerCard = ({ customer, bookingDetails, onAccept, onDecline }) => {
  if (!bookingDetails) {
    return null;
  }

  // Get customer details from the populated customerId field
  const customerDetails = bookingDetails.customerId || {};
  console.log('Customer Details:', customerDetails);
  
  // Handle both capitalized and lowercase field names
  const customerName = customerDetails.fullName || customerDetails.FullName || 'Customer Name Unavailable';
  const customerPhone = customerDetails.phoneNumber || customerDetails.PhoneNumber || 'No phone available';
  const customerAddress = bookingDetails.address || customerDetails.address || customerDetails.Address || 'No address available';
  
  // Format the date
  const formattedDate = new Date(bookingDetails.bookingDateTime || bookingDetails.createdAt).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`customer-card ${bookingDetails.isEmergency ? 'emergency' : ''}`}>
      {bookingDetails.isEmergency && (
        <div className="emergency-badge">
          <FaExclamationTriangle />
          Emergency Request
        </div>
      )}
      <div className="customer-header">
        <div className="customer-info">
          <h3>{customerName}</h3>
          <div className="service-type">
            <FaTools className="icon" />
            <span>{bookingDetails.serviceType}</span>
          </div>
        </div>
        <div className="customer-status-section">
          <span className={`customer-status-badge ${bookingDetails.status || 'pending'}`}>
            {(bookingDetails.status || 'pending').charAt(0).toUpperCase() + (bookingDetails.status || 'pending').slice(1)}
          </span>
        </div>
      </div>

      <div className="customer-details">
        <div className="detail-row">
          <span className="detail-label">Address:</span>
          <span className="detail-value">{customerAddress}</span>
        </div>
        <div className="detail-row">
          <FaPhone className="icon" />
          <span>{customerPhone}</span>
        </div>
        <div className="detail-row date">
          <FaCalendarAlt className="icon" />
          <span>{formattedDate}</span>
        </div>
        <div className="detail-row price">
          <FaDollarSign className="icon" />
          <span>{bookingDetails.price}</span>
          {bookingDetails.isEmergency && (
            <span className="emergency-rate-note">Emergency Rate</span>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button className="decline-button" onClick={onDecline}>
          <FaTimes />
          <span>Decline</span>
        </button>
        <button className={`accept-button ${bookingDetails.isEmergency ? 'emergency' : ''}`} onClick={onAccept}>
          <FaCheck />
          <span>{bookingDetails.isEmergency ? 'Accept Emergency' : 'Accept'}</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerCard; 