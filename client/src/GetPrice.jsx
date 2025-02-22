import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GetPrice = () => {
  const [providers, setProviders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/serviceProvider/list");
        setProviders(response.data);
      } catch (error) {
        console.error("Error fetching service providers:", error);
      }
    };
    fetchProviders();
  }, []);

  const handleBook = (providerId) => {
    alert("Service booked successfully!");
    navigate("/"); // Redirect to home after booking
  };

  const handleCancel = () => {
    navigate("/"); // Redirect to home if canceled
  };

  return (
    <div>
      <h2>Available Service Providers</h2>
      <ul>
        {providers.map((provider) => (
          <li key={provider._id}>
            {provider.name} - Estimated Price: ${provider.price}
            <button onClick={() => handleBook(provider._id)}>Book</button>
          </li>
        ))}
      </ul>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};

export default GetPrice;
