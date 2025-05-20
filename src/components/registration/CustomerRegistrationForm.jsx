import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import './RegistrationForm.css';

const CustomerRegistrationForm = () => {
  const [customer, setCustomer] = useState({
    customername: "",
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
    customer: ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Customer Name validation
    if (!customer.customername.trim()) {
      errors.customername = 'Customer name is required';
    } else if (customer.customername.length < 2) {
      errors.customername = 'Customer name must be at least 2 characters';
    }

    // Company Email validation
    if (!customer.company_email.trim()) {
      errors.company_email = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.company_email)) {
      errors.company_email = 'Invalid email format';
    }

    // Company Phone Number validation
    if (!customer.company_phone_number.trim()) {
      errors.company_phone_number = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(customer.company_phone_number.replace(/\D/g, ''))) {
      errors.company_phone_number = 'Invalid phone number format';
    }

    // Website validation (optional)
    if (customer.website && !/^https?:\/\/.+/.test(customer.website)) {
      errors.website = 'Invalid website URL';
    }

    // Type validation
    if (!customer.type) {
      errors.type = 'Type is required';
    }

    // Address validation
    if (!customer.address.trim()) {
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

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
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
      setCustomer(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(customer).forEach(key => {
        formData.append(key, customer[key]);
      });
      formData.append('is_customer', true);
      formData.append('representative', JSON.stringify(representative));

      const response = await fetch('https://my.vivionix.com/customers/create/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to register customer');
      }

      setSuccess(true);
      setCustomer({
        customername: "",
        company_email: "",
        type: null,
        website: "",
        company_phone_number: "",
        address: "",
        representatives_name: [],
        productcatalog: null
      });
      setRepresentative({
        name: "",
        designation: "",
        email: "",
        contact_number: "",
        contact_number2: "",
        visitingCard: "",
        registered_by: "",
        customer: ""
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
      <h3 className="registration-heading">Customer Registration</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Customer registered successfully!</div>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Customer Name</Form.Label>
                <Form.Control
                  type="text"
                  name="customername"
                  value={customer.customername}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.customername ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.customername && (
                  <div className="invalid-feedback">{validationErrors.customername}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Email</Form.Label>
                <Form.Control
                  type="email"
                  name="company_email"
                  value={customer.company_email}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.company_email ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.company_email && (
                  <div className="invalid-feedback">{validationErrors.company_email}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="company_phone_number"
                  value={customer.company_phone_number}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.company_phone_number ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.company_phone_number && (
                  <div className="invalid-feedback">{validationErrors.company_phone_number}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">City</Form.Label>
                <Form.Control
                  type="url"
                  name="city"
                  value={customer.city}
                  onChange={handleCustomerChange}
                  className={`form-control form-control-sm ${validationErrors.city ? 'is-invalid' : ''}`}
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
                  className={`form-control form-control-sm search-panel small ${validationErrors.category ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="" className="small">Select Category</option>
                  <option value="private" className="small">Private</option>
                  <option value="public" className="small">Public</option>
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
                  className={`form-control form-control-sm search-panel small ${validationErrors.type ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="" className="small">Select Type</option>
                  <option value="hospital" className="small">Hospital</option>
                  <option value="clinic" className="small">Clinic</option>
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
                  className={`form-control form-control-sm search-panel small ${validationErrors.capacity ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="" className="small">Select Capacity</option>
                  <option value="high-end" className="small">High End</option>
                  <option value="medium" className="small">Medium</option>
                  <option value="low" className="small">Low</option>
                </Form.Select>
                {validationErrors.capacity && (
                  <div className="invalid-feedback">{validationErrors.capacity}</div>
                )}
              </Col>



              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contarct Agreement</Form.Label>
                <Form.Control
                  type="file"
                  name="contract_agreement"
                  onChange={(e) => handleFileChange(e, 'contract_agreement')}
                  className="form-control form-control-sm"
                />
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