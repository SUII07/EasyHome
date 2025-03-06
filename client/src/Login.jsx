import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Login.css";

export default function Login() {
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        { Email, password },
        { withCredentials: true } // Include this option
      );
  
      if (response.status === 200) {
        toast.success(response.data.message || "Login successful!");
  
        const user = response.data.user;
  
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "serviceprovider") {
          navigate("/serviceprovider");
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      console.error(error);
  
      if (error.response) {
        setError(error.response.data.message || "Login failed. Please check your credentials.");
        toast.error(error.response.data.message || "Login failed. Please check your credentials.");
      } else {
        setError("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="background-container">
      <div className="login-frame">
        <h1 className="welcome-back">Welcome Back!</h1>
        <p className="login-message">Please login to EasyHome</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <label htmlFor="email" className="input-label">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="input-field"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className="input-label">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="forget-password">
            <Link to="" className="forget-password-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-button">Log in</button>
        </form>

        <div className="signup-message">
          <p>
            Don’t have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}