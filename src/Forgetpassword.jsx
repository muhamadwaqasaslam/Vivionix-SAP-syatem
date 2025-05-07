import React from "react";
import "./ForgetPassword.css";
import backgroundImage from "./forgotbackground.png"; // Ensure the image file is in the correct location
import logo from "./logo.png"; // Ensure the image file is in the correct location

const ForgetPassword = () => {
  return (
    <div className="forget-password-container">
      {/* Left Side - Background Image */}
      <div className="forget-password-background">
        <div
          className="forget-password-image"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
      </div>

      {/* Right Side - Forget Password Form */}
      <div className="forget-password-form-container">
        <div className="forget-password-logo">
          <img src={logo} alt="Logo" className="logo" /> 
          <h3 className="company-Name">Vivionix</h3>
        </div>
        <div className="forget-password-form">
          <h3>Forgot Password!</h3>
          <h5>Please Enter Your Email</h5>
          <form>
            <label>Email</label>
            <input type="email" placeholder="info@vivionix.com" />
            <button className="reset-button" type="submit">send</button>
          </form>
          <div className="password-options">
            <p>Forget it,<a href="/">Send me back </a>to the sign in screen.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
