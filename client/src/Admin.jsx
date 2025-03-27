import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaUserTie, FaSignOutAlt, FaSearch, FaTrash, FaUserCircle, FaChartBar, FaBell, FaCog, FaEdit, FaCheck, FaTimes, FaTools, FaMapMarkerAlt, FaPhone, FaRegClock, FaDollarSign } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./Admin.css";
import axios from "axios";

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
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTimeout, setSearchTimeout] = useState(null);

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
    fetchPendingProviders();
  }, []);

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
      setIsLoadingProviders(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!user || user.role !== 'admin') {
        throw new Error('User is not authorized');
      }

      const response = await axios.get("http://localhost:4000/api/admin/pending-providers", {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.providers) {
        setPendingProviders(response.data.providers);
      } else {
        setPendingProviders([]);
      }
    } catch (error) {
      console.error("Error fetching pending providers:", error);
      toast.error(error.message || "Failed to fetch pending providers");
      setPendingProviders([]);
    } finally {
      setIsLoadingProviders(false);
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

  const handleApproveProvider = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.patch(
        `http://localhost:4000/api/admin/approve-provider/${providerId}`,
        {},
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success("Service provider approved successfully");
      fetchPendingProviders();
    } catch (error) {
      console.error("Error approving provider:", error);
      toast.error(error.response?.data?.message || "Failed to approve provider");
    }
  };

  const handleRejectProvider = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.patch(
        `http://localhost:4000/api/admin/reject-provider/${providerId}`,
        {},
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success("Service provider rejected successfully");
      fetchPendingProviders();
    } catch (error) {
      console.error("Error rejecting provider:", error);
      toast.error(error.response?.data?.message || "Failed to reject provider");
    }
  };

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
              <button 
                onClick={() => navigate("/admin")} 
                className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
              >
                <FaHome className="icon" />
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={() => navigate("/admin/customers")} 
                className={`nav-link ${location.pathname === "/admin/customers" ? "active" : ""}`}
              >
                <FaUsers className="icon" />
                Customers
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={() => navigate("/admin/serviceproviders")} 
                className={`nav-link ${location.pathname === "/admin/serviceproviders" ? "active" : ""}`}
              >
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
        <header className="header">
          <div className="header-left">
            <h1>{getCurrentPageTitle()}</h1>
          </div>
          <div className="header-right">
            <div className="notifications">
              <FaBell className="icon" />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </div>
            <div className="profile">
              <FaUserCircle className="profile-icon" />
              <span>Admin</span>
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
            {isLoadingProviders ? (
              <div className="loading">Loading pending providers...</div>
            ) : pendingProviders.length > 0 ? (
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
                    <div className="provider-actions">
                      <button
                        className="approve-button"
                        onClick={() => handleApproveProvider(provider._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => handleRejectProvider(provider._id)}
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
    </div>
  );
};

export default Admin;