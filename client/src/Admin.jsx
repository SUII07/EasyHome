import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaUserTie, FaSignOutAlt } from "react-icons/fa";
import "./Admin.css";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [serviceProviderCount, setServiceProviderCount] = useState(0);
  const [search, setSearch] = useState(""); // Search query
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user counts on component mount
  useEffect(() => {
    fetchUserCounts();
  }, []);

  // Fetch users based on the current path (customers or service providers)
  useEffect(() => {
    const path = location.pathname;
    if (path === "/admin/customers") {
      fetchUsers("customer", search);
    } else if (path === "/admin/serviceproviders") {
      fetchUsers("serviceprovider", search);
    } else {
      setUsers([]);
    }
  }, [location.pathname, search]);

  const fetchUsers = async (role, search) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/admin/getuser?role=${role}&search=${search}`,
        {
          credentials: "include", // Ensure cookies are sent
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserCounts = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/admin/getusercounts", {
        credentials: "include", // Ensure cookies are sent
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setCustomerCount(data.customerCount);
      setServiceProviderCount(data.serviceProviderCount);
    } catch (error) {
      console.error("Error fetching user counts:", error);
    }
  };

  // Delete a user
  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/delete/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user._id !== userId)); // Remove deleted user from the list
        fetchUserCounts(); // Refresh user counts
      }
      console.log(data.message);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await fetch("http://localhost:4000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h2 className="logo">EasyHome</h2>
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
          <h1>Welcome back, Admin</h1>
        </header>

        {location.pathname === "/admin" && (
          <section className="dashboard-overview">
            <div className="overview-card">
              <h3>Total Customers</h3>
              <p>{customerCount}</p>
            </div>
            <div className="overview-card">
              <h3>Service Providers</h3>
              <p>{serviceProviderCount}</p>
            </div>
          </section>
        )}

        {(location.pathname === "/admin/customers" || location.pathname === "/admin/serviceproviders") && (
          <section className="user-list">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name"
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <table className="user-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Zip Code</th>
                  {location.pathname === "/admin/serviceproviders" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.FullName}</td>
                      <td>{user.Email}</td>
                      <td>{user.PhoneNumber}</td>
                      <td>{user.ZipCode}</td>
                      {location.pathname === "/admin/serviceproviders" && (
                        <td>
                          <button onClick={() => handleDelete(user._id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={location.pathname === "/admin/serviceproviders" ? 5 : 4}>
                      No {location.pathname === "/admin/customers" ? "customers" : "service providers"} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;