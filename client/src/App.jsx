// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ServiceProviderCard from "./components/ServiceProviderCard";
import ProviderList from "./ProviderList";
<<<<<<< HEAD
import CustomerProfile from './CustomerProfile';
=======
>>>>>>> bac57379d8024ffd9c5f0dc786aa7042a3207979

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/" element={<Login />} />

        {/* Role-based Dashboard Routes */}
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/serviceprovider" element={<ServiceProvider />} />
        <Route path="/home" element={<Home />} />

        {/* Feature Routes */}
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/providers" element={<ProviderList />} />

        {/* Detail Routes */}
        <Route path="/admin/customers/:id" element={<CustomerDetail />} />
        <Route path="/admin/serviceproviders/:id" element={<ServiceProviderDetail />} />
        <Route path="/user/serviceproviders" element={<ServiceProviderCard />} />
<<<<<<< HEAD
        <Route path="/profile" element={<CustomerProfile />} />
=======
>>>>>>> bac57379d8024ffd9c5f0dc786aa7042a3207979
      </Routes>
    </BrowserRouter>
  );
}

export default App;