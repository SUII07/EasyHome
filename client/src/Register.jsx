import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [FullName, setFullName] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [ZipCode, setZipCode] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [Role, setRole] = useState("customer");
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmail(email);
    setShowRoleSelection(!email.includes(".admin@"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Password !== ConfirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const request = await axios.post("http://localhost:4000/api/auth/register", {
        FullName,
        PhoneNumber,
        ZipCode,
        Email,
        password: Password,
        ConfirmPassword,
        role: Role,
      });

      toast.success(request.data.message || "Registration successful!");
      navigate("/login"); 
    } catch (error) {
      if (error.response) {
        console.log("Server Response:", error.response.data);
        toast.error(error.response.data.message || "Registration failed!");
      } else {
        console.log(error);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="background-container">
      <div className="register-user">
        <h1 className="lets-get-started">Let’s Get Started!</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullname" className="input-label">Full Name</label>
          <input
            id="fullname"
            type="text"
            placeholder="Enter your full name"
            className="input-field"
            value={FullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div className="input-group">
            <div className="input-field-half">
              <label htmlFor="phoneNumber" className="input-label">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                className="input-field"
                value={PhoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="input-field-half">
              <label htmlFor="zipCode" className="input-label">Zip Code</label>
              <input
                id="zipCode"
                type="text"
                placeholder="Enter your zip code"
                className="input-field"
                value={ZipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </div>
          </div>

          <label htmlFor="email" className="input-label">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="input-field"
            value={Email}
            onChange={handleEmailChange}
            required
          />

          <label htmlFor="password" className="input-label">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="input-field"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            className="input-field"
            value={ConfirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {showRoleSelection && (
            <>
              <label htmlFor="role" className="input-label">Role</label>
              <select
                id="role"
                className="input-field"
                value={Role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="customer">Customer</option>
                <option value="serviceprovider">Service Provider</option>
              </select>
            </>
          )}

          <button type="submit" className="button">Sign Up</button>
        </form>

        <div className="account-sign-in">
          Already have an account? <Link to="/login" className="sign-in">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;