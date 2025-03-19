// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Admin from "./Admin";
import Emergency from "./emergency";
import Booking from "./Booking";
import ServiceProvider from "./ServiceProvider"; 
import CustomerDetail from "./CustomerDetail"; 
import ServiceProviderDetail from "./ServiceProviderDetail"; 
import ProviderList from "./ProviderList"; // Add this line

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/serviceprovider" element={<ServiceProvider />} /> 
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/Booking" element={<Booking />} />
        <Route path="/providers" element={<ProviderList />} /> {/* Add this line */}
        <Route path="/admin/customers/:id" element={<CustomerDetail />} /> 
        <Route path="/admin/serviceproviders/:id" element={<ServiceProviderDetail />} /> 
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;