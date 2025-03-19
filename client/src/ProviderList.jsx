// components/ProviderList.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ProviderList = () => {
  const location = useLocation();
  const { providers, formData } = location.state;
  const navigate = useNavigate();
  const [customerPrice, setCustomerPrice] = useState("");

  const handleBook = async (provider) => {
    try {
      const bookingData = {
        ...formData,
        serviceProviderName: provider.FullName,
        price: provider.price,
        customerPrice,
      };
      await axios.post("http://localhost:4000/api/booking/create", bookingData);
      navigate("/home");
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  return (
    <div>
      <h2>Available Service Providers</h2>
      {providers.map((provider) => (
        <div key={provider._id}>
          <h3>{provider.FullName}</h3>
          <p>Estimated Price: ${provider.price}</p>
          <input
            type="number"
            placeholder="Your Fair Price"
            value={customerPrice}
            onChange={(e) => setCustomerPrice(e.target.value)}
          />
          <button onClick={() => handleBook(provider)}>Book</button>
          <button onClick={() => navigate("/home")}>Cancel</button>
        </div>
      ))}
    </div>
  );
};

export default ProviderList;