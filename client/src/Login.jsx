import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        { Email, password },
        { withCredentials: true }
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="background-container">
      <div className="login-frame">
        <h1 className="welcome-back">Welcome Back!</h1>
        <p className="login-message">Please login to EasyHome</p>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
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
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="forget-password">
            <Link to="" className="forget-password-link">Forgot Password?</Link>
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="signup-message">
          <p>
            Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}