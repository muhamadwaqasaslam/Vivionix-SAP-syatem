import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaUser,
  FaStore,
  FaBox,
  FaChevronDown,
  FaChevronRight,
  FaEnvelope,
  FaBell,
  FaExpand,
  FaEdit,
  FaCogs,
  FaWarehouse
} from "react-icons/fa";

import { AlignLeft, Search } from "lucide-react";
import logo from './logo.png';

import "./HomePage.css";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";

// Registration Forms
import EmployeeRegistration from "./components/registration/EmployeeRegistrationForm";
import CustomerRegistration from "./components/registration/CustomerRegistrationForm";
import ProductRegistration from "./components/registration/ProductRegistrationForm";
import VendorRegistration from "./components/registration/VendorRegistrationForm";

// Tables
import EmployeeTable from './components/Table/EmployeeTable';
import CustomerTable from './components/Table/CustomerTable';
import ProductTable from './components/Table/ProductTable';
import VendorTable from './components/Table/VendorTable';

// Store Components
import StockList from "./components/Table/StockList";
import StockLedger from "./components/Table/StockLedger";
import CreateDC from "./components/registration/CreateDC";
import ListOfDC from "./components/Table/ListOfDC";
import PendingApprovals from "./components/Table/PendingApprovals";

import { logout } from './utils/api';

const HomePage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitial = userData.employee_name ? userData.employee_name.charAt(0).toUpperCase() : '?';

  const toggleDropdown = (dropdown) => {
    setActiveDropdown((prevDropdown) =>
      prevDropdown === dropdown ? null : dropdown
    );
  };

  const handleLogout = () => {
    logout();
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    console.log('Toggle User Dropdown clicked');
    console.log('Current dropdown state:', dropdownOpen);
    setDropdownOpen(!dropdownOpen);
    console.log('New dropdown state will be:', !dropdownOpen);
  };

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log('Click detected outside');
      console.log('Clicked element:', event.target);
      console.log('Is user circle clicked:', event.target.closest('.user-circle'));
      console.log('Is dropdown clicked:', event.target.closest('.session-dropdown'));
      
      if (dropdownOpen && !event.target.closest('.user-circle') && !event.target.closest('.session-dropdown')) {
        console.log('Closing dropdown - clicked outside');
        setDropdownOpen(false);
      }
    };

    console.log('Setting up click outside listener');
    document.addEventListener('click', handleClickOutside);
    return () => {
      console.log('Cleaning up click outside listener');
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Add effect to log dropdown state changes
  useEffect(() => {
    console.log('Dropdown state changed to:', dropdownOpen);
  }, [dropdownOpen]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarVisible((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleViewProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleUpdateProfile = () => {
    setDropdownOpen(false);
    navigate('/update-profile');
  };

  const handleResetPassword = () => {
    setDropdownOpen(false);
    navigate('/reset-password');
  };

  const renderContent = () => {
    switch (selectedItem) {
      case "Home":
        return <Home />;
      case "Dashboard":
        return <Dashboard />;
      case "Employee Registration":
        return <EmployeeRegistration />;
      case "Employee Table":
        return <EmployeeTable />;
      case "Customer Registration":
        return <CustomerRegistration />;
      case "Customer Table":
        return <CustomerTable />;
      case "Product Registration":
        return <ProductRegistration />;
      case "Product Table":
        return <ProductTable />;
      case "Vendor Registration":
        return <VendorRegistration />;
      case "Vendor Table":
        return <VendorTable />;
      case "Stock List":
        return <StockList />;
      case "Stock Ledger":
        return <StockLedger />;
      case "Create DC":
        return <CreateDC />;
      case "List of DC":
        return <ListOfDC />;
      case "Pending Approvals":
        return <PendingApprovals />;
      default:
        return <Dashboard />;
    }
  };

  const handleMenuItemClick = (item) => {
    setSelectedItem(item);
    if (window.innerWidth <= 768) {
      setIsSidebarVisible(false);
    }
  };

  return (
    <div className="homepage-container">
      <div className={`sidebar-overlay ${isSidebarVisible ? 'show' : ''}`} />
      <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${isSidebarVisible ? "show" : ""}`}>
        <div className="sidebar-header">
          <Link to="/home">
            <img src={logo} alt="Vivionix Logo" className="logo" />
            {!isSidebarCollapsed && <h2>Vivionix</h2>}
          </Link>
        </div>

        <div className="sidebar-content">
          {!isSidebarCollapsed && <h4 className="main-items">MAIN</h4>}
          <div
            className="sidebar-item"
            onClick={() => handleMenuItemClick("Home")}
          >
            <Link to="/home/Home" className="sidebar-link">
              <i className="ri-home-2-line"></i>
              {!isSidebarCollapsed && <span className="items">Home</span>}
            </Link>
          </div>

          <div
            className="sidebar-item"
            onClick={() => handleMenuItemClick("Dashboard")}
          >
            <Link to="/home" className="sidebar-link">
              <i className="ri-dashboard-line"></i>
              {!isSidebarCollapsed && <span className="items">Dashboard</span>}
            </Link>
          </div>

          {!isSidebarCollapsed && <h4 className="main-items">REGISTRATION</h4>}
          
          {/* Employee Section */}
          <div className="sidebar-item" onClick={() => toggleDropdown("Employee")}>
            <FaUser size={14} />
            {!isSidebarCollapsed && <span className="items">Employee</span>}
            {!isSidebarCollapsed && (
              <span style={{ marginLeft: "50px" }}>
                {activeDropdown === "Employee" ? (
                  <FaChevronDown className="dropdown-icon" />
                ) : (
                  <FaChevronRight className="dropdown-icon" />
                )}
              </span>
            )}
          </div>
          {activeDropdown === "Employee" && (
            <div className="sidebar-submenu">
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Employee Registration")}>
              <Link to="/home/employee-registration" className="sidebar-link">Employee Registration</Link>              </div>
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Employee Table")}>
                <Link to="/home/employee-table" className="sidebar-link">Employee List</Link>
              </div>
            </div>
          )}

          {/* Vendor Section */}
          <div className="sidebar-item" onClick={() => toggleDropdown("Vendor")}>
            <FaStore size={14} />
            {!isSidebarCollapsed && <span className="items">Vendor</span>}
            {!isSidebarCollapsed && (
              <span style={{ marginLeft: "70px" }}>
                {activeDropdown === "Vendor" ? (
                  <FaChevronDown className="dropdown-icon" />
                ) : (
                  <FaChevronRight className="dropdown-icon" />
                )}
              </span>
            )}
          </div>
          {activeDropdown === "Vendor" && (
            <div className="sidebar-submenu">
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Vendor Registration")}>
                <Link to="/home/vendor-registration" className="sidebar-link">Vendor Registration</Link>
              </div>
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Vendor Table")}>
                <Link to="/home/vendor-table" className="sidebar-link">Vendor List</Link>
              </div>
            </div>
          )}

          {/* Customer Section */}
          <div className="sidebar-item" onClick={() => toggleDropdown("Customer")}>
            <FaUser size={14} />
            {!isSidebarCollapsed && <span className="items">Customer</span>}
            {!isSidebarCollapsed && (
              <span style={{ marginLeft: "52px" }}>
                {activeDropdown === "Customer" ? (
                  <FaChevronDown className="dropdown-icon" />
                ) : (
                  <FaChevronRight className="dropdown-icon" />
                )}
              </span>
            )}
          </div>
          {activeDropdown === "Customer" && (
            <div className="sidebar-submenu">
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Customer Registration")}>
                <Link to="/home/customer-registration" className="sidebar-link">Customer Registration</Link>
              </div>
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Customer Table")}>
                <Link to="/home/customer-table" className="sidebar-link">Customer List</Link>
              </div>
            </div>
          )}

          {/* Product Section */}
          <div className="sidebar-item" onClick={() => toggleDropdown("Product")}>
            <FaBox size={14} />
            {!isSidebarCollapsed && <span className="items">Product</span>}
            {!isSidebarCollapsed && (
              <span style={{ marginLeft: "62px" }}>
                {activeDropdown === "Product" ? (
                  <FaChevronDown className="dropdown-icon" />
                ) : (
                  <FaChevronRight className="dropdown-icon" />
                )}
              </span>
            )}
          </div>
          {activeDropdown === "Product" && (
            <div className="sidebar-submenu">
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Product Registration")}>
                <Link to="/home/product-registration" className="sidebar-link">Product Registration</Link>
              </div>
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Product Table")}>
                <Link to="/home/product-table" className="sidebar-link">Product List</Link>
              </div>
            </div>
          )}

          {/* Store Section */}
          <div className="sidebar-item" onClick={() => toggleDropdown("Store")}>
            <FaWarehouse size={14} />
            {!isSidebarCollapsed && <span className="items">Store</span>}
            {!isSidebarCollapsed && (
              <span style={{ marginLeft: "62px" }}>
                {activeDropdown === "Store" ? (
                  <FaChevronDown className="dropdown-icon" />
                ) : (
                  <FaChevronRight className="dropdown-icon" />
                )}
              </span>
            )}
          </div>
          {activeDropdown === "Store" && (
            <div className="sidebar-submenu">
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Stock List")}>
                <Link to="/home/stock-list" className="sidebar-link">Stock List</Link>
              </div>
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Stock Ledger")}>
                <Link to="/home/stock-ledger" className="sidebar-link">Stock Ledger</Link>
              </div>
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Create DC")}>
                <Link to="/home/create-dc" className="sidebar-link">Create DC</Link>
              </div>
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("List of DC")}>
                <Link to="/home/list-of-dc" className="sidebar-link">List of DC</Link>
              </div>
              <div className="sidebar-subitem" onClick={() => handleMenuItemClick("Pending Approvals")}>
                <Link to="/home/pending-approvals" className="sidebar-link">Pending Approvals</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`main-content ${isSidebarCollapsed ? "collapsed" : ""} ${isSidebarVisible ? "overlay" : ""}`}>
        <nav className={`navbar ${isSidebarCollapsed ? "collapsed" : ""}`}>
          <div className="navbar-left">
            <div className="d-flex align-items-center">
              <button className="leftalign me-2">
                <AlignLeft size={20} onClick={toggleSidebar} />
              </button>
              <img src={logo} alt="Vivionix Logo" className="navbar-logo d-block d-lg-none" />
            </div>

            <div className="main-header-center d-none d-lg-block">
              <input
                className="search-input"
                type="search"
                placeholder="Search for anything..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button className="btn">
                <Search className="d-none d-md-block" />
              </button>
            </div>
          </div>
          <div className="navbar-right">
            {/* Message Icon */}
            <div className="navbar-item">
              <FaEnvelope size={15} />
            </div>

            {/* Notification Icon */}
            <div className="navbar-item">
              <FaBell size={15} />
            </div>

            {/* Theme Toggle */}
            <div className="navbar-item">
              <button className="theme-toggle" onClick={toggleDarkMode}>
                {isDarkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
              </button>
            </div>

            {/* Large Screen Mode */}
            <div className="navbar-item d-none d-md-block" onClick={toggleFullScreen}>
              <FaExpand className="large-screen" size={15} />
            </div>

            {/* User Circle and Dropdown */}
            <div className="user-circle" onClick={toggleUserDropdown}>
              {userInitial}
            </div>

            {dropdownOpen && (
              <div className="session-dropdown">
                <div className="dropdown-item person">
                  <p className="person-name">{userData.employee_name}</p>
                  <p className="designation">{userData.employee_id}</p>
                </div>

                <div className="dropdown-session-item" onClick={handleViewProfile}>
                  <FaUser className="dropdown-session-icon" /> View Profile
                </div>

                <div className="dropdown-session-item" onClick={handleUpdateProfile}>
                  <FaEdit className="dropdown-session-icon" /> Update Profile
                </div>

                <div className="dropdown-session-item" onClick={handleResetPassword}>
                  <FaCogs className="dropdown-session-icon" /> Reset Password
                </div>

                <div className="dropdown-session-item logout" onClick={handleLogout}>
                  <FaSignOutAlt className="dropdown-session-icon" /> 
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        </nav>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HomePage; 