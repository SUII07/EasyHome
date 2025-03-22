import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './BookingModal.css';

const BookingModal = ({ provider, onClose }) => {
  const [formData, setFormData] = useState({
    bookingDate: '',
    bookingTime: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    notes: '',
    price: provider.price
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Booking date is required';
    } else if (new Date(formData.bookingDate) < new Date()) {
      newErrors.bookingDate = 'Please select a future date';
    }
    if (!formData.bookingTime) {
      newErrors.bookingTime = 'Booking time is required';
    }
    if (!formData.address.street) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.address.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.address.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.address.zipCode) {
      newErrors.zipCode = 'Zip code is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:4000/api/booking/create',
        {
          serviceProviderId: provider._id,
          serviceType: provider.serviceType,
          bookingDate: formData.bookingDate,
          bookingTime: formData.bookingTime,
          address: formData.address,
          price: formData.price,
          notes: formData.notes,
          status: 'pending'
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Booking request sent successfully! Waiting for provider confirmation.');
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to create booking request');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Book Service with {provider.FullName}</h2>
        <p className="service-type">{provider.serviceType}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaCalendarAlt className="input-icon" />
              Preferred Date
            </label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={errors.bookingDate ? 'error' : ''}
            />
            {errors.bookingDate && <span className="error-message">{errors.bookingDate}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaClock className="input-icon" />
              Preferred Time
            </label>
            <input
              type="time"
              name="bookingTime"
              value={formData.bookingTime}
              onChange={handleChange}
              className={errors.bookingTime ? 'error' : ''}
            />
            {errors.bookingTime && <span className="error-message">{errors.bookingTime}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaMapMarkerAlt className="input-icon" />
              Street Address
            </label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className={errors.street ? 'error' : ''}
            />
            {errors.street && <span className="error-message">{errors.street}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className={errors.state ? 'error' : ''}
              />
              {errors.state && <span className="error-message">{errors.state}</span>}
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                className={errors.zipCode ? 'error' : ''}
              />
              {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>
              <FaDollarSign className="input-icon" />
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min={provider.price * 0.9}
              max={provider.price * 1.1}
              step="0.01"
            />
            <span className="price-range">
              Range: ${(provider.price * 0.9).toFixed(2)} - ${(provider.price * 1.1).toFixed(2)}
            </span>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Any specific requirements or details..."
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Sending Request...' : 'Send Booking Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 