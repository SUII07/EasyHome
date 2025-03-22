import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./BookingForm.css";

const BookingForm = ({ serviceProviderId, serviceType, price }) => {
  const [formData, setFormData] = useState({
    bookingDate: "",
    bookingTime: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    },
    notes: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
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
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/booking/create",
        {
          serviceProviderId,
          serviceType,
          price,
          ...formData
        },
        {
          withCredentials: true
        }
      );

      toast.success("Booking created successfully!");
      // Reset form
      setFormData({
        bookingDate: "",
        bookingTime: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: ""
        },
        notes: ""
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.message || "Error creating booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <h2>Book Service</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="bookingDate">Preferred Date</label>
          <input
            type="date"
            id="bookingDate"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bookingTime">Preferred Time</label>
          <input
            type="time"
            id="bookingTime"
            name="bookingTime"
            value={formData.bookingTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address.street">Street Address</label>
          <input
            type="text"
            id="address.street"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address.city">City</label>
          <input
            type="text"
            id="address.city"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address.state">State</label>
          <input
            type="text"
            id="address.state"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address.zipCode">ZIP Code</label>
          <input
            type="text"
            id="address.zipCode"
            name="address.zipCode"
            value={formData.address.zipCode}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Creating Booking..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm; 