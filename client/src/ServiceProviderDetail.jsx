import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHistory, FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes, FaTools, FaStar, FaCheckCircle } from "react-icons/fa";
import "./ServiceProviderDetail.css";

const ServiceProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProvider, setEditedProvider] = useState({
    FullName: "",
    Email: "",
    PhoneNumber: "",
    ZipCode: "",
    serviceType: "",
    isVerified: false,
    status: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviderDetails();
  }, [id]);

  const fetchProviderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:4000/api/admin/serviceproviders/${id}`,
        { withCredentials: true }
      );
      console.log("API Response:", response.data); // Log the response
      if (response.data && response.data.provider) {
        setProvider(response.data.provider);
        setEditedProvider(response.data.provider); // Initialize editedProvider with fetched data
      } else {
        setError("Provider data not found");
        toast.error("Provider data not found");
      }
    } catch (error) {
      console.error("Error fetching provider details:", error.response || error);
      setError(error.response?.data?.message || "Failed to fetch provider details");
      toast.error(error.response?.data?.message || "Failed to fetch provider details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/admin/serviceproviders/${id}`,
        editedProvider,
        { withCredentials: true }
      );
      if (response.data && response.data.provider) {
        setProvider(response.data.provider);
        setIsEditing(false);
        toast.success("Service provider details updated successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating provider:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to update provider details");
    }
  };

  const handleCancel = () => {
    setEditedProvider(provider); // Reset editedProvider to the original provider data
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this service provider?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:4000/api/admin/serviceproviders/${id}`,
        { withCredentials: true }
      );
      toast.success("Service provider deleted successfully");
      navigate("/admin/serviceproviders");
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast.error(error.response?.data?.message || "Failed to delete provider");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProvider((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading provider details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="back-button" onClick={() => navigate("/admin/serviceproviders")}>
          <FaArrowLeft /> Back to Service Providers
        </button>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="error-container">
        <p className="error-message">Provider not found</p>
        <button className="back-button" onClick={() => navigate("/admin/serviceproviders")}>
          <FaArrowLeft /> Back to Service Providers
        </button>
      </div>
    );
  }

  return (
    <div className="provider-detail-container">
      <div className="header">
        <button className="back-button" onClick={() => navigate("/admin/serviceproviders")}>
          <FaArrowLeft /> Back to Service Providers
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
                <FaEdit /> Edit Provider
              </button>
              <button className="delete-button" onClick={handleDelete}>
                <FaTrash /> Delete Provider
              </button>
            </>
          )}
        </div>
      </div>

      <div className="provider-profile">
        <div className="profile-header">
          <div className="avatar">
            <FaUser />
          </div>
          <div className="profile-info">
            <h2>
              {isEditing ? (
                <input
                  type="text"
                  name="FullName"
                  value={editedProvider.FullName || ""}
                  onChange={handleChange}
                  className="edit-input"
                />
              ) : (
                provider.FullName || "Unnamed Provider"
              )}
            </h2>
            <p className="provider-id">ID: {provider._id || "N/A"}</p>
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
                    value={editedProvider.Email || ""}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.Email || "N/A"}</p>
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
                    value={editedProvider.PhoneNumber || ""}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.PhoneNumber || "N/A"}</p>
                )}
              </div>
            </div>

            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon" />
              <div className="detail-content">
                <label>Zip Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ZipCode"
                    value={editedProvider.ZipCode || ""}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.ZipCode || "N/A"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Service Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <FaTools className="detail-icon" />
              <div className="detail-content">
                <label>Service Type</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="serviceType"
                    value={editedProvider.serviceType || ""}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.serviceType || "N/A"}</p>
                )}
              </div>
            </div>

            <div className="detail-item">
              <FaStar className="detail-icon" />
              <div className="detail-content">
                <label>Rating</label>
                <p>{provider.Rating || "No ratings yet"}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaCheckCircle className="detail-icon" />
              <div className="detail-content">
                <label>Verification Status</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={editedProvider.verificationStatus || ""}
                    onChange={handleChange}
                    className="edit-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                ) : (
                  <p className={`status ${provider.verificationStatus?.toLowerCase() || 'pending'}`}>
                    {provider.verificationStatus === 'approved' ? 'Approved' : provider.verificationStatus || 'Pending'}
                  </p>
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
                <p>{provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaUser className="detail-icon" />
              <div className="detail-content">
                <label>Account Status</label>
                <span className={`status-badge ${provider.status || "active"}`}>
                  {provider.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDetail;