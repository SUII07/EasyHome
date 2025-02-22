// import React from "react";
// import { Link } from "react-router-dom";
// import { FaHome, FaUsers, FaUserTie, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
// import "./Admin.css";

// const Admin = () => {
//   return (
//     <div className="admin-dashboard">
//       {/* Sidebar */}
//       <aside className="sidebar">
//         <h2 className="logo">EasyHome</h2>
//         <nav>
//           <ul>
//             <li className="nav-item">
//               <Link to="/dashboard" className="nav-link">
//                 <FaHome className="icon" />
//                 Dashboard
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link to="/service-provider" className="nav-link">
//                 <FaUserTie className="icon" />
//                 Service Provider
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link to="/customers" className="nav-link">
//                 <FaUsers className="icon" />
//                 Customers
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link to="/messages" className="nav-link">
//                 <FaEnvelope className="icon" />
//                 Messages
//               </Link>
//             </li>
//           </ul>
//         </nav>
//         <div className="logout">
//           <Link to="/logout" className="nav-link">
//             <FaSignOutAlt className="icon" />
//             Logout
//           </Link>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="main-content">
//         <header className="header">
//           <h1>Welcome back, Admin</h1>
//         </header>

//         {/* Dashboard Overview */}
//         <section className="dashboard-overview">
//           <div className="overview-card">Total Customer</div>
//           <div className="overview-card">Service Provider</div>
//           <div className="overview-card">Messages</div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default Admin;



import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaHome, FaUsers, FaUserTie, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import "./Admin.css";

const Admin = () => {
  const [customers, setCustomers] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/admin/getuser"); // Adjust API route as needed
        setCustomers(response.data.customers);
        setServiceProviders(response.data.serviceProviders);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.post(`/api/admin/delet/${id}`);
      setServiceProviders(serviceProviders.filter((provider) => provider._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">EasyHome</h2>
        <nav>
          <ul>
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                <FaHome className="icon" />
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/service-provider" className="nav-link">
                <FaUserTie className="icon" />
                Service Provider
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/customers" className="nav-link">
                <FaUsers className="icon" />
                Customers
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/messages" className="nav-link">
                <FaEnvelope className="icon" />
                Messages
              </Link>
            </li>
          </ul>
        </nav>
        <div className="logout">
          <Link to="/logout" className="nav-link">
            <FaSignOutAlt className="icon" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>Welcome back, Admin</h1>
        </header>

        {/* Customers Table */}
        <section>
          <h2>Registered Customers</h2>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Zip Code</th>
              </tr>
            </thead>
            <tbody>
  {customers?.length > 0 ? (
    customers.map((customer) => (
      <tr key={customer._id}>
            <td>{customer.FullName}</td>
            <td>{customer.Email}</td>
            <td>{customer.PhoneNumber}</td>
            <td>{customer.ZipCode}</td>
        </tr>
        ) )
          ) : (
            <tr>
              <td colSpan="4">No customers found</td>
              </tr>
            )}
          </tbody>
          </table>
        </section>

        {/* Service Providers Table */}
        <section>
          <h2>Registered Service Providers</h2>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Zip Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
            {serviceProviders?.length > 0 ? (
            serviceProviders.map((provider) => (
            <tr key={provider._id}>
            <td>{provider.FullName}</td>
            <td>{provider.Email}</td>
            <td>{provider.PhoneNumber}</td>
            <td>{provider.ZipCode}</td>
              <td>
            <button onClick={() => handleDelete(provider._id)} className="delete-btn">
             Delete
              </button>
            </td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No service providers found</td>
            </tr>
            )}
          </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Admin;