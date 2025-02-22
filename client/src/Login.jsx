// import React, { useState } from "react";
// import { Link } from "react-router-dom"; 
// import axios from "axios"; 
// import { post } from "./services/ApiEndpoint";
// import {toast} from "react-hot-toast";
// import "./Login.css";

// export default function Login() {
//   const [Email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     console.log(Email, password);
  
//     try {
//       const response = await axios.post("http://localhost:4000/api/auth/login", { Email, password });
//       console.log(response.data);
  
//       if (response.status === 200) {
//         toast.success(response.data.message || "Login successful!");
//       }
//     } catch (error) {
//       console.error(error);
//       setError("Login failed. Please check your credentials.");
//       toast.error("Login failed. Please check your credentials.");
//     }
//   };
  

//   return (
//     <div className="main-container">
//       <div className="frame">
//         <h1 className="welcome-back">Welcome Back!</h1>
//         <p className="login-message">Please login to EasyHome</p>

//         {error && <p className="error-message">{error}</p>}

//         <form onSubmit={handleLogin}>
//           <label htmlFor="email" className="input-label">Email Address</label>
//           <div className="input-box">
//             <input
//               id="email"
//               type="email"
//               placeholder="Enter your email"
//               className="input-field"
//               value={Email} // Updated variable name
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <label htmlFor="password" className="input-label">Password</label>
//           <div className="input-box">
//             <input
//               id="password"
//               type="password"
//               placeholder="Enter your password"
//               className="input-field"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <button type="submit" className="login-button">Log in</button>
//         </form>

//         <div className="signup-message">
//           <p>
//             Don’t have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import { post } from "./services/ApiEndpoint";
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
      const response = await axios.post("http://localhost:4000/api/auth/login", { Email, password });
  
      if (response.status === 200) {
        toast.success(response.data.message || "Login successful!");
        const user = response.data.user;
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'serviceprovider') {
          navigate('/serviceprovider');
        } else {
          navigate('/home');
        }
      }
    } catch (error) {
      console.error(error);
      setError("Login failed. Please check your credentials.");
      toast.error("Login failed. Please check your credentials.");
    }
  };
  

  return (
    <div className="main-container">
      <div className="frame">
        <h1 className="welcome-back">Welcome Back!</h1>
        <p className="login-message">Please login to EasyHome</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <label htmlFor="email" className="input-label">Email Address</label>
          <div className="input-box">
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

          <label htmlFor="password" className="input-label">Password</label>
          <div className="input-box">
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
