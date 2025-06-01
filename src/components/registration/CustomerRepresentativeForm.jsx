import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '../../utils/api';

const CustomerRepresentativeForm = () => {
  const [formData, setFormData] = useState({
    Contact_person_name: '',
    title: '',
    education: '',
    designation: '',
    qualification: '',
    Contact_person_email: '',
    Contact_person_number: '',
    customer: '',
    customer_name: '',
    registered_by: '',
    CV: null
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [registeredByName, setRegisteredByName] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers/customer/list/');
        if (response.data) {
          setCustomers(response.data);
        }
      } catch (err) {
        setError('Failed to fetch customers');
      }
    };

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
      setFormData(prev => ({ ...prev, registered_by: userInfo.employee_id }));
    } else if (userInfo.id) {
      setFormData(prev => ({ ...prev, registered_by: userInfo.id }));
    }

    fetchCustomers();
  }, []);

  const validateForm = () => {
    const errors = {};

    // Contact Person Name validation
    if (!formData.Contact_person_name.trim()) {
      errors.Contact_person_name = 'Contact person name is required';
    } else if (formData.Contact_person_name.length > 15) {
      errors.Contact_person_name = 'Contact person name must be less than 15 characters';
    }

    // Title validation
    if (formData.title && formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    // Education validation
    if (formData.education && formData.education.length > 100) {
      errors.education = 'Education must be less than 100 characters';
    }

    // Designation validation
    if (formData.designation && formData.designation.length > 100) {
      errors.designation = 'Designation must be less than 100 characters';
    }

    // Qualification validation
    if (formData.qualification && formData.qualification.length > 100) {
      errors.qualification = 'Qualification must be less than 100 characters';
    }

    // Email validation
    if (!formData.Contact_person_email) {
      errors.Contact_person_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Contact_person_email)) {
      errors.Contact_person_email = 'Invalid email format';
    } else if (formData.Contact_person_email.length > 254) {
      errors.Contact_person_email = 'Email must be less than 254 characters';
    }

    // Contact Number validation
    if (!formData.Contact_person_number) {
      errors.Contact_person_number = 'Contact number is required';
    } else if (formData.Contact_person_number.length > 15) {
      errors.Contact_person_number = 'Contact number must be less than 15 characters';
    }

    // Customer validation
    if (!formData.customer) {
      errors.customer = 'Customer is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf' && file.type !== 'application/msword' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setError('Please upload a PDF or Word document');
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        CV: file
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
      setLoading(true);
      const submitData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'customer') {
          submitData.append(key, formData.customer_name);
        } else if (key === 'CV' && formData.CV) {
          submitData.append('CV', formData.CV);
        } else {
          submitData.append(key, formData[key]);
        }
      });

      const response = await api.post('/customers/representative/create/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setSuccess(true);
        setFormData({
          Contact_person_name: '',
          title: '',
          education: '',
          designation: '',
          qualification: '',
          Contact_person_email: '',
          Contact_person_number: '',
          customer: '',
          customer_name: '',
          registered_by: formData.registered_by,
          CV: null
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create representative');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customer') {
      const selectedCustomer = customers.find(c => c.Customer_id === value);
      setFormData(prev => ({
        ...prev,
        customer: value,
        customer_name: selectedCustomer ? selectedCustomer.Companyname : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  return (
    <div className="registration-form-container">
      <Card>
        <Card.Header>
          <h3 className="card-title">Customer Representative Registration</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Representative registered successfully!</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Contact Person Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="Contact_person_name"
                  value={formData.Contact_person_name}
                  onChange={handleChange}
                  className={`form-control-sm ${validationErrors.Contact_person_name ? 'is-invalid' : ''}`}
                  maxLength={15}
                  required
                />
                {validationErrors.Contact_person_name && (
                  <div className="invalid-feedback">{validationErrors.Contact_person_name}</div>
                )}
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-control-sm ${validationErrors.title ? 'is-invalid' : ''}`}
                  maxLength={100}
                />
                {validationErrors.title && (
                  <div className="invalid-feedback">{validationErrors.title}</div>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Education</Form.Label>
                <Form.Control
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className={`form-control-sm ${validationErrors.education ? 'is-invalid' : ''}`}
                  maxLength={100}
                />
                {validationErrors.education && (
                  <div className="invalid-feedback">{validationErrors.education}</div>
                )}
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={`form-control-sm ${validationErrors.designation ? 'is-invalid' : ''}`}
                  maxLength={100}
                />
                {validationErrors.designation && (
                  <div className="invalid-feedback">{validationErrors.designation}</div>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Qualification</Form.Label>
                <Form.Control
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className={`form-control-sm ${validationErrors.qualification ? 'is-invalid' : ''}`}
                  maxLength={100}
                />
                {validationErrors.qualification && (
                  <div className="invalid-feedback">{validationErrors.qualification}</div>
                )}
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="Contact_person_email"
                  value={formData.Contact_person_email}
                  onChange={handleChange}
                  className={`form-control-sm ${validationErrors.Contact_person_email ? 'is-invalid' : ''}`}
                  maxLength={254}
                  required
                />
                {validationErrors.Contact_person_email && (
                  <div className="invalid-feedback">{validationErrors.Contact_person_email}</div>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Contact Number *</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={formData.Contact_person_number}
                  onChange={(value) => handleChange({ target: { name: 'Contact_person_number', value } })}
                  inputClass={`form-control-sm ${validationErrors.Contact_person_number ? 'is-invalid' : ''}`}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'Contact_person_number',
                    required: true,
                    maxLength: 15
                  }}
                />
                {validationErrors.Contact_person_number && (
                  <div className="invalid-feedback d-block">{validationErrors.Contact_person_number}</div>
                )}
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Customer *</Form.Label>
                <Form.Select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className={`form-control-sm ${validationErrors.customer ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.Customer_id} value={customer.Customer_id}>
                      {customer.Companyname}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.customer && (
                  <div className="invalid-feedback">{validationErrors.customer}</div>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Registered By</Form.Label>
                <Form.Control
                  type="text"
                  value={registeredByName}
                  className="form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>CV Upload</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="form-control-sm"
                />
                <Form.Text className="text-muted">
                  Upload PDF or Word document (max 5MB)
                </Form.Text>
              </Col>
            </Row>

            

            <div className="text-center mt-3">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Representative'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerRepresentativeForm; 