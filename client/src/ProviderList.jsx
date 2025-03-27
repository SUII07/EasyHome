// components/ProviderList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaTools, FaMapMarkerAlt, FaDollarSign, FaStar, FaUserCircle, FaPhone } from 'react-icons/fa';
import Header from './components/Header';
import Footer from './components/Footer';
import "./ProviderList.css";

const ProviderList = () => {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { serviceType } = useParams();
  const navigate = useNavigate();

  const formatServiceType = (type) => {
    if (!type) return '';
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:4000/api/serviceprovider/${serviceType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setProviders(response.data.providers);
        if (response.data.providers.length > 0) {
          toast.success(`Found ${response.data.providers.length} ${response.data.providers.length === 1 ? 'service provider' : 'service providers'}`, {
            id: 'providers-found'
          });
        }
      } else {
        toast.error(response.data.message || "Failed to fetch service providers");
        setProviders([]);
      }
    } catch (error) {
      console.error("Error fetching providers:", error.response || error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch service providers"
      );
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (serviceType) {
      fetchProviders();
    }
  }, [serviceType]);

  const handleBook = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        toast.error('Please login to book a service');
        navigate('/login');
        return;
      }

      // Check if user is a customer
      if (user.role !== 'customer') {
        toast.error('Only customers can book services');
        return;
      }

      const response = await axios.post(
        'http://localhost:4000/api/bookings/request',
        {
          providerId,
          serviceType,
          notes: ''
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Booking request sent successfully!');
        navigate('/home');
      } else {
        toast.error(response.data.message || 'Failed to send booking request');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response?.status === 403) {
        toast.error('Only customers can book services. Please login as a customer.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send booking request');
      }
    }
  };

  const handleCancel = () => {
    navigate('/home');
  };

  return (
    <> 
      <Header />
      <div className="main-container">
        <div className="sub-header">
          <div className="header-content">
            <button className="back-button" onClick={() => navigate("/home")}>
              <FaArrowLeft />
            </button>
            <h2>{formatServiceType(serviceType)} Service Providers</h2>
          </div>
        </div>

        <div className="provider-list-content">
          {isLoading ? (
            <div className="loading">
              <p>Loading {formatServiceType(serviceType)} providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="no-providers">
              <p>No service providers found for {formatServiceType(serviceType)}</p>
              <button className="primary-button" onClick={() => navigate("/home")}>
                Browse Other Services
              </button>
            </div>
          ) : (
            <div className="provider-grid">
              {providers.map((provider) => (
                <div key={provider._id} className="provider-card">
                  <div className="provider-header">
                    <div className="provider-avatar">
                      {provider.profileImage ? (
                        <img src={provider.profileImage} alt={provider.fullName} />
                      ) : (
                        <FaUserCircle />
                      )}
                    </div>
                    <div className="provider-title">
                      <div className="service-name">{provider.serviceType}</div>
                      <div className="provider-name">{provider.fullName}</div>
                      <div className="rating">
                        <FaStar className="rating-icon" />
                        <span>{provider.rating ? `${provider.rating} (${provider.totalReviews || 0})` : 'No ratings'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="price-section">
                    <div className="price-label">Price</div>
                    <div className="price-amount">
                      ${provider.price}
                    </div>
                    <div className="price-unit">Per Hour</div>
                  </div>

                  <div className="provider-details">
                    <div className="detail-row">
                      <FaPhone className="detail-icon" />
                      <span>{provider.phoneNumber || 'No phone number'}</span>
                    </div>
                    <div className="detail-row">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{provider.address || 'No address'}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="decline-button"
                      onClick={handleCancel}
                    >
                      Decline
                    </button>
                    <button 
                      className="accept-button"
                      onClick={() => handleBook(provider._id)}
                      disabled={!provider.availability}
                    >
                      Accept
                    </button>
                  </div>

                  <button className="view-details-button" onClick={() => navigate(`/provider/${provider._id}`)}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProviderList;