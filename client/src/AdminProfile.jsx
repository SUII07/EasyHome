import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaArrowLeft, FaHome, FaUsers, FaUserTie, FaChartBar, FaCog, FaSignOutAlt, FaPencilAlt, FaTrash, FaCamera } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './AdminProfile.css';

const AdminProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [adminData, setAdminData] = useState({
    FullName: '',
    Email: '',
    PhoneNumber: '',
    Address: '',
    profilePicture: {
      url: '',
      public_id: ''
    }
  });
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    PhoneNumber: '',
    Address: '',
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user || user.role !== 'admin') {
          toast.error('Authentication failed. Please login again.');
          navigate('/login');
          return;
        }

        const adminId = user.id;
        
        const response = await axios.get(`http://localhost:4000/api/admin/profile/${adminId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const admin = response.data.admin;
          setAdminData({
            FullName: admin.FullName,
            Email: admin.Email,
            PhoneNumber: admin.PhoneNumber,
            Address: admin.Address,
            profilePicture: admin.profilePicture || { url: '', public_id: '' }
          });
          setFormData({
            FullName: admin.FullName,
            Email: admin.Email,
            PhoneNumber: admin.PhoneNumber,
            Address: admin.Address,
          });

          // Update localStorage with the latest data
          localStorage.setItem('user', JSON.stringify({
            ...user,
            fullName: admin.FullName,
            email: admin.Email,
            PhoneNumber: admin.PhoneNumber,
            Address: admin.Address,
            profilePicture: admin.profilePicture
          }));
        } else {
          throw new Error(response.data.message || 'Failed to fetch admin data');
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        toast.error(error.response?.data?.message || 'Failed to fetch admin data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        `http://localhost:4000/api/admin/profile/${user.id}/upload-picture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        const updatedProfilePicture = response.data.profilePicture;
        
        // Update component state
        setAdminData(prev => ({
          ...prev,
          profilePicture: updatedProfilePicture
        }));
        
        // Update local storage with the new profile picture URL
        const updatedUser = {
          ...user,
          profilePicture: updatedProfilePicture
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Profile picture updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(adminData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        navigate('/login');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      const adminId = user.id;

      // Keep the original email, don't allow it to be changed
      const dataToUpdate = {
        FullName: formData.FullName,
        PhoneNumber: formData.PhoneNumber,
        Address: formData.Address,
        Email: adminData.Email // Keep the original email
      };

      const response = await axios.put(
        `http://localhost:4000/api/admin/profile/${adminId}`,
        dataToUpdate,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedUser = { ...user, ...dataToUpdate };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAdminData(prev => ({
          ...prev,
          ...dataToUpdate
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating admin profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        await axios.delete(`http://localhost:4000/api/admin/profile/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        localStorage.removeItem('user');
        localStorage.removeItem('token');
        toast.success('Account deleted successfully');
        navigate('/login');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">EasyHome</h2>
          <p className="admin-role">Administrator</p>
        </div>
        <nav>
          <ul>
            <li className="nav-item">
              <button onClick={() => navigate("/admin")} className="nav-link">
                <FaHome className="icon" />
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate("/admin/customers")} className="nav-link">
                <FaUsers className="icon" />
                Customers
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate("/admin/serviceproviders")} className="nav-link">
                <FaUserTie className="icon" />
                Service Providers
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <FaChartBar className="icon" />
                Analytics
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <FaCog className="icon" />
                Settings
              </button>
            </li>
          </ul>
        </nav>
        <div className="logout">
          <button onClick={handleLogout} className="nav-link">
            <FaSignOutAlt className="icon" />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Profile</h1>
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={handleEdit}>
                <FaPencilAlt /> Edit Profile
              </button>
              <button className="delete-account-btn" onClick={handleDeleteAccount}>
                <FaTrash /> Delete Account
              </button>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-info-card">
              <div className="profile-image-section">
                <div 
                  className="profile-image-container"
                  onClick={handleProfilePictureClick}
                >
                  {adminData.profilePicture?.url ? (
                    <img 
                      src={adminData.profilePicture.url} 
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
                <h2>{adminData.FullName}</h2>
                <span className="role-tag">Administrator</span>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="edit-form">
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
                      value={adminData.Email}
                      disabled
                      className="disabled-input"
                    />
                    <small className="email-note">Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="PhoneNumber"
                      value={formData.PhoneNumber}
                      onChange={handleInputChange}
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
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="info-group">
                    <span className="info-label">Email</span>
                    <span className="info-value">{adminData.Email}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{adminData.PhoneNumber}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Address</span>
                    <span className="info-value">{adminData.Address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile; 