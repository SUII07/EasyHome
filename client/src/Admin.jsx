import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaUserTie, FaSignOutAlt, FaSearch, FaTrash, FaUserCircle, FaChartBar, FaBell, FaCog, FaEdit, FaCheck, FaTimes, FaTools, FaMapMarkerAlt, FaPhone, FaRegClock, FaDollarSign, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./Admin.css";
import axios from "axios";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [serviceProviderCount, setServiceProviderCount] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adminName, setAdminName] = useState(""); // State to store admin's name
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch admin's name from localStorage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "admin") {
      setAdminName(user.FullName);
    }
  }, []);

  useEffect(() => {
    fetchUserCounts();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/admin/customers") {
      fetchUsers("customer", "");
    } else if (path === "/admin/serviceproviders") {
      fetchUsers("serviceprovider", "");
    } else {
      setUsers([]);
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkAdminAuth = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token || user.role !== 'admin') {
        toast.error('Access denied. Only administrators can access this page.');
        navigate('/login');
        return false;
      }
      return true;
    };

    if (checkAdminAuth()) {
      fetchPendingProviders();
    }
  }, [navigate]);

  const fetchUsers = async (role, search) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Log the request parameters for debugging
      console.log('Fetching users with params:', { role, search, sortBy, page });

      const response = await axios.get(
        `http://localhost:4000/api/admin/getuser`,
        {
          params: {
            role,
            search: search || '',
            sortBy,
            page
          },
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API Response:', response.data);

      if (response.data) {
        setUsers(response.data.users || []);
        setTotalPages(Math.ceil((response.data.total || 0) / (response.data.limit || 10)));
      } else {
        console.error('No data received from API');
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching users:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to fetch users. Please try again.");
      setUsers([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch("http://localhost:4000/api/admin/getusercounts", {
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setCustomerCount(data.customerCount);
      setServiceProviderCount(data.serviceProviderCount);
    } catch (error) {
      console.error("Error fetching user counts:", error);
      toast.error(error.message || "Failed to fetch user counts. Please try again.");
    }
  };

  const fetchPendingProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Fetching users with params:', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const response = await axios.get(
        'http://localhost:4000/api/admin/pending-providers',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setPendingProviders(response.data.providers);
      } else {
        throw new Error(response.data.message || 'Failed to fetch pending providers');
      }
    } catch (error) {
      console.error('Error fetching pending providers:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (error.response?.status === 403) {
        toast.error('Access denied. Only administrators can access this resource.');
        navigate('/login');
        return;
      }

      setError(error.message || 'Failed to fetch pending providers');
      toast.error(error.message || 'Failed to fetch pending providers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId, role) => {
    if (role === "customer") {
      navigate(`/admin/customers/${userId}`);
    } else if (role === "serviceprovider") {
      navigate(`/admin/serviceproviders/${userId}`);
    }
  };

  const handleDelete = async (userId, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:4000/api/admin/delete/${userId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success(`${role} deleted successfully`);
        fetchUsers(role, search);
        fetchUserCounts();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1); // Reset to first page when searching

    // Clear the previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout to trigger the search after 500ms of no typing
    const timeout = setTimeout(() => {
      const path = location.pathname;
      if (path === "/admin/customers") {
        fetchUsers("customer", value);
      } else if (path === "/admin/serviceproviders") {
        fetchUsers("serviceprovider", value);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    setPage(1); // Reset to first page when changing sort

    // Immediately fetch with new sort
    const path = location.pathname;
    if (path === "/admin/customers") {
      fetchUsers("customer", search);
    } else if (path === "/admin/serviceproviders") {
      fetchUsers("serviceprovider", search);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const getCurrentPageTitle = () => {
    switch (location.pathname) {
      case "/admin":
        return "Dashboard Overview";
      case "/admin/customers":
        return "Customer Management";
      case "/admin/serviceproviders":
        return "Service Provider Management";
      case "/admin/analytics":
        return "Analytics Dashboard";
      default:
        return "Admin Dashboard";
    }
  };

  const renderUserList = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className="loading-cell">
            Loading...
          </td>
        </tr>
      );
    }

    if (!users.length) {
      return (
        <tr>
          <td colSpan={6} className="no-data">
            No {location.pathname === "/admin/customers" ? "customers" : "service providers"} found.
          </td>
        </tr>
      );
    }

    return users.map((user) => (
      <tr key={user._id}>
        <td>
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <div>
              <p className="user-name">{user.FullName}</p>
              <p className="user-email">{user.Email}</p>
              <p className="user-role">{user.role === 'serviceprovider' ? 'Service Provider' : 'Customer'}</p>
            </div>
          </div>
        </td>
        <td>{user.PhoneNumber}</td>
        <td>{user.Address}</td>
        <td>
          <span className={`status ${user.verificationStatus?.toLowerCase() || 'active'}`}>
            {user.verificationStatus || 'Active'}
          </span>
        </td>
        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <div className="action-buttons">
            <button 
              onClick={() => handleEdit(user._id, location.pathname.includes("customers") ? "customer" : "serviceprovider")}
              className="edit-button"
              title="Edit User"
            >
              <FaEdit />
            </button>
            <button 
              onClick={() => handleDelete(user._id, location.pathname.includes("customers") ? "customer" : "serviceprovider")}
              className="delete-button"
              title="Delete User"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const handleApprove = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.patch(
        `http://localhost:4000/api/admin/approve-provider/${providerId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Service provider approved successfully');
        fetchPendingProviders(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to approve provider');
      }
    } catch (error) {
      console.error('Error approving provider:', error);
      toast.error(error.message || 'Failed to approve provider');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleReject = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(
        `http://localhost:4000/api/admin/reject-provider/${providerId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Service provider rejected');
        fetchPendingProviders(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to reject provider');
      }
    } catch (error) {
      console.error('Error rejecting provider:', error);
      toast.error(error.message || 'Failed to reject provider');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleViewDetails = (providerId) => {
    navigate(`/admin/serviceprovider/${providerId}`);
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
  };

  const handleNavigation = (path) => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      navigate(path);
      setIsPageTransitioning(false);
    }, 300);
  };

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = 'http://localhost:4000/api/admin/analytics';
      if (dateRange.startDate && dateRange.endDate) {
        url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    }
  };

  useEffect(() => {
    if (location.pathname === "/admin/analytics") {
      fetchAnalyticsData();
    }
  }, [location.pathname, dateRange]);

  const renderAnalyticsChart = () => {
    if (!analyticsData) return <div className="loading-analytics">Loading analytics...</div>;

    const data = {
      labels: ['Customers', 'Service Providers'],
      datasets: [
        {
          label: ' ',  // Empty label
          data: [
            analyticsData.totalCustomers,
            analyticsData.totalServiceProviders
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hide the legend since we don't need it
        },
        title: {
          display: true,
          text: 'EasyHome User Statistics',
          font: {
            size: 20,
            family: "'Segoe UI', sans-serif",
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 30
          }
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 14,
              weight: '500'
            }
          }
        }
      }
    };

    return (
      <div className="analytics-container">
        <div className="chart-container">
          <Bar data={data} options={options} />
        </div>
        <div className="analytics-cards">
          <div className="analytics-card">
            <FaUsers className="card-icon" />
            <h3>Total Customers</h3>
            <p>{analyticsData.totalCustomers}</p>
          </div>
          <div className="analytics-card">
            <FaUserTie className="card-icon" />
            <h3>Service Providers</h3>
            <p>{analyticsData.totalServiceProviders}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">
          {error}
          <button onClick={fetchPendingProviders} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${isPageTransitioning ? 'page-transition' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">EasyHome</h2>
          <p className="admin-role">Administrator</p>
        </div>
        <nav>
          <ul>
            <li className="nav-item">
              <button 
                onClick={() => handleNavigation("/admin")} 
                className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
              >
                <FaHome className="icon" />
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={() => handleNavigation("/admin/customers")} 
                className={`nav-link ${location.pathname === "/admin/customers" ? "active" : ""}`}
              >
                <FaUsers className="icon" />
                Customers
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={() => handleNavigation("/admin/serviceproviders")} 
                className={`nav-link ${location.pathname === "/admin/serviceproviders" ? "active" : ""}`}
              >
                <FaUserTie className="icon" />
                Service Providers
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={() => handleNavigation("/admin/analytics")} 
                className={`nav-link ${location.pathname === "/admin/analytics" ? "active" : ""}`}
              >
                <FaChartBar className="icon" />
                Analytics
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
        <header className="header">
          <div className="header-left">
            <h1>{getCurrentPageTitle()}</h1>
          </div>
          <div className="header-right">
            <div className="profile" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
              <FaUserCircle className="profile-icon" />
              <span>{adminName || 'Admin'}</span>
            </div>
          </div>
        </header>

        {location.pathname === "/admin" && (
          <section className="dashboard-overview">
            <div className="overview-card">
              <div className="card-icon">
                <FaUsers />
              </div>
              <div className="card-content">
                <h3>Total Customers</h3>
                <p className="count">{customerCount}</p>
                <span className="trend positive">+12% this month</span>
              </div>
            </div>
            <div className="overview-card">
              <div className="card-icon">
                <FaUserTie />
              </div>
              <div className="card-content">
                <h3>Service Providers</h3>
                <p className="count">{serviceProviderCount}</p>
                <span className="trend positive">+8% this month</span>
              </div>
            </div>
          </section>
        )}

        {location.pathname === "/admin" && (
          <section className="pending-providers-section">
            <h2>Pending Service Provider Requests</h2>
            {pendingProviders.length > 0 ? (
              <div className="pending-providers-grid">
                {pendingProviders.map((provider) => (
                  <div key={provider._id} className="pending-provider-card">
                    <h3 className="provider-name">{provider.fullName}</h3>
                    <div className="info-item">
                      <FaTools className="icon" />
                      <span className="info-value">
                        <span className="service-type-badge">{provider.serviceType}</span>
                      </span>
                    </div>
                    <div className="info-item">
                      <FaMapMarkerAlt className="icon" />
                      <span className="info-value">{provider.address || "Kathmandu"}</span>
                    </div>
                    <div className="info-item">
                      <FaPhone className="icon" />
                      <span className="info-value">{provider.phoneNumber}</span>
                    </div>
                    <div className="info-item">
                      <FaRegClock className="icon" />
                      <span className="info-value">
                        {new Date(provider.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="info-item">
                      <FaDollarSign className="icon" />
                      <span className="info-value price-value">${provider.price}/hr</span>
                    </div>
                    {provider.verificationDocument && (
                      <div className="document-section">
                        <a 
                          href={provider.verificationDocument.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-document-button"
                        >
                          View Document
                        </a>
                        <p className="document-info">
                          {provider.verificationDocument.originalName}
                        </p>
                      </div>
                    )}
                    <div className="provider-actions">
                      <button
                        className="approve-button"
                        onClick={() => handleApprove(provider._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => handleReject(provider._id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No pending service provider requests</p>
            )}
          </section>
        )}

        {location.pathname === "/admin/analytics" && (
          <section className="analytics-section">
            <h2>Analytics Overview</h2>
            {renderAnalyticsChart()}
          </section>
        )}

        {(location.pathname === "/admin/customers" || location.pathname === "/admin/serviceproviders") && (
          <section className="user-list">
            <div className="list-header">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="filters">
                <select value={sortBy} onChange={handleSortChange}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone Number</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renderUserList()}
                </tbody>
              </table>
            </div>

            {users.length > 0 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="page-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="page-button"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {isLoading && (
        <div className="loading-spinner">
          Loading...
        </div>
      )}
    </div>
  );
};

export default Admin;