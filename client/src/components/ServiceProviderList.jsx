import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaUserCircle, FaPhone, FaDollarSign, FaCalendarAlt, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import './ServiceProviderList.css';

const ServiceProviderList = ({ serviceType }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingDateTime, setBookingDateTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchProviders();
  }, [serviceType]);

  const fetchProviders = async () => {
    try {
      // Encode the service type for the URL
      const encodedServiceType = encodeURIComponent(serviceType.toLowerCase());
      
      console.log('Fetching providers for:', serviceType);
      
      const response = await fetch(`http://localhost:4000/api/serviceprovider/${encodedServiceType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setProviders(data.providers);
        if (data.providers.length === 0) {
          toast.info(`No ${serviceType} providers available at the moment`);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error(error.message || 'Failed to load service providers');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedProvider || !bookingDateTime) {
      toast.error('Please select a provider and booking time');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          serviceProviderId: selectedProvider._id,
          serviceType,
          bookingDateTime,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      toast.success('Booking request sent successfully');
      setSelectedProvider(null);
      setBookingDateTime('');
      setNotes('');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="loading">Loading service providers...</div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="content-wrapper">
        <div className="no-providers">No service providers found for {serviceType}</div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="service-provider-list">
        <div className="service-provider-header">
          <h2>{serviceType} Service Providers</h2>
        </div>
        <div className="main-container">
          <div className="providers-grid">
            {providers.map((provider) => (
              <div
                key={provider._id}
                className={`provider-card ${selectedProvider?._id === provider._id ? 'selected' : ''}`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="provider-header">
                  <div className="provider-avatar">
                    {provider.profilePicture?.url ? (
                      <img src={provider.profilePicture.url} alt={provider.fullName} />
                    ) : (
                      <FaUserCircle />
                    )}
                  </div>
                  <div className="provider-info">
                    <h3>{provider.fullName}</h3>
                    <div className="provider-rating">
                      <FaStar className="icon" />
                      <span>{provider.rating ? `${provider.rating.toFixed(1)} (${provider.totalReviews} reviews)` : 'No ratings'}</span>
                    </div>
                  </div>
                </div>
                <div className="provider-details">
                  <p className="provider-contact">
                    <FaPhone className="icon" />
                    {provider.phoneNumber}
                  </p>
                  <p className="provider-location">
                    <FaMapMarkerAlt className="icon" />
                    {provider.address}
                  </p>
                  <p className="provider-rate">
                    <FaDollarSign className="icon" />
                    ${provider.price}/hour
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedProvider && (
            <div className="booking-form-container">
              <h3>Book {selectedProvider.fullName}</h3>
              <form onSubmit={handleBooking} className="booking-form">
                <div className="form-group">
                  <label htmlFor="bookingDateTime">
                    <FaCalendarAlt className="icon" />
                    Select Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="bookingDateTime"
                    value={bookingDateTime}
                    onChange={(e) => setBookingDateTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Additional Notes (Optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or instructions..."
                  />
                </div>
                <button type="submit" className="submit-booking">
                  Send Booking Request
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderList; 