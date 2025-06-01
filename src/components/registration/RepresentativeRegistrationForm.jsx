import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './RegistrationForm.css';
import api from '../../utils/api';

const RepresentativeRegistrationForm = () => {
  const [representative, setRepresentative] = useState({
    name: "",
    designation: "",
    email: "",
    contact_number: "",
    contact_number2: "",
    visitingCard: null,
    registered_by: "",
    vendor: ""
  });

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [registeredByName, setRegisteredByName] = useState("");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await api.get('/vendors/list_all/');
        setVendors(response.data);
        setFilteredVendors(response.data);
      } catch (err) {
        setError('Failed to fetch vendors');
        console.error('Error fetching vendors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    const getUserInfo = () => {
      try {
        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) {
          const userData = JSON.parse(sessionUser);
          return userData;
        }
  
        const localUser = localStorage.getItem('user');
        if (localUser) {
          const userData = JSON.parse(localUser);
          return userData;
        }
  
        return {
          employee_id: 'default_id',
          employee_name: 'default_user',
          email: 'default@example.com'
        };
      } catch (error) {
        console.error('Error getting user info:', error);
        return {
          employee_id: 'default_id',
          employee_name: 'default_user',
          email: 'default@example.com'
        };
      }
    };

    const userInfo = getUserInfo();
    
    if (userInfo.employee_name) {
      setRegisteredByName(userInfo.employee_name);
    } else if (userInfo.name) {
      setRegisteredByName(userInfo.name);
    }

    if (userInfo.employee_id) {
      setRepresentative(prev => ({ ...prev, registered_by: userInfo.employee_id }));
    } else if (userInfo.id) {
      setRepresentative(prev => ({ ...prev, registered_by: userInfo.id }));
    }
  }, []);

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!representative.name.trim()) {
      errors.name = 'Name is required';
    } else if (representative.name.length > 30) {
      errors.name = 'Name must be less than 30 characters';
    }

    // Email validation
    if (representative.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representative.email)) {
      errors.email = 'Invalid email format';
    } else if (representative.email && representative.email.length > 254) {
      errors.email = 'Email must be less than 254 characters';
    }

    // Contact number validation
    if (representative.contact_number && representative.contact_number.length > 15) {
      errors.contact_number = 'Contact number must be less than 15 characters';
    }

    // Contact number 2 validation
    if (representative.contact_number2 && representative.contact_number2.length > 15) {
      errors.contact_number2 = 'Alternative contact number must be less than 15 characters';
    }

    // Designation validation
    if (representative.designation && representative.designation.length > 15) {
      errors.designation = 'Designation must be less than 15 characters';
    }

    // Vendor validation
    if (!representative.vendor) {
      errors.vendor = 'Vendor is required';
    }

    // Registered by validation
    if (!representative.registered_by) {
      errors.registered_by = 'Registered by is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRepresentative(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleVendorSearch = (e) => {
    const searchTerm = e.target.value;
    setVendorSearchTerm(searchTerm);
    
    if (searchTerm.trim() === "") {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter(vendor => 
        vendor.vendorname.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendors(filtered);
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setRepresentative(prev => ({
      ...prev,
      vendor: vendor.vendorname
    }));
    setVendorSearchTerm(vendor.vendorname);
    setFilteredVendors([]);
    if (validationErrors.vendor) {
      setValidationErrors(prev => ({
        ...prev,
        vendor: null
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setRepresentative(prev => ({
      ...prev,
      contact_number: value
    }));
    if (validationErrors.contact_number) {
      setValidationErrors(prev => ({
        ...prev,
        contact_number: null
      }));
    }
  };

  const handlePhoneChange2 = (value) => {
    setRepresentative(prev => ({
      ...prev,
      contact_number2: value
    }));
    if (validationErrors.contact_number2) {
      setValidationErrors(prev => ({
        ...prev,
        contact_number2: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setRepresentative(prev => ({
      ...prev,
      visitingCard: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(representative).forEach(key => {
        if (key === 'visitingCard' && representative[key]) {
          formData.append(key, representative[key]);
        } else if (key !== 'visitingCard') {
          formData.append(key, representative[key]);
        }
      });

      // Log the form data for debugging
      console.log('Form Data:', {
        name: representative.name,
        designation: representative.designation,
        email: representative.email,
        contact_number: representative.contact_number,
        contact_number2: representative.contact_number2,
        vendor: selectedVendor ? selectedVendor.vendorname : representative.vendor,
        registered_by: representative.registered_by
      });

      const response = await api.post('/vendors/representatives/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setSuccess(true);
        // Reset form
        setRepresentative({
          name: "",
          designation: "",
          email: "",
          contact_number: "",
          contact_number2: "",
          visitingCard: null,
          registered_by: representative.registered_by,
          vendor: ""
        });
        setSelectedVendor(null);
        setVendorSearchTerm("");
        setValidationErrors({});
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create representative');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="registration-container">
      <Card>
        <Card.Header className="registration-header">
          <h2 className="registration-title">Representative Registration</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Representative registered successfully!</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={representative.name}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.name ? 'is-invalid' : ''}`}
                  required
                  maxLength={30}
                />
                {validationErrors.name && (
                  <div className="invalid-feedback">{validationErrors.name}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={representative.designation}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.designation ? 'is-invalid' : ''}`}
                  maxLength={15}
                />
                {validationErrors.designation && (
                  <div className="invalid-feedback">{validationErrors.designation}</div>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={representative.email}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.email ? 'is-invalid' : ''}`}
                  maxLength={254}
                />
                {validationErrors.email && (
                  <div className="invalid-feedback">{validationErrors.email}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={representative.contact_number}
                  onChange={handlePhoneChange}
                  inputClass={`form-control ${validationErrors.contact_number ? 'is-invalid' : ''}`}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number',
                    maxLength: 15
                  }}
                />
                {validationErrors.contact_number && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.contact_number}
                  </div>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Alternative Contact</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={representative.contact_number2}
                  onChange={handlePhoneChange2}
                  inputClass={`form-control ${validationErrors.contact_number2 ? 'is-invalid' : ''}`}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number2',
                    maxLength: 15
                  }}
                />
                {validationErrors.contact_number2 && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.contact_number2}
                  </div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Vendor</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={vendorSearchTerm}
                    onChange={handleVendorSearch}
                    placeholder="Search vendor..."
                    className={`form-control form-control-sm ${validationErrors.vendor ? 'is-invalid' : ''}`}
                  />
                  {vendorSearchTerm && filteredVendors.length > 0 && (
                    <div className="vendor-search-results">
                      {filteredVendors.map(vendor => (
                        <div
                          key={vendor.vendor_id}
                          className="vendor-search-item"
                          onClick={() => handleVendorSelect(vendor)}
                        >
                          {vendor.vendorname}
                        </div>
                      ))}
                    </div>
                  )}
                  {validationErrors.vendor && (
                    <div className="invalid-feedback">{validationErrors.vendor}</div>
                  )}
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  name="registered_by"
                  value={registeredByName}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Visiting Card</Form.Label>
                <Form.Control
                  type="file"
                  name="visitingCard"
                  onChange={handleFileChange}
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={12} className="text-center">
                <Button type="submit" variant="primary" className="btn-primary btn-sm">
                  Register Representative
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RepresentativeRegistrationForm; 