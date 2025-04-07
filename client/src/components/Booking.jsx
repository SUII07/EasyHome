import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import ServiceProviderCard from "./ServiceProviderCard";
import "./Booking.css";
import { useNavigate } from "react-router-dom";

const Booking = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    serviceType: "house cleaning",
    description: "",
    preferredDate: "",
    zipCode: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!formData.preferredDate) {
      newErrors.preferredDate = "Preferred date is required";
    } else if (new Date(formData.preferredDate) < new Date()) {
      newErrors.preferredDate = "Please select a future date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleGetPrice = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        toast.error('Please login to book a service');
        navigate('/login');
        return;
      }

      if (user.role !== 'customer') {
        toast.error('Only customers can book services');
        return;
      }

      const zipCode = formData.address.split(',').pop().trim();
      const response = await axios.post(
        "http://localhost:4000/api/booking/getProviders",
        {
          serviceType: formData.serviceType,
          zipCode
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.success && response.data.providers.length > 0) {
        setProviders(response.data.providers);
        toast.success(`Found ${response.data.providers.length} providers in your area`);
      } else {
        toast.error(response.data?.message || "No service providers found for the selected service in your area");
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch service providers. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    { value: "house cleaning", label: "House Cleaning" },
    { value: "electrician", label: "Electrician" },
    { value: "painting", label: "Painting" },
    { value: "plumbing", label: "Plumbing" },
    { value: "hvac services", label: "HVAC Services" }
  ];

  return (
    <div className="booking-container">
      <div className="booking-form-section">
        <h2>Book a Service</h2>
        <form onSubmit={handleGetPrice} className="booking-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? "error" : ""}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your complete address"
              className={errors.address ? "error" : ""}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={errors.phoneNumber ? "error" : ""}
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label>Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="service-select"
            >
              {services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Preferred Date</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={errors.preferredDate ? "error" : ""}
            />
            {errors.preferredDate && <span className="error-message">{errors.preferredDate}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your service requirements in detail"
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Finding Providers...' : 'Get Price'}
          </button>
        </form>
      </div>

      {providers.length > 0 && (
        <div className="providers-section">
          <h2>Available Service Providers</h2>
          <div className="providers-grid">
            {providers.map(provider => (
              <ServiceProviderCard key={provider._id} provider={provider} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking; 