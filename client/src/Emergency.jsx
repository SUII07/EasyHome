import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaMapMarkerAlt, FaUserCircle, FaStar, FaPhone, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import './Emergency.css';
import { useNavigate } from 'react-router-dom';

const Emergency = ({ serviceType, onClose }) => {
  const [address, setAddress] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const navigate = useNavigate();

  // Service type specific messages and rates
  const serviceConfig = {
    electrician: {
      title: 'Electrical Emergency',
      description: 'For urgent electrical issues requiring immediate attention',
      rate: 1.5,
      color: '#ffd700'
    },
    plumbing: {
      title: 'Plumbing Emergency',
      description: 'For urgent plumbing issues like burst pipes or severe leaks',
      rate: 1.5,
      color: '#4169e1'
    },
    'hvac services': {
      title: 'HVAC Emergency',
      description: 'For urgent heating, ventilation, or air conditioning issues',
      rate: 1.5,
      color: '#32cd32'
    },
    'house cleaning': {
      title: 'Urgent Cleaning',
      description: 'For immediate cleaning services in emergency situations',
      rate: 1.3,
      color: '#87ceeb'
    },
    painting: {
      title: 'Urgent Painting',
      description: 'For immediate painting services in emergency situations',
      rate: 1.3,
      color: '#ff69b4'
    }
  };

  // Format service type to match database format
  const formatServiceType = (type) => {
    return type.toLowerCase().replace(/-/g, ' ');
  };

  const currentService = serviceConfig[formatServiceType(serviceType)] || {
    title: `Emergency ${serviceType}`,
    description: 'For urgent service needs requiring immediate attention',
    rate: 1.5,
    color: '#ff4444'
  };

  useEffect(() => {
    // Check authentication when component mounts
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
      toast.error('Please login to access emergency services');
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can request emergency services');
      onClose();
      return;
    }
  }, [navigate, onClose]);

  const validateAddress = (address) => {
    const parts = address.split(',').map(part => part.trim()).filter(part => part);
    if (parts.length === 0) {
      return 'Please enter your address';
    }
    if (parts.length < 2) {
      return 'Please enter both area and city (e.g., Basantapur, Kathmandu)';
    }
    return null;
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to access emergency services');
      navigate('/login');
      return;
    }

    const error = validateAddress(address);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const formattedServiceType = formatServiceType(serviceType);
      console.log('Searching for service type:', formattedServiceType);
      
      const response = await axios.get(
        'http://localhost:4000/api/emergency/providers',
        {
          params: {
            address: address.trim(),
            serviceType: formattedServiceType
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setProviders(response.data.providers);
        setShowProviders(true);
        
        if (response.data.providers.length === 0) {
          toast.error(response.data.message);
        } else {
          toast.success(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error finding providers:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(
          error.response?.data?.message || 
          'Error finding service providers. Please check your address and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyRequest = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        toast.error('Please login to request emergency service');
        navigate('/login');
        return;
      }

      if (user.role !== 'customer') {
        toast.error('Only customers can request emergency services');
        return;
      }

      setLoading(true);
      const formattedServiceType = formatServiceType(serviceType);
      
      const response = await axios.post(
        'http://localhost:4000/api/emergency/request',
        {
          providerId,
          address: address.trim(),
          serviceType: formattedServiceType
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Emergency service request sent successfully! Provider will be notified immediately.');
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to send emergency request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error sending emergency request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emergency-modal">
      <div className="emergency-content" data-service={serviceType.toLowerCase()}>
        <h2>
          <FaExclamationTriangle className="emergency-icon" />
          {currentService.title}
        </h2>
        <p className="service-description">{currentService.description}</p>
        
        {!showProviders ? (
          <form onSubmit={handleAddressSubmit} className="address-form">
            <div className="form-group">
              <label htmlFor="address">
                <FaMapMarkerAlt /> Enter Your Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Area, City (e.g., Basantapur, Kathmandu)"
                required
              />
              <small className="address-hint">
                Please enter your address in the format: Area, City
                <br />
                Example: Basantapur, Kathmandu
              </small>
            </div>
            <button 
              type="submit" 
              className="submit-btn" 
              data-service={serviceType.toLowerCase()}
              disabled={loading}
            >
              {loading ? 'Finding Providers...' : 'Find Nearby Providers'}
            </button>
          </form>
        ) : (
          <div className="providers-list">
            {providers.length === 0 ? (
              <div className="no-providers">
                <FaExclamationTriangle className="warning-icon" />
                <p>No service providers found in your area</p>
                <p className="sub-text">
                  We couldn't find any providers in {address.split(',')[0].trim()}.
                  <br />
                  Please try a different area or check back later.
                </p>
                <button onClick={() => setShowProviders(false)} className="back-btn">
                  Try Different Address
                </button>
              </div>
            ) : (
              <>
                <div className="providers-header">
                  <h3>Available Emergency Service Providers</h3>
                  <p className="providers-count">
                    Found {providers.length} provider{providers.length !== 1 ? 's' : ''} in your area
                  </p>
                  <p className="emergency-note">
                    <FaExclamationTriangle className="warning-icon" />
                    Emergency service rates are {currentService.rate}x the regular rate
                  </p>
                </div>
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
                            <FaMapMarkerAlt />
                            <span>{provider.address}</span>
                          </div>
                          <div className="rating">
                            <FaStar className="star-icon" />
                            <span>{provider.rating ? `${provider.rating} (${provider.totalReviews || 0} reviews)` : 'No ratings yet'}</span>
                          </div>
                          <div className="provider-contact">
                            <FaPhone className="phone-icon" />
                            <span>{provider.phoneNumber}</span>
                          </div>
                        </div>
                      </div>
                      <div className="price-info">
                        <span className="price-label">Emergency Service Rate:</span>
                        <span className="price-amount">${provider.price * currentService.rate}/hr</span>
                        <small className="price-note">*{currentService.rate}x regular rate for emergency service</small>
                      </div>
                      <button
                        onClick={() => handleEmergencyRequest(provider._id)}
                        className="request-btn"
                        data-service={serviceType.toLowerCase()}
                        disabled={loading}
                        style={{ backgroundColor: currentService.color }}
                      >
                        {loading ? 'Sending Request...' : 'Request Emergency Service'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        <button onClick={onClose} className="close-btn">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Emergency;
