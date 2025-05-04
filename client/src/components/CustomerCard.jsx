import React, { useState } from 'react';
import { FaPhone, FaCalendarAlt, FaTools, FaDollarSign, FaCheck, FaTimes, FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';
import CustomerMap from './CustomerMap';
import { OpenLocationCode } from 'open-location-code';
import './CustomerCard.css';

const CustomerCard = ({ customer, bookingDetails, onAccept, onDecline }) => {
  const [showMap, setShowMap] = useState(false);

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
  let latitude = bookingDetails.location?.latitude || customerDetails.latitude;
  let longitude = bookingDetails.location?.longitude || customerDetails.longitude;
  let lat = parseFloat(latitude);
  let lng = parseFloat(longitude);

  // If lat/lng are invalid, try to decode plus code
  if ((isNaN(lat) || isNaN(lng)) && (customerDetails.plusCode || bookingDetails.location?.plusCode)) {
    const plusCode = customerDetails.plusCode || bookingDetails.location?.plusCode;
    try {
      const olc = new OpenLocationCode();
      const decoded = olc.decode(plusCode);
      lat = decoded.latitudeCenter;
      lng = decoded.longitudeCenter;
    } catch (e) {
      // fallback: still NaN
    }
  }
  const isValidCoords = !isNaN(lat) && !isNaN(lng);
  
  // Format the date
  const formattedDate = new Date(bookingDetails.bookingDateTime || bookingDetails.createdAt).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get provider details from the populated providerId field
  const providerDetails = bookingDetails.providerId || {};
  let providerLatitude = parseFloat(providerDetails.latitude);
  let providerLongitude = parseFloat(providerDetails.longitude);
  let providerName = providerDetails.fullName || providerDetails.FullName || 'Service Provider';

  // If provider lat/lng are invalid, try to decode plus code
  if ((isNaN(providerLatitude) || isNaN(providerLongitude)) && providerDetails.plusCode) {
    try {
      const olc = new OpenLocationCode();
      const decoded = olc.decode(providerDetails.plusCode);
      providerLatitude = decoded.latitudeCenter;
      providerLongitude = decoded.longitudeCenter;
    } catch (e) {
      // fallback: still NaN
    }
  }

  const handleViewMap = () => {
    console.log('View Map clicked:', { lat, lng, customerAddress });
    setShowMap(!showMap);
  };

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

      {showMap && isValidCoords && (
        <div className="map-section">
          <CustomerMap 
            latitude={lat} 
            longitude={lng} 
            address={customerAddress} 
            providerLatitude={providerLatitude}
            providerLongitude={providerLongitude}
            providerName={providerName}
          />
        </div>
      )}
      {showMap && !isValidCoords && (
        <div style={{ color: 'red', margin: '1rem 0' }}>
          Location not available for this customer.
        </div>
      )}

      <div className="card-actions">
        {(bookingDetails.status === 'pending' || bookingDetails.status === 'accepted') && (
          <button className="view-map-button" onClick={handleViewMap}>
            <FaMapMarkerAlt />
            <span>{showMap ? 'Hide Map' : 'View Map'}</span>
          </button>
        )}
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