import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools, FaDollarSign, FaPencilAlt, FaTrash, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './ServiceProvider.css';

export default function ServiceProviderProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [provider, setProvider] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    serviceType: '',
    hourlyRate: '',
    description: ''
  });

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      // Get the user data and token from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      // Log the token for debugging
      console.log('Token:', token);

      const response = await fetch('http://localhost:4000/api/serviceprovider/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched provider data:', data); // Debug log

      if (data && data.success && data.provider) {
        // Normalize the data to ensure consistent case
        const normalizedData = {
          fullName: data.provider.fullName || data.provider.FullName || '',
          email: data.provider.email || data.provider.Email || '',
          phoneNumber: data.provider.phoneNumber || data.provider.PhoneNumber || '',
          address: data.provider.address || data.provider.Address || '',
          serviceType: data.provider.serviceType || data.provider.ServiceType || '',
          hourlyRate: data.provider.price || data.provider.Price || '',
          description: data.provider.description || data.provider.Description || ''
        };

        setProvider(normalizedData);
        setFormData(normalizedData);
      } else {
        throw new Error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      // Convert hourlyRate to price for backend
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        price: Number(formData.hourlyRate), // Convert to number
        serviceType: provider.serviceType // Keep original service type
      };

      const response = await fetch('http://localhost:4000/api/serviceprovider/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedData = await response.json();
      if (updatedData && updatedData.success && updatedData.provider) {
        const normalizedData = {
          fullName: updatedData.provider.fullName || '',
          email: updatedData.provider.email || '',
          phoneNumber: updatedData.provider.phoneNumber || '',
          address: updatedData.provider.address || '',
          serviceType: updatedData.provider.serviceType || '',
          hourlyRate: updatedData.provider.price || '',
          description: updatedData.provider.description || ''
        };
        setProvider(normalizedData);
        setFormData(normalizedData);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login again');
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:4000/api/serviceprovider/profile', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.status === 401) {
          toast.error('Session expired. Please login again');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        localStorage.removeItem('user');
        localStorage.removeItem('token');
        toast.success('Account deleted successfully');
        navigate('/login');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  if (!provider) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <h2>Profile Information</h2>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="profile-info">
            <div className="info-header">
              <div>
                <h3>{provider.fullName}</h3>
                <p className="service-type">{provider.serviceType}</p>
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <>
                    <button className="edit-button" onClick={() => setIsEditing(true)}>
                      <FaPencilAlt /> Edit Profile
                    </button>
                    <button className="delete-button" onClick={handleDelete}>
                      <FaTrash /> Delete Account
                    </button>
                  </>
                ) : (
                  <>
                    <button className="save-button" onClick={handleSave}>
                      <FaSave /> Save Changes
                    </button>
                    <button className="cancel-button" onClick={() => setIsEditing(false)}>
                      <FaTimes /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-header">
                <FaUser className="detail-icon" />
                <label>Full Name</label>
              </div>
              <div className="detail-content">
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.fullName}</p>
                )}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-header">
                <FaEnvelope className="detail-icon" />
                <label>Email</label>
              </div>
              <div className="detail-content">
                <p className="non-editable">{provider.email}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-header">
                <FaPhone className="detail-icon" />
                <label>Phone Number</label>
              </div>
              <div className="detail-content">
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-header">
                <FaMapMarkerAlt className="detail-icon" />
                <label>Address</label>
              </div>
              <div className="detail-content">
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{provider.address}</p>
                )}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-header">
                <FaTools className="detail-icon" />
                <label>Service Type</label>
              </div>
              <div className="detail-content">
                <p className="non-editable service-type-badge">{provider.serviceType}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-header">
                <FaDollarSign className="detail-icon" />
                <label>Hourly Rate</label>
              </div>
              <div className="detail-content">
                {isEditing ? (
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p className="hourly-rate">${provider.hourlyRate}/hr</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 