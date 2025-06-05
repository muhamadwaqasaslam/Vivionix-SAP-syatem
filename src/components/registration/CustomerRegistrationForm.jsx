import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import api from '../../utils/api';
import './RegistrationForm.css';

const CustomerRegistrationForm = () => {
  // Function to get user info from session or local storage
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
        employee_id: null 
      };
    } catch (error) {
      console.error('Error getting user info:', error);

      return {
        employee_name: 'error_user',
        employee_id: null
      };
    }
  };

  const [customer, setCustomer] = useState({
    Companyname: "",
    Companyemail: "",
    type: "",
    category: "",
    capacity: "",
    Company_phone_number: "",
    address: "",
    city: "",
    representative: []
  });

  const [representative, setRepresentative] = useState({
    Contact_person_name: "",
    title: "",
    education: "",
    designation: "",
    qualification: "",
    Contact_person_email: "",
    Contact_person_number: "",
    registered_by: getUserInfo().employee_id || "",
    customer: ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Company Name validation
    if (!customer.Companyname.trim()) {
      errors.Companyname = 'Company name is required';
    }

    // Company Email validation
    if (!customer.Companyemail.trim()) {
      errors.Companyemail = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.Companyemail)) {
      errors.Companyemail = 'Invalid email format';
    }

    // Company Phone Number validation
    if (!customer.Company_phone_number.trim()) {
      errors.Company_phone_number = 'Phone number is required';
    }

    // Category validation
    if (!customer.category) {
      errors.category = 'Category is required';
    }

    // Type validation
    if (!customer.type) {
      errors.type = 'Type is required';
    }

    // Capacity validation
    if (!customer.capacity) {
      errors.capacity = 'Capacity is required';
    }

    // City validation
    if (!customer.city.trim()) {
      errors.city = 'City is required';
    }

    // Address validation
    if (!customer.address.trim()) {
      errors.address = 'Address is required';
    }

    // Representative validations
    if (!representative.Contact_person_name.trim()) {
      errors.Contact_person_name = 'Contact person name is required';
    }
    if (!representative.Contact_person_email.trim()) {
      errors.Contact_person_email = 'Contact person email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representative.Contact_person_email)) {
      errors.Contact_person_email = 'Invalid email format';
    }
    if (!representative.Contact_person_number.trim()) {
      errors.Contact_person_number = 'Contact number is required';
    }
    if (!representative.registered_by.trim()) {
      errors.registered_by = 'Registered by is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
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

  const handleRepresentativeChange = (e) => {
    const { name, value } = e.target;
    setRepresentative(prev => ({
      ...prev,
      [name]: value
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
      const currentUser = getUserInfo();
      // Create the complete data object
      const submitData = {
        Companyname: customer.Companyname,
        Companyemail: customer.Companyemail,
        type: customer.type,
        category: customer.category,
        capacity: customer.capacity,
        Company_phone_number: customer.Company_phone_number,
        address: customer.address,
        city: customer.city,
        registered_by: currentUser.employee_id,
        representative: {
          Contact_person_name: representative.Contact_person_name,
          title: representative.title,
          education: representative.education,
          designation: representative.designation,
          qualification: representative.qualification,
          Contact_person_email: representative.Contact_person_email,
          Contact_person_number: representative.Contact_person_number,
          registered_by: currentUser.employee_id,
          customer_name: customer.Companyname
        }
      };

      console.log('Data being sent:', submitData);

      const response = await api.post('/customers/customer/create/', submitData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        // Reset form
        setCustomer({
          Companyname: "",
          Companyemail: "",
          type: "",
          category: "",
          capacity: "",
          Company_phone_number: "",
          address: "",
          city: "",
          representative: []
        });
        setRepresentative({
          Contact_person_name: "",
          title: "",
          education: "",
          designation: "",
          qualification: "",
          Contact_person_email: "",
          Contact_person_number: "",
          registered_by: currentUser.employee_id || "",
          customer: ""
        });
        setValidationErrors({});
      }
    } catch (err) {
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to register customer');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="registration-container">
      <Card>
        <Card.Header className="registration-header">
          <h2 className="registration-title text-center">Customer Registration</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Customer registered successfully!</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="Companyname"
                  value={customer.Companyname}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.Companyname ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.Companyname && (
                  <div className="invalid-feedback">{validationErrors.Companyname}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Email</Form.Label>
                <Form.Control
                  type="email"
                  name="Companyemail"
                  value={customer.Companyemail}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.Companyemail ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.Companyemail && (
                  <div className="invalid-feedback">{validationErrors.Companyemail}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="Company_phone_number"
                  value={customer.Company_phone_number}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.Company_phone_number ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.Company_phone_number && (
                  <div className="invalid-feedback">{validationErrors.Company_phone_number}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={customer.city}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.city ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.city && (
                  <div className="invalid-feedback">{validationErrors.city}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Category</Form.Label>
                <Form.Select
                  name="category"
                  value={customer.category}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.category ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                </Form.Select>
                {validationErrors.category && (
                  <div className="invalid-feedback">{validationErrors.category}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Type</Form.Label>
                <Form.Select
                  name="type"
                  value={customer.type}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.type ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                </Form.Select>
                {validationErrors.type && (
                  <div className="invalid-feedback">{validationErrors.type}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Capacity</Form.Label>
                <Form.Select
                  name="capacity"
                  value={customer.capacity}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.capacity ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select Capacity</option>
                  <option value="High End">High End</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
                {validationErrors.capacity && (
                  <div className="invalid-feedback">{validationErrors.capacity}</div>
                )}
              </Col>

              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  value={customer.address}
                  onChange={handleCustomerChange}
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
                <h5 className="form-section-title">Contact Person Information</h5>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Person Name</Form.Label>
                <Form.Control
                  type="text"
                  name="Contact_person_name"
                  value={representative.Contact_person_name}
                  onChange={handleRepresentativeChange}
                  className={`form-control form-control-sm ${validationErrors.Contact_person_name ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.Contact_person_name && (
                  <div className="invalid-feedback">{validationErrors.Contact_person_name}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={representative.title}
                  onChange={handleRepresentativeChange}
                  className="form-control form-control-sm"
                />
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Education</Form.Label>
                <Form.Control
                  type="text"
                  name="education"
                  value={representative.education}
                  onChange={handleRepresentativeChange}
                  className="form-control form-control-sm"
                />
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
                <Form.Label className="form-label small">Qualification</Form.Label>
                <Form.Control
                  type="text"
                  name="qualification"
                  value={representative.qualification}
                  onChange={handleRepresentativeChange}
                  className="form-control form-control-sm"
                />
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="Contact_person_email"
                  value={representative.Contact_person_email}
                  onChange={handleRepresentativeChange}
                  className={`form-control form-control-sm ${validationErrors.Contact_person_email ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.Contact_person_email && (
                  <div className="invalid-feedback">{validationErrors.Contact_person_email}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="Contact_person_number"
                  value={representative.Contact_person_number}
                  onChange={handleRepresentativeChange}
                  className={`form-control form-control-sm ${validationErrors.Contact_person_number ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.Contact_person_number && (
                  <div className="invalid-feedback">{validationErrors.Contact_person_number}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  name="registered_by"
                  value={getUserInfo().employee_name}
                  className="form-control form-control-sm"
                  disabled
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={12} className="text-center">
                <Button type="submit" variant="primary" className="btn-primary btn-sm">
                  Register Customer
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerRegistrationForm; 