import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
            } else {
              console.log("Service provider not approved");
              toast.error("Your account is not approved yet. Please wait for admin verification.");
              localStorage.removeItem("user");
              localStorage.removeItem("token");
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
        
        // Handle specific error cases
        if (error.response.status === 403) {
          // Handle verification status errors
          toast.error(error.response.data.message);
        } else if (error.response.status === 401) {
          // Handle invalid credentials
          toast.error("Invalid email or password");
        } else {
          toast.error(error.response.data.message || "Login failed. Please check your credentials.");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Unable to connect to server. Please try again later.");
      } else {
        console.error("Error setting up request:", error.message);
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