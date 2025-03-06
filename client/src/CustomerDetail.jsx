import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Admin.css"; // Reuse the same CSS or create a new one

const CustomerDetail = () => {
  const { id } = useParams(); // Get the customer ID from the route parameter
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  // Fetch customer details
  useEffect(() => {
    const fetchCustomerDetail = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/admin/customers/${id}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCustomer(data.customer);
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };

    fetchCustomerDetail();
  }, [id]);

  if (!customer) {
    return <p>Loading...</p>;
  }

  return (
    <main className="main-content">
      <header className="header">
        <h1>Customer Details</h1>
        <button onClick={() => navigate("/admin/customers")} className="back-button">
          Back to Customers
        </button>
      </header>
      <section className="user-detail">
        <div className="user-card">
          <h3>{customer.FullName}</h3>
          <p>Email: {customer.Email}</p>
          <p>Phone: {customer.PhoneNumber}</p>
          <p>Zip Code: {customer.ZipCode}</p>
          <p>Role: {customer.role}</p>
          <p>Joined: {new Date(customer.createdAt).toLocaleDateString()}</p>
        </div>
      </section>
    </main>
  );
};

export default CustomerDetail;