import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './CustomerProfile.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    PhoneNumber: '',
    ZipCode: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          navigate('/login');
          return;
        }

        // Set initial data from localStorage
        setUser(userData);
        setFormData({
          FullName: userData.FullName || userData.fullName || '',
          Email: userData.Email || userData.email || '',
          PhoneNumber: userData.PhoneNumber || userData.phoneNumber || '',
          ZipCode: userData.ZipCode || userData.zipCode || ''
        });

        // Fetch the latest user data from the server
        const response = await axios.get(
          `http://localhost:4000/api/auth/user/${userData._id}`,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
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
            ZipCode: updatedUserData.ZipCode || updatedUserData.zipCode || ''
          });

          // Update localStorage with the latest data
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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
      const response = await axios.put(
        `http://localhost:4000/api/auth/update/${user._id}`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
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
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:4000/api/auth/delete/${user._id}`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      localStorage.removeItem('user');
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleGoBack = () => {
    navigate(-1); // This will take the user to the previous page
  };

  if (!user) {
    return <div className="profile-container"><div className="profile-card">Loading...</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <button className="back-button" onClick={handleGoBack}>
            <FaArrowLeft /> Back
          </button>
          <h2>My Profile</h2>
        </div>
        <div className="profile-content">
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
                  <label>ZIP Code</label>
                  <p>{user.ZipCode || user.zipCode || 'Not provided'}</p>
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
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="ZipCode"
                  value={formData.ZipCode}
                  onChange={handleInputChange}
                  placeholder="Enter your ZIP code"
                  pattern="[0-9]{5}"
                  title="Please enter a valid 5-digit ZIP code"
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
  );
};

export default CustomerProfile; 