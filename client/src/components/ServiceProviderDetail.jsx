import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHistory, FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes, FaTools, FaStar, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import "./ServiceProviderDetail.css";

const ServiceProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProvider, setEditedProvider] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    serviceType: "",
    isVerified: false,
    status: "",
    price: "",
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
        `http://localhost:4000/api/serviceprovider/details/${id}`,
        { withCredentials: true }
      );
      console.log("API Response:", response.data); // Log the response
      if (response.data && response.data.provider) {
        const provider = response.data.provider;
        // Normalize the provider data to use consistent field names
        const normalizedProvider = {
          ...provider,
          fullName: provider.fullName || provider.FullName,
          email: provider.email || provider.Email,
          phoneNumber: provider.phoneNumber || provider.PhoneNumber,
          address: provider.address || provider.Address,
          price: provider.price || provider.Price,
          serviceType: provider.serviceType || provider.ServiceType,
          verificationStatus: provider.verificationStatus || provider.VerificationStatus || "pending"
        };
        setProvider(normalizedProvider);
        setEditedProvider(normalizedProvider);
        console.log("Normalized provider data:", normalizedProvider);
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
      // Validation rules
      const phoneRegex = /^\d{10}$/;
      const nameRegex = /^[a-zA-Z\s]+$/;
      const emailRegex = /@gmail\.com$/;

      // Validate phone number
      if (!phoneRegex.test(editedProvider.phoneNumber)) {
        toast.error('Phone number must be exactly 10 digits');
        return;
      }

      // Validate name
      if (!nameRegex.test(editedProvider.fullName)) {
        toast.error('Name must contain only letters and spaces');
        return;
      }

      // Validate email
      if (!emailRegex.test(editedProvider.email)) {
        toast.error('Email must be a valid Gmail address');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update provider details');
        return;
      }

      // Create update payload with consistent field names
      const updatePayload = {
        fullName: editedProvider.fullName,
        email: editedProvider.email,
        phoneNumber: editedProvider.phoneNumber,
        address: editedProvider.address,
        serviceType: editedProvider.serviceType,
        price: editedProvider.price,
        verificationStatus: editedProvider.verificationStatus
      };

      console.log("Sending update payload:", updatePayload);

      const response = await axios.put(
        `http://localhost:4000/api/admin/serviceproviders/${id}`,
        updatePayload,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.provider) {
        // Normalize the response data
        const normalizedProvider = {
          ...response.data.provider,
          fullName: response.data.provider.fullName || response.data.provider.FullName,
          email: response.data.provider.email || response.data.provider.Email,
          phoneNumber: response.data.provider.phoneNumber || response.data.provider.PhoneNumber,
          address: response.data.provider.address || response.data.provider.Address,
          price: response.data.provider.price || response.data.provider.Price,
          serviceType: response.data.provider.serviceType || response.data.provider.ServiceType
        };
        setProvider(normalizedProvider);
        setEditedProvider(normalizedProvider);
        setIsEditing(false);
        toast.success("Service provider details updated successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating provider:", error.response || error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || "Failed to update provider details");
      }
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
      <div className="provider-profile">
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate("/admin/serviceproviders")}>
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
                  <FaEdit /> Edit Provider
                </button>
                <button className="delete-button" onClick={handleDelete}>
                  <FaTrash /> Delete Provider
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-header">
          <div className="avatar">
            {provider.profilePicture?.url ? (
              <img 
                src={provider.profilePicture.url} 
                alt={`${provider.fullName}'s profile`}
                className="profile-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<FaUser className="default-avatar-icon" />';
                }}
              />
            ) : (
              <FaUser className="default-avatar-icon" />
            )}
          </div>
          <div className="profile-info">
            <h2>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={editedProvider.fullName || ""}
                  onChange={handleChange}
                  className="edit-input"
                />
              ) : (
                provider.fullName || "Unnamed Provider"
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
                    name="email"
                    value={editedProvider.email || ""}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.email || "N/A"}</p>
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
                    name="phoneNumber"
                    value={editedProvider.phoneNumber || ""}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.phoneNumber || "N/A"}</p>
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
                    name="address"
                    value={editedProvider.address || ""}
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.address || "N/A"}</p>
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
                <p>{provider.rating || "No ratings yet"}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaCheckCircle className="detail-icon" />
              <div className="detail-content">
                <label>Verification Status</label>
                {isEditing ? (
                  <select
                    name="verificationStatus"
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

            <div className="detail-item">
              <FaStar className="detail-icon" />
              <div className="detail-content">
                <label>Price per Hour</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="price"
                    value={editedProvider.price || ""}
                    onChange={handleChange}
                    className="edit-input"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <p>${provider.price || "N/A"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Certificate</h3>
          <div className="certificate-container">
            {provider.certificate?.url ? (
              <div className="certificate-wrapper">
                <img 
                  src={provider.certificate.url} 
                  alt="Service Provider Certificate" 
                  className="certificate-image"
                  onClick={() => window.open(provider.certificate.url, '_blank')}
                />
                <p className="certificate-caption">Click to view full certificate</p>
              </div>
            ) : (
              <div className="no-certificate">
                <FaFileAlt className="no-certificate-icon" />
                <p>No certificate uploaded</p>
              </div>
            )}
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