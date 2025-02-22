import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import Register from './Register';  
import Home from './Home';
import Admin from './Admin';
import ServiceProvider from './ServiceProvider'; 
import Emergency from './emergency';
import Plumbing from './plumbing';

function App() {
  return (
    <Router>
      <Toaster /> 
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />  
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/serviceprovider" element={<ServiceProvider />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/plumbing" element={<Plumbing />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

