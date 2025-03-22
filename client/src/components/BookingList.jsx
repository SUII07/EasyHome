import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaTools, FaDollarSign } from "react-icons/fa";
import "./BookingList.css";

const BookingList = ({ userRole }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [userRole]);

  const fetchBookings = async () => {
    try {
      const endpoint = userRole === "customer" 
        ? "http://localhost:4000/api/booking/customer"
        : "http://localhost:4000/api/booking/provider";

      const response = await axios.get(endpoint, {
        withCredentials: true
      });

      setBookings(response.data.bookings);
      setError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to fetch bookings");
      toast.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/booking/${bookingId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Booking ${newStatus} successfully`);
        fetchBookings(); // Refresh the bookings list
      } else {
        toast.error(response.data.message || "Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(error.response?.data?.message || "Failed to update booking status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ffa500";
      case "confirmed":
        return "#4a90e2";
      case "completed":
        return "#28a745";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  if (isLoading) {
    return <div className="loading">Loading bookings...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="booking-list-container">
      <h2>{userRole === "customer" ? "My Bookings" : "Service Requests"}</h2>
      
      {bookings.length === 0 ? (
        <p className="no-bookings">No bookings found</p>
      ) : (
        <div className="booking-grid">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="service-info">
                  <FaTools className="service-icon" />
                  <h3>{booking.serviceType}</h3>
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <FaUser className="detail-icon" />
                  <span>
                    {userRole === "customer" 
                      ? booking.serviceProviderId.FullName 
                      : booking.customerId.FullName}
                  </span>
                </div>

                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                </div>

                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <span>{booking.bookingTime}</span>
                </div>

                <div className="detail-item">
                  <FaMapMarkerAlt className="detail-icon" />
                  <span>
                    {`${booking.address.street}, ${booking.address.city}, ${booking.address.state} ${booking.address.zipCode}`}
                  </span>
                </div>

                <div className="detail-item">
                  <FaDollarSign className="detail-icon" />
                  <span>${booking.price}</span>
                </div>

                {booking.notes && (
                  <div className="notes">
                    <p><strong>Notes:</strong> {booking.notes}</p>
                  </div>
                )}
              </div>

              <div className="booking-actions">
                {userRole === "serviceprovider" && booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                      className="confirm-button"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                      className="cancel-button"
                    >
                      Decline
                    </button>
                  </>
                )}

                {userRole === "serviceprovider" && booking.status === "confirmed" && (
                  <button
                    onClick={() => handleStatusUpdate(booking._id, "completed")}
                    className="complete-button"
                  >
                    Mark as Completed
                  </button>
                )}

                {userRole === "customer" && booking.status === "confirmed" && (
                  <button
                    onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                    className="cancel-button"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList; 