import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaUserCircle, FaStar, FaPhone, FaExclamationTriangle } from 'react-icons/fa';
import './Emergency.css';

const Emergency = ({ serviceType, onClose }) => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Please enter your address');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/emergency/providers?address=${encodeURIComponent(address)}&serviceType=${encodeURIComponent(serviceType)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProviders(data.providers);
        setStep(2);
      } else {
        toast.error(data.message || 'Failed to find providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to find providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestProvider = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/emergency/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          providerId,
          address,
          serviceType
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Emergency request sent successfully');
        onClose();
      } else {
        toast.error(data.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send request. Please try again.');
    }
  };

  return (
    <div className="emergency-modal">
      <div className="emergency-content">
        <h2>
          <FaExclamationTriangle /> Emergency {serviceType} Service
        </h2>
        
        {step === 1 && (
          <form onSubmit={handleAddressSubmit} className="address-form">
            <div className="form-group">
              <label>
                <FaExclamationTriangle /> Your Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address"
                required
              />
              <div className="address-hint">
                Please provide your complete address including area and city for accurate provider matching
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Finding Providers...' : 'Find Available Providers'}
            </button>
            <button type="button" className="close-btn" onClick={onClose}>
              Cancel
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="providers-list">
            <div className="providers-header">
              <h3>Available Emergency Service Providers</h3>
              <p className="providers-count">
                {providers.length} provider(s) found in your area
              </p>
            </div>
            
            {providers.length > 0 ? (
              <div className="providers-grid">
                {providers.map((provider) => (
                  <div key={provider._id} className="provider-card emergency">
                    <div className="provider-header">
                      <div className="provider-avatar">
                        {provider.profileImage ? (
                          <img src={provider.profileImage} alt={provider.fullName} />
                        ) : (
                          <FaUserCircle />
                        )}
                      </div>
                      <div className="provider-info">
                        <h4>{provider.fullName}</h4>
                        <div className="provider-address">
                          {provider.address}
                        </div>
                        <div className="rating">
                          <FaStar className="star-icon" />
                          {provider.rating} ({provider.totalReviews} reviews)
                        </div>
                        <div className="provider-contact">
                          <FaPhone className="phone-icon" />
                          {provider.phoneNumber}
                        </div>
                      </div>
                    </div>
                    
                    <div className="price-info">
                      <span className="price-label">Emergency Rate:</span>
                      <span className="price-amount">${provider.price * 1.5}/hr</span>
                      <span className="price-note">1.5x regular rate for emergency service</span>
                    </div>

                    <button
                      className="request-btn"
                      onClick={() => handleRequestProvider(provider._id)}
                    >
                      Request Emergency Service
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-providers">
                <FaExclamationTriangle className="warning-icon" />
                <h3>No Providers Available</h3>
                <p className="sub-text">
                  Sorry, we couldn't find any available providers in your area at this time.
                </p>
                <button className="back-btn" onClick={() => setStep(1)}>
                  Try Different Address
                </button>
              </div>
            )}
            
            <button className="close-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergency;
