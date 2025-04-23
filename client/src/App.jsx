// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, createRoutesFromElements } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Admin from "./Admin";
import Emergency from "./emergency";
import ServiceProvider from "./ServiceProvider"; 
import CustomerDetail from "./components/CustomerDetail";
import ServiceProviderDetail from "./components/ServiceProviderDetail";
import ServiceProviderCard from "./components/ServiceProviderCard";
import ProviderList from "./ProviderList";
import CustomerProfile from './CustomerProfile';
import ServiceProviderProfile from "./ServiceProviderProfile";
import MyBookings from './pages/MyBookings';
import Landing from './Landing';
import AdminProfile from './AdminProfile';
import ProviderDetailView from './components/ProviderDetailView';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster />
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<Landing />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* Role-based Dashboard Routes */}
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/serviceprovider" element={<ServiceProvider />} />
        <Route path="/serviceprovider/profile" element={<ServiceProviderProfile />} />
        <Route path="/home" element={<Home />} />

        {/* Feature Routes */}
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/providers" element={<ProviderList />} />
        <Route path="/providers/:serviceType" element={<ProviderList />} />
        <Route path="/provider/:providerId" element={<ProviderDetailView />} />

        {/* Detail Routes */}
        <Route path="/admin/customers/:id" element={<CustomerDetail />} />
        <Route path="/admin/serviceproviders/:id" element={<ServiceProviderDetail />} />
        <Route path="/user/serviceproviders" element={<ServiceProviderCard />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;