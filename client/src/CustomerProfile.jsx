import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './CustomerProfile.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowLeft, FaCamera } from 'react-icons/fa';
import Header from './components/Header';
import Footer from './components/Footer';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    PhoneNumber: '',
    Address: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!userData || !token) {
          navigate('/login');
          return;
        }

        // Set initial data from localStorage
        setUser(userData);
        setFormData({
          FullName: userData.FullName || userData.fullName || '',
          Email: userData.Email || userData.email || '',
          PhoneNumber: userData.PhoneNumber || userData.phoneNumber || '',
          Address: userData.Address || userData.address || ''
        });

        // Fetch the latest user data from the server
        const response = await axios.get(
          `http://localhost:4000/api/auth/user/${userData._id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data) {
          const updatedUserData = response.data;
          setUser(updatedUserData);
          setFormData({
            FullName: updatedUserData.FullName || updatedUserData.fullName || '',
            Email: updatedUserData.Email || updatedUserData.email || '',
            PhoneNumber: updatedUserData.PhoneNumber || updatedUserData.phoneNumber || '',
            Address: updatedUserData.Address || updatedUserData.address || ''
          });

          // Update localStorage with the latest data
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        // Don't show error toast if we already have user data from localStorage
        if (!user) {
          toast.error('Failed to load latest user data');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `http://localhost:4000/api/auth/update/${user._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      await axios.delete(
        `http://localhost:4000/api/auth/delete/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleGoBack = () => {
    navigate('/home');
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await axios.post(
        `http://localhost:4000/api/customer/profile/upload-picture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));
        
        // Update local storage
        const updatedUser = {
          ...user,
          profilePicture: response.data.profilePicture
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <button className="back-button" onClick={handleGoBack}>
              <FaArrowLeft />
            </button>
            <h2>My Profile</h2>
          </div>
          <div className="profile-content">
            <div className="profile-image-section">
              <div 
                className="profile-image-container"
                onClick={handleProfilePictureClick}
              >
                {user?.profilePicture?.url ? (
                  <img 
                    src={user.profilePicture.url} 
                    alt="Profile" 
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-image">
                    <FaUser className="default-avatar" />
                  </div>
                )}
                <div className="profile-image-overlay">
                  <FaCamera className="camera-icon" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {isUploading && <p className="uploading-text">Uploading...</p>}
            </div>

            {!isEditing ? (
              <div className="profile-info">
                <div className="info-item">
                  <FaUser className="info-icon" />
                  <div>
                    <label>Full Name</label>
                    <p>{user.FullName || user.fullName}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaEnvelope className="info-icon" />
                  <div>
                    <label>Email</label>
                    <p>{user.Email || user.email}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaPhone className="info-icon" />
                  <div>
                    <label>Phone Number</label>
                    <p>{user.PhoneNumber || user.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaMapMarkerAlt className="info-icon" />
                  <div>
                    <label>Address</label>
                    <p>{user.Address || user.address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                  <button className="delete-btn" onClick={handleDelete}>
                    Delete Account
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="FullName"
                    value={formData.FullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="PhoneNumber"
                    value={formData.PhoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit phone number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerProfile; 