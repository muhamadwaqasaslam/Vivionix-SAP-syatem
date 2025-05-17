import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import Select from 'react-select';
import './RegistrationForm.css';

const VendorRegistrationForm = () => {
  const [vendor, setVendor] = useState({
    vendorname: "",
    company_email: "",
    type: null,
    website: "",
    company_phone_number: "",
    address: "",
    representatives_name: [],
    productcatalog: null
  });

  const [representative, setRepresentative] = useState({
    name: "",
    designation: "",
    email: "",
    contact_number: "",
    contact_number2: "",
    visitingCard: "",
    registered_by: "",
    vendor: ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('https://my.vivionix.com/vendors/list_all/');
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }
        const data = await response.json();
        setVendors(data);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const validateForm = () => {
    const errors = {};

    // Vendor Name validation
    if (!vendor.vendorname.trim()) {
      errors.vendorname = 'Vendor name is required';
    } else if (vendor.vendorname.length < 2) {
      errors.vendorname = 'Vendor name must be at least 2 characters';
    }

    // Company Email validation
    if (!vendor.company_email.trim()) {
      errors.company_email = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendor.company_email)) {
      errors.company_email = 'Invalid email format';
    }

    // Company Phone Number validation
    if (!vendor.company_phone_number.trim()) {
      errors.company_phone_number = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(vendor.company_phone_number.replace(/\D/g, ''))) {
      errors.company_phone_number = 'Invalid phone number format';
    }

    // Website validation (optional)
    if (vendor.website && !/^https?:\/\/.+/.test(vendor.website)) {
      errors.website = 'Invalid website URL';
    }

    // Type validation
    if (!vendor.type) {
      errors.type = 'Type is required';
    }

    // Address validation
    if (!vendor.address.trim()) {
      errors.address = 'Address is required';
    }

    // Representative validation
    if (!representative.name.trim()) {
      errors.representative_name = 'Representative name is required';
    }
    if (!representative.email.trim()) {
      errors.representative_email = 'Representative email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representative.email)) {
      errors.representative_email = 'Invalid email format';
    }
    if (!representative.contact_number.trim()) {
      errors.representative_contact = 'Contact number is required';
    } else if (!/^[0-9]{10,15}$/.test(representative.contact_number.replace(/\D/g, ''))) {
      errors.representative_contact = 'Invalid phone number format';
    }
    if (!representative.registered_by.trim()) {
      errors.representative_registered_by = 'Registered by is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendor(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleRepresentativeChange = (e) => {
    const { name, value } = e.target;
    setRepresentative(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (field === 'productcatalog') {
      setVendor(prev => ({
        ...prev,
        [field]: file
      }));
    } else if (field === 'visitingCard') {
      setRepresentative(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  useEffect(() => {
    const getUserInfo = () => {
      try {
        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) {
          const userData = JSON.parse(sessionUser);
          console.log('User data from session:', userData);
          return userData;
        }
  
        const localUser = localStorage.getItem('user');
        if (localUser) {
          const userData = JSON.parse(localUser);
          console.log('User data from local storage:', userData);
          return userData;
        }
  
        return {
          employee_name: 'default_user',
          email: 'default@example.com'
        };
      } catch (error) {
        console.error('Error getting user info:', error);
        return {
          employee_name: 'default_user',
          email: 'default@example.com'
        };
      }
    };
  
    const userInfo = getUserInfo();
  
    // Auto-fill 'registered_by' in representative
    setRepresentative(prev => ({
      ...prev,
      registered_by:  userInfo.employee_id || 'default_user',
    }));
  
    // If you want vendor to be updated too (optional):
    setVendor(prev => ({
      ...prev,
      registered_by: userInfo.employee_id || 'default_user',
    }));
  
  }, []);
  
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
  
    if (!validateForm()) {
      return;
    }
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setError("You're not logged in.");
        return;
      }
  
      // Step 1: Create vendor
      const vendorFormData = new FormData();
  
      Object.keys(vendor).forEach(key => {
        if (key !== "productcatalog") {
          vendorFormData.append(key, vendor[key]);
        }
      });
  
      if (vendor.productcatalog) {
        vendorFormData.append("productcatalog", vendor.productcatalog);
      }
  
      vendorFormData.append("is_vendor", true);
  
      const vendorResponse = await fetch("https://my.vivionix.com/vendors/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: vendorFormData,
      });
  
      if (!vendorResponse.ok) {
        const errorText = await vendorResponse.text();
        throw new Error("Vendor creation failed: " + errorText);
      }
  
      const vendorData = await vendorResponse.json();
      const createdVendorName = vendorData.vendorname;
      // repFormData.append("vendor", vendorData.vendorname); // TEMP FIX

      // Step 2: Create representative linked to vendor
      const repFormData = new FormData();
  
      Object.keys(representative).forEach((key) => {
        if (key !== "visitingCard") {
          repFormData.append(key, representative[key]);
        }
      });
  
      if (representative.visitingCard) {
        repFormData.append("visitingCard", representative.visitingCard);
      }
  
      repFormData.append("vendor", createdVendorName); // link representative to vendor
  
      const repResponse = await fetch("https://my.vivionix.com/vendors/representatives/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: repFormData,
      });
  
      if (!repResponse.ok) {
        const errorText = await repResponse.text();
        throw new Error("Representative creation failed: " + errorText);
      }
  
      // Reset form on success
      setSuccess(true);
      setVendor({
        vendorname: "",
        company_email: "",
        type: null,
        website: "",
        company_phone_number: "",
        address: "",
        representatives_name: [],
        productcatalog: null,
      });
      setRepresentative({
        name: "",
        designation: "",
        email: "",
        contact_number: "",
        contact_number2: "",
        visitingCard: "",
        registered_by: "",
        vendor: "",
      });
      setValidationErrors({});
  
    } catch (err) {
      setError(err.message);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  

  return (
    <div className="registration-container">
      <h3 className="registration-heading">Vendor Registration</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Vendor and representative registered successfully!</div>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Vendor Name</Form.Label>
                <Form.Control
                  type="text"
                  name="vendorname"
                  value={vendor.vendorname}
                  onChange={handleVendorChange}
                  className={`form-control form-control-sm ${validationErrors.vendorname ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.vendorname && (
                  <div className="invalid-feedback">{validationErrors.vendorname}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Email</Form.Label>
                <Form.Control
                  type="email"
                  name="company_email"
                  value={vendor.company_email}
                  onChange={handleVendorChange}
                  className={`form-control form-control-sm ${validationErrors.company_email ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.company_email && (
                  <div className="invalid-feedback">{validationErrors.company_email}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="company_phone_number"
                  value={vendor.company_phone_number}
                  onChange={handleVendorChange}
                  className={`form-control form-control-sm ${validationErrors.company_phone_number ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.company_phone_number && (
                  <div className="invalid-feedback">{validationErrors.company_phone_number}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Website</Form.Label>
                <Form.Control
                  type="url"
                  name="website"
                  value={vendor.website}
                  onChange={handleVendorChange}
                  className={`form-control form-control-sm ${validationErrors.website ? 'is-invalid' : ''}`}
                />
                {validationErrors.website && (
                  <div className="invalid-feedback">{validationErrors.website}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Type</Form.Label>
                <Form.Select
                  name="type"
                  value={vendor.type}
                  onChange={handleVendorChange}
                  className={`form-control form-control-sm search-panel small ${validationErrors.type ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="" className="small">Select Type</option>
                  <option value="supplier" className="small">Supplier</option>
                  <option value="service" className="small">Service Provider</option>
                  <option value="Maufacturer" className="small">Manufacturer</option>
                  <option value="Distributor" className="small">Distributor</option>
                </Form.Select>
                {validationErrors.type && (
                  <div className="invalid-feedback">{validationErrors.type}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Catalog</Form.Label>
                <Form.Control
                  type="file"
                  name="productcatalog"
                  onChange={(e) => handleFileChange(e, 'productcatalog')}
                  className="form-control form-control-sm"
                />
              </Col>

              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  value={vendor.address}
                  onChange={handleVendorChange}
                  className={`form-control form-control-sm ${validationErrors.address ? 'is-invalid' : ''}`}
                  rows="2"
                  required
                />
                {validationErrors.address && (
                  <div className="invalid-feedback">{validationErrors.address}</div>
                )}
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={12}>
                <h5 className="form-section-title">Representative Information</h5>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Representative Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={representative.name}
                  onChange={handleRepresentativeChange}
                  className={`form-control form-control-sm ${validationErrors.representative_name ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.representative_name && (
                  <div className="invalid-feedback">{validationErrors.representative_name}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={representative.designation}
                  onChange={handleRepresentativeChange}
                  className="form-control form-control-sm"
                />
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={representative.email}
                  onChange={handleRepresentativeChange}
                  className={`form-control form-control-sm ${validationErrors.representative_email ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.representative_email && (
                  <div className="invalid-feedback">{validationErrors.representative_email}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_number"
                  value={representative.contact_number}
                  onChange={handleRepresentativeChange}
                  className={`form-control form-control-sm ${validationErrors.representative_contact ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.representative_contact && (
                  <div className="invalid-feedback">{validationErrors.representative_contact}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Alternative Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_number2"
                  value={representative.contact_number2}
                  onChange={handleRepresentativeChange}
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  name="registered_by"
                  value={representative.registered_by}
                  onChange={handleRepresentativeChange}
                  className={`form-control form-control-sm ${validationErrors.representative_registered_by ? 'is-invalid' : ''}`}
                  required
                  disabled
                  readOnly
                />
                {validationErrors.representative_registered_by && (
                  <div className="invalid-feedback">{validationErrors.representative_registered_by}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Visiting Card</Form.Label>
                <Form.Control
                  type="file"
                  name="visitingCard"
                  onChange={(e) => handleFileChange(e, 'visitingCard')}
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={12} className="text-center">
                <Button type="submit" variant="primary" className="btn-primary btn-sm">
                  Register Vendor
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VendorRegistrationForm; 