import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", { email, password: "***" });
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      console.log("Login response:", response.data);

      if (response.data.success) {
        const { role, verificationStatus } = response.data.user;
        console.log("Login successful - User role:", role);
        console.log("Login successful - Verification status:", verificationStatus);
        console.log("Full user data:", response.data.user);

        // Store user details in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        console.log("Stored user data in localStorage:", JSON.parse(localStorage.getItem("user")));

        // Handle redirection based on role and verification status
        if (!role) {
          console.error("No role found in user data");
          setError("Invalid user data received");
          toast.error("Login failed: Invalid user data");
          return;
        }

        const userRole = role.toLowerCase();
        console.log("Processing redirection for role:", userRole);
        
        switch (userRole) {
          case "admin":
            console.log("Redirecting to admin dashboard");
            navigate("/admin");
            toast.success("Welcome Admin!");
            break;
          
          case "serviceprovider":
            console.log("Processing service provider redirection");
            if (verificationStatus === "approved") {
              console.log("Service provider approved, redirecting to dashboard");
              navigate("/serviceprovider");
              toast.success("Welcome to your service provider dashboard!");
            } else if (verificationStatus === "pending") {
              console.log("Service provider pending approval");
              setError("Your account is pending admin approval. Please wait for verification.");
              toast.error("Your account is pending admin approval. Please wait for verification.");
              localStorage.removeItem("user");
            } else if (verificationStatus === "rejected") {
              console.log("Service provider rejected");
              setError("Your account has been rejected. Please contact support.");
              toast.error("Your account has been rejected. Please contact support.");
              localStorage.removeItem("user");
            }
            break;
          
          case "customer":
            console.log("Redirecting to customer home");
            navigate("/home");
            toast.success("Welcome!");
            break;
          
          default:
            console.log("Unknown role:", role, "redirecting to home");
            navigate("/home");
            toast.success("Welcome!");
            break;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
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
              value={email}
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