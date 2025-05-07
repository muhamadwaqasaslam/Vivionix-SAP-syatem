import React, { useState } from "react";
import "./LoginPage.css";
import backgroundImage from "./image.png";
import logo from "./logo.png";
import { useNavigate } from "react-router-dom";
import { login } from "./utils/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const data = await login(email, password);
      
      // Store both access and refresh tokens
      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        
        // Store user data
        const userData = {
          employee_id: data.employee_id,
          employee_name: data.employee_name,
          email: data.email,
          role: data.role,
          department: data.department
        };
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Redirect to home page
        navigate("/home");
      } else {
        throw new Error("No tokens received from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Background Image */}
      <div className="background-container">
        <div
          className="login-image"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="Login-form-container">
        <div className="Login-logo">
          <img src={logo} alt="Logo" className="logo" />
          <h3 className="company-Name">Vivionix</h3>
        </div>
        <div className="login-form">
          <h3>Welcome back!</h3>
          <h4>Please sign in to continue with Vivionix.</h4>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="info@vivionix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button 
              className="login-submit-button" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="aonther-site">
            <a href="/forget-password">Forgot password?</a>
            <p className="create-account">
              Don't have an account? <a href="/sign-up">Create an Account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;