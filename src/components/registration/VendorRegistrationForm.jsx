import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './RegistrationForm.css';
import api from '../../utils/api';

const VendorRegistrationForm = () => {
  const [vendor, setVendor] = useState({
    vendorname: "",
    company_email: "",
    type: [],
    website: "",
    company_phone_number: "",
    address: "",
    representatives_name: [],
    productcatalog: null,
    iso: null,
    registered_by: ""
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
  const [validationErrors, setValidationErrors] = useState({});
  const [registeredByName, setRegisteredByName] = useState("");

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
      setVendor(prev => ({ ...prev, registered_by: userInfo.employee_id }));
      setRepresentative(prev => ({ ...prev, registered_by: userInfo.employee_id }));
    } else if (userInfo.id) {
      setVendor(prev => ({ ...prev, registered_by: userInfo.id }));
      setRepresentative(prev => ({ ...prev, registered_by: userInfo.id }));
    }
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
    if (!vendor.type || vendor.type.length === 0) {
      errors.type = 'At least one type is required';
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

  const handleTypeChange = (selectedOptions) => {
    setVendor(prev => ({
      ...prev,
      type: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
    if (validationErrors.type) {
      setValidationErrors(prev => ({
        ...prev,
        type: null
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

  const handlePhoneChange = (value) => {
    setVendor(prev => ({
      ...prev,
      company_phone_number: value
    }));
    if (validationErrors.company_phone_number) {
      setValidationErrors(prev => ({
        ...prev,
        company_phone_number: ''
      }));
    }
  };

  const handleRepresentativePhoneChange = (value) => {
    setRepresentative(prev => ({
      ...prev,
      contact_number: value
    }));
    if (validationErrors.representative_contact) {
      setValidationErrors(prev => ({
        ...prev,
        representative_contact: ''
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
      // Create the request body
      const requestBody = {
        vendorname: vendor.vendorname,
        company_email: vendor.company_email,
        type: vendor.type,
        website: vendor.website,
        company_phone_number: vendor.company_phone_number,
        address: vendor.address,
        registered_by: vendor.registered_by,
        representatives_name: [{
          name: representative.name,
          designation: representative.designation,
          email: representative.email,
          contact_number: representative.contact_number,
          contact_number2: representative.contact_number2,
          visitingCard: representative.visitingCard,
          registered_by: vendor.registered_by
        }],
        productcatalog: vendor.productcatalog,
        iso: vendor.iso
      };

      // Create FormData for file uploads
      const formData = new FormData();
      
      // Append all non-file fields
      Object.keys(requestBody).forEach(key => {
        if (key === 'representatives_name') {
          formData.append(key, JSON.stringify(requestBody[key]));
        } else if (key === 'type') {
          // Handle type array - append each type separately with exact casing
          requestBody[key].forEach(type => {
            formData.append('type', type);
          });
        } else if (key !== 'productcatalog' && key !== 'iso') {
          formData.append(key, requestBody[key]);
        }
      });

      // Append files if they exist
      if (vendor.productcatalog) {
        formData.append('productcatalog', vendor.productcatalog);
      }
      if (vendor.iso) {
        formData.append('iso', vendor.iso);
      }
      if (representative.visitingCard) {
        formData.append('visitingCard', representative.visitingCard);
      }

      const response = await api.post('/vendors/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        // Reset form on success
        setSuccess(true);
        setVendor({
          vendorname: "",
          company_email: "",
          type: [],
          website: "",
          company_phone_number: "",
          address: "",
          representatives_name: [],
          productcatalog: null,
          iso: null,
          registered_by: ""
        });
        setRepresentative({
          name: "",
          designation: "",
          email: "",
          contact_number: "",
          contact_number2: "",
          visitingCard: "",
          registered_by: ""
        });
        setValidationErrors({});
      }

    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create vendor');
    }
  };
  
  

  return (
    <div className="registration-container">
      <Card>
        <Card.Header className="registration-header">
          <h2 className="registration-title">Vendor Registration</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Vendor and representative registered successfully!</Alert>}
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

              <Col md={6} className="mb-3">
                <Form.Label>Company Phone Number</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={vendor.company_phone_number}
                  onChange={handlePhoneChange}
                  inputClass={`form-control ${validationErrors.company_phone_number ? 'is-invalid' : ''}`}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'company_phone_number',
                  }}
                />
                {validationErrors.company_phone_number && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.company_phone_number}
                  </div>
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
                <Select
                  isMulti
                  name="type"
                  value={vendor.type.map(type => ({ value: type, label: type }))}
                  onChange={handleTypeChange}
                  options={[
                    { value: 'Manufacturer', label: 'Manufacturer' },
                    { value: 'Importer', label: 'Importer' },
                    { value: 'Distributor', label: 'Distributor' }
                  ]}
                  className={`${validationErrors.type ? 'is-invalid' : ''}`}
                  classNamePrefix="select"
                  placeholder="Select Type(s)"
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      fontSize: '0.875rem',
                      padding: '4px 8px'
                    }),
                    menu: (provided) => ({
                      ...provided,
                      fontSize: '0.875rem'
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      fontSize: '0.875rem'
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      fontSize: '0.875rem',
                      padding: '2px 6px'
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      padding: '2px 6px'
                    }),
                    control: (provided) => ({
                      ...provided,
                      minHeight: '31px',
                      fontSize: '0.875rem'
                    }),
                    valueContainer: (provided) => ({
                      ...provided,
                      padding: '0 8px'
                    })
                  }}
                />
                {validationErrors.type && (
                  <div className="invalid-feedback">{validationErrors.type}</div>
                )}
              </Col>

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
                <Form.Label className="form-label small">Product Catalog</Form.Label>
                <Form.Control
                  type="file"
                  name="productcatalog"
                  onChange={(e) => handleFileChange(e, 'productcatalog')}
                  className="form-control form-control-sm"
                />
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">ISO</Form.Label>
                <Form.Control
                  type="file"
                  name="iso"
                  onChange={(e) => handleFileChange(e, 'iso')}
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
                <PhoneInput
                  country={'pk'}
                  value={representative.contact_number}
                  onChange={handleRepresentativePhoneChange}
                  inputClass={`form-control ${validationErrors.representative_contact ? 'is-invalid' : ''}`}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number',
                  }}
                />
                {validationErrors.representative_contact && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.representative_contact}
                  </div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Alternative Contact Number</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={representative.contact_number2}
                  onChange={(value) => setRepresentative(prev => ({
                    ...prev,
                    contact_number2: value
                  }))}
                  inputClass="form-control"
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number2',
                  }}
                />
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