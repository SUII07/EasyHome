import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Admin.css"; // Reuse the same CSS or create a new one

const ServiceProviderDetail = () => {
  const { id } = useParams(); // Get the service provider ID from the route parameter
  const [serviceProvider, setServiceProvider] = useState(null);
  const navigate = useNavigate();

  // Fetch service provider details
  useEffect(() => {
    const fetchServiceProviderDetail = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/admin/serviceproviders/${id}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setServiceProvider(data.serviceProvider);
      } catch (error) {
        console.error("Error fetching service provider details:", error);
      }
    };

    fetchServiceProviderDetail();
  }, [id]);

  if (!serviceProvider) {
    return <p>Loading...</p>;
  }

  return (
    <main className="main-content">
      <header className="header">
        <h1>Service Provider Details</h1>
        <button onClick={() => navigate("/admin/serviceproviders")} className="back-button">
          Back to Service Providers
        </button>
      </header>
      <section className="user-detail">
        <div className="user-card">
          <h3>{serviceProvider.FullName}</h3>
          <p>Email: {serviceProvider.Email}</p>
          <p>Phone: {serviceProvider.PhoneNumber}</p>
          <p>Zip Code: {serviceProvider.ZipCode}</p>
          <p>Role: {serviceProvider.role}</p>
          <p>Joined: {new Date(serviceProvider.createdAt).toLocaleDateString()}</p>
        </div>
      </section>
    </main>
  );
};

export default ServiceProviderDetail;