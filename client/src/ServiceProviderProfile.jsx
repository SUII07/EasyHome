import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools, FaDollarSign, FaPencilAlt, FaTrash, FaSave, FaTimes, FaArrowLeft, FaFileAlt, FaImage } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
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
  const [profilePicture, setProfilePicture] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewCertificate, setPreviewCertificate] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      // Initialize state with stored user data including images
      const initialData = {
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        serviceType: user.serviceType || '',
        hourlyRate: user.price?.toString() || '0'
      };
      setFormData(initialData);
      setProvider(user);
      
      // Set preview images if they exist in localStorage
      if (user.profilePicture?.url) {
        setPreviewImage(user.profilePicture.url);
      }
      if (user.certificate?.url) {
        setPreviewCertificate(user.certificate.url);
      }
    }
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/serviceprovider/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success && response.data.provider) {
        const providerData = response.data.provider;
        
        // Create normalized data for form
        const normalizedData = {
          fullName: providerData.fullName || '',
          email: providerData.email || '',
          phoneNumber: providerData.phoneNumber || '',
          address: providerData.address || '',
          serviceType: providerData.serviceType || '',
          hourlyRate: providerData.price?.toString() || '0'
        };

        // Update component state
        setProvider(providerData);
        setFormData(normalizedData);

        // Update preview images if they exist in the response
        if (providerData.profilePicture?.url) {
          setPreviewImage(providerData.profilePicture.url);
        }
        if (providerData.certificate?.url) {
          setPreviewCertificate(providerData.certificate.url);
        }

        // Get current user data from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        // Merge new data with existing user data, preserving image data
        const updatedUser = {
          ...currentUser,
          ...providerData,
          // Ensure image data is preserved and updated
          profilePicture: providerData.profilePicture || currentUser.profilePicture,
          certificate: providerData.certificate || currentUser.certificate
        };

        // Update localStorage with merged data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Updated user data in localStorage:', updatedUser);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
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

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      if (type === 'profile') {
        setProfilePicture(file);
        setPreviewImage(URL.createObjectURL(file));
      } else {
        setCertificate(file);
        setPreviewCertificate(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      
      // Append text data
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('price', parseFloat(formData.hourlyRate));

      // Append files if they exist
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
        console.log('Appending profile picture:', profilePicture);
      }
      if (certificate) {
        formDataToSend.append('certificate', certificate);
        console.log('Appending certificate:', certificate);
      }

      console.log('Sending form data:', Object.fromEntries(formDataToSend));

      const response = await axios.put(
        'http://localhost:4000/api/serviceprovider/profile',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data.success) {
        const updatedProvider = response.data.provider;
        
        // Update component state
        setProvider(updatedProvider);
        setFormData({
          ...formData,
          fullName: updatedProvider.fullName,
          email: updatedProvider.email,
          phoneNumber: updatedProvider.phoneNumber,
          address: updatedProvider.address,
          hourlyRate: updatedProvider.price?.toString() || '0'
        });

        // Update preview images if they exist in the response
        if (updatedProvider.profilePicture?.url) {
          setPreviewImage(updatedProvider.profilePicture.url);
        }
        if (updatedProvider.certificate?.url) {
          setPreviewCertificate(updatedProvider.certificate.url);
        }

        // Get current user data and merge with new data
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = {
          ...currentUser,
          ...updatedProvider,
          profilePicture: updatedProvider.profilePicture || currentUser.profilePicture,
          certificate: updatedProvider.certificate || currentUser.certificate
        };

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setIsEditing(false);
        toast.success('Profile updated successfully');

        // Clean up file states
        setProfilePicture(null);
        setCertificate(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
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

        const response = await axios.delete('http://localhost:4000/api/serviceprovider/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          toast.success('Account deleted successfully');
          navigate('/login');
        }
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
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="profile-image" />
            ) : (
              <FaUser />
            )}
            {isEditing && (
              <div className="image-upload">
                <label htmlFor="profilePicture" className="upload-label">
                  <FaImage /> Change Photo
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'profile')}
                  style={{ display: 'none' }}
                />
              </div>
            )}
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
                <label>HOURLY RATE</label>
              </div>
              <div className="detail-content">
                {isEditing ? (
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    className="edit-input"
                    min="0"
                    step="1"
                  />
                ) : (
                  <p className="hourly-rate">{provider?.price || 0}/hr</p>
                )}
              </div>
            </div>

            <div className="detail-item certificate-section">
              <div className="detail-header">
                <FaFileAlt className="detail-icon" />
                <label>Certificate</label>
              </div>
              <div className="detail-content">
                {previewCertificate ? (
                  <div className="certificate-preview">
                    <img src={previewCertificate} alt="Certificate" className="certificate-image" />
                    {isEditing && (
                      <div className="image-upload">
                        <label htmlFor="certificate" className="upload-label">
                          <FaFileAlt /> Change Certificate
                        </label>
                        <input
                          type="file"
                          id="certificate"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 'certificate')}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-certificate">
                    <p>No certificate uploaded</p>
                    {isEditing && (
                      <div className="image-upload">
                        <label htmlFor="certificate" className="upload-label">
                          <FaFileAlt /> Upload Certificate
                        </label>
                        <input
                          type="file"
                          id="certificate"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 'certificate')}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 