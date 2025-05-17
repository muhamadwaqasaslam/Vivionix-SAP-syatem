import 'bootstrap/dist/css/bootstrap.min.css';
import 'remixicon/fonts/remixicon.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import EmployeeRegistration from './components/registration/EmployeeRegistrationForm';
import EmployeeTable from './components/Table/EmployeeTable';
import CustomerRegistration from './components/registration/CustomerRegistrationForm';
import CustomerTable from './components/Table/CustomerTable';
import ProductRegistration from './components/registration/ProductRegistrationForm';
import ProductTable from './components/Table/ProductTable';
import VendorRegistration from './components/registration/VendorRegistrationForm';
import VendorTable from './components/Table/VendorTable';
import LoginPage from './LoginPage';
import SignUpPage from './SignUp';
import ForgetPassword from './Forgetpassword';

// Store Module Components
import StockList from './components/Table/StockList';
import StockLedger from './components/Table/StockLedger';
import CreateDC from './components/registration/CreateDC';
import ListOfDC from './components/Table/ListOfDC';
import PendingApprovals from './components/Table/PendingApprovals';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Route for the Sign Up Page */}
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* Route for the Forgot Password Page */}
        <Route path="/forget-password" element={<ForgetPassword />} />

        <Route path="/home" element={<HomePage />}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<Home />} />
          <Route path="employee-registration" element={<EmployeeRegistration />} />
          <Route path="employee-table" element={<EmployeeTable />} />
          <Route path="customer-registration" element={<CustomerRegistration />} />
          <Route path="customer-table" element={<CustomerTable />} />
          <Route path="product-registration" element={<ProductRegistration />} />
          <Route path="product-table" element={<ProductTable />} />
          <Route path="vendor-registration" element={<VendorRegistration />} />
          <Route path="vendor-table" element={<VendorTable />} />
          
          {/* Store Module Routes */}
          <Route path="stock-list" element={<StockList />} />
          <Route path="stock-ledger" element={<StockLedger />} />
          <Route path="create-dc" element={<CreateDC />} />
          <Route path="list-of-dc" element={<ListOfDC />} />
          <Route path="pending-approvals" element={<PendingApprovals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
