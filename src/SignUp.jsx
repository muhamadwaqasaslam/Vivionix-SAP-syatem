import React from "react";
import "./SignUpPage.css";
import backgroundImage from "./image.png"; // Ensure the image file is in the correct location
import logo from "./logo.png"; // Ensure the image file is in the correct location

const SignUpPage = () => {
  return (
    <div className="sign-up-page-container">
      {/* Left Side - Background Image */}
      <div className="sign-up-background-container">
        <div
          className="sign-up-image"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
      </div>

      {/* Right Side - Sign-Up Form */}
      <div className="sign-up-form-container">
        <div className="sign-up-logo">
          <img src={logo} alt="Logo" className="sign-up-logo-img" /> 
          <h3 className="sign-up-company-name">Vivionix</h3>
        </div>
        <div className="sign-up-form">
          <h3>Get Started</h3>
          <h4>It's free to signup and only takes a minute.</h4>
          <form>
          <label>First Name and last Name</label>
          <input type="text" placeholder="Enter your first Name and last Name" />
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
            <button className="sign-up-button" type="submit">Sign Up</button>
          </form>
          <div className="another-option">
            <p className="already-have-account">
              Already have an account? <a href="/">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
