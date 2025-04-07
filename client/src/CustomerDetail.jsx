import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHistory, FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import "./CustomerDetail.css";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view customer details');
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `http://localhost:4000/api/admin/customers/${id}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCustomer(response.data.customer);
      setEditedCustomer(response.data.customer);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error("Failed to fetch customer details");
        navigate("/admin/customers");
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update customer details');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `http://localhost:4000/api/admin/customers/${id}`,
        editedCustomer,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCustomer(response.data.customer);
      setIsEditing(false);
      toast.success("Customer details updated successfully");
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || "Failed to update customer details");
      }
    }
  };

  const handleCancel = () => {
    setEditedCustomer(customer);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to delete customer');
        navigate('/login');
        return;
      }

      await axios.delete(
        `http://localhost:4000/api/admin/customers/${id}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success("Customer deleted successfully");
      navigate("/admin/customers");
    } catch (error) {
      console.error("Error deleting customer:", error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || "Failed to delete customer");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customer details...</p>
      </div>
    );
  }

  return (
    <div className="customer-detail-container">
      <div className="customer-profile">
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate("/admin/customers")}>
            <FaArrowLeft />
          </button>
          <div className="header-actions">
            {isEditing ? (
              <>
                <button className="save-button" onClick={handleSave}>
                  <FaSave /> Save Changes
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  <FaTimes /> Cancel
                </button>
              </>
            ) : (
              <>
                <button className="edit-button" onClick={handleEdit}>
                  <FaEdit /> Edit Customer
                </button>
                <button className="delete-button" onClick={handleDelete}>
                  <FaTrash /> Delete Customer
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-header">
          <div className="avatar">
            <FaUser />
          </div>
          <div className="profile-info">
            <h2>{isEditing ? (
              <input
                type="text"
                name="FullName"
                value={editedCustomer.FullName}
                onChange={handleChange}
                className="edit-input"
              />
            ) : customer.FullName}</h2>
            <p className="customer-id">ID: {customer._id}</p>
          </div>
        </div>

        <div className="detail-section">
          <h3>Contact Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <FaEnvelope className="detail-icon" />
              <div className="detail-content">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="Email"
                    value={editedCustomer.Email}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{customer.Email}</p>
                )}
              </div>
            </div>

            <div className="detail-item">
              <FaPhone className="detail-icon" />
              <div className="detail-content">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="PhoneNumber"
                    value={editedCustomer.PhoneNumber}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{customer.PhoneNumber}</p>
                )}
              </div>
            </div>

            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon" />
              <div className="detail-content">
                <label>Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="Address"
                    value={editedCustomer.Address}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{customer.Address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Account Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <FaHistory className="detail-icon" />
              <div className="detail-content">
                <label>Member Since</label>
                <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaUser className="detail-icon" />
              <div className="detail-content">
                <label>Account Status</label>
                <span className={`status-badge ${customer.status || 'active'}`}>
                  {customer.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;