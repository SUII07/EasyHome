// components/ProviderList.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaStar, FaUser, FaCertificate, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./ProviderList.css";

const ProviderList = () => {
  const location = useLocation();
  const { providers, formData } = location.state;
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [customerPrice, setCustomerPrice] = useState("");
  const [showNegotiation, setShowNegotiation] = useState(false);

  const handleViewDetails = (provider) => {
    setSelectedProvider(provider);
  };

  const handleBook = async (provider) => {
    try {
      const bookingData = {
        ...formData,
        serviceProviderId: provider._id,
        serviceProviderName: provider.FullName,
        price: provider.estimatedPrice,
        customerPrice: customerPrice || provider.estimatedPrice,
        status: customerPrice ? 'in_negotiation' : 'pending'
      };

      const response = await axios.post("http://localhost:4000/api/booking/create", bookingData);
      toast.success("Booking request sent successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.message || "Failed to create booking");
    }
  };

  const toggleNegotiation = (provider) => {
    setSelectedProvider(provider);
    setShowNegotiation(!showNegotiation);
  };

  const renderRating = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < Math.floor(rating) ? "star-filled" : "star-empty"}
      />
    ));
  };

  return (
    <div className="provider-list-container">
      <h2>Available Service Providers</h2>
      <p>Found {providers.length} service providers for {formData.serviceType}</p>
      
      <div className="providers-grid">
        {providers.map((provider) => (
          <div key={provider._id} className="provider-card">
            <div className="provider-header">
              <div className="provider-photo">
                {provider.profilePhoto ? (
                  <img src={provider.profilePhoto} alt={provider.FullName} />
                ) : (
                  <FaUser className="default-photo" />
                )}
              </div>
              <div className="provider-info">
                <h3>{provider.FullName}</h3>
                <div className="rating">
                  {renderRating(provider.rating)}
                  <span>({provider.reviews?.length || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="provider-details">
              <p><FaMapMarkerAlt /> {provider.ZipCode}</p>
              <p><FaPhone /> {provider.PhoneNumber}</p>
              {provider.certificatePhoto && (
                <p>
                  <FaCertificate /> Certified Professional
                  <span className="view-certificate" onClick={() => window.open(provider.certificatePhoto)}>
                    View Certificate
                  </span>
                </p>
              )}
            </div>

            <div className="price-section">
              <h4>Estimated Price: ${provider.estimatedPrice}</h4>
              {showNegotiation && selectedProvider?._id === provider._id && (
                <div className="negotiation-form">
                  <input
                    type="number"
                    placeholder="Enter your price"
                    value={customerPrice}
                    onChange={(e) => setCustomerPrice(e.target.value)}
                    min="0"
                  />
                  <small>Propose your fair price</small>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button 
                className="view-details-btn"
                onClick={() => handleViewDetails(provider)}
              >
                View Details
              </button>
              <button 
                className="negotiate-btn"
                onClick={() => toggleNegotiation(provider)}
              >
                {showNegotiation && selectedProvider?._id === provider._id ? 'Cancel' : 'Negotiate Price'}
              </button>
              <button 
                className="book-btn"
                onClick={() => handleBook(provider)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="back-btn" onClick={() => navigate("/Booking")}>
        Back to Booking
      </button>
    </div>
  );
};

export default ProviderList;