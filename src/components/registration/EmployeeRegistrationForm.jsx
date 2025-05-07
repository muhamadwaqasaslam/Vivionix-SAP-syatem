import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './RegistrationForm.css';

const EmployeeRegistrationForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    cnic: "",
    address: "",
    bank_account_number: "",
    hire_date: null,
    department: null,
    role: null
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);

  // Function to show notification with timeout
  const showNotification = (type, message) => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value) error = 'This field is required';
        else if (value.length < 2) error = 'Must be at least 2 characters';
        break;
      case 'username':
        if (!value) error = 'This field is required';
        else if (value.length < 3) error = 'Must be at least 3 characters';
        break;
      case 'email':
        if (!value) error = 'This field is required';
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) error = 'Invalid email address';
        break;
      case 'phone_number':
        if (!value) error = 'This field is required';
        else if (value.length < 10) error = 'Invalid phone number';
        break;
      case 'password':
        if (!value) error = 'This field is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'cnic':
        if (!value) error = 'This field is required';
        else if (!/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(value)) error = 'Invalid CNIC format (XXXXX-XXXXXXX-X)';
        break;
      case 'address':
        if (!value) error = 'This field is required';
        else if (value.length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'bank_account_number':
        if (!value) error = 'This field is required';
        else if (!/^[0-9]+$/.test(value)) error = 'Invalid account number';
        break;
      case 'hire_date':
        if (!value) error = 'This field is required';
        break;
      case 'department':
        if (!value) error = 'Please select a department';
        break;
      case 'role':
        if (!value) error = 'Please select a role';
        break;
      default:
        break;
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('https://my.vivionix.com/employee/roles/');
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        const data = await response.json();
        const formattedRoles = data.map(role => ({
          value: role.id,
          label: role.title
        }));
        setRoles(formattedRoles);
      } catch (err) {
        setRolesError(err.message);
        setTimeout(() => setRolesError(null), 5000);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('https://my.vivionix.com/employee/departments/');
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        const formattedDepartments = data.map(dept => ({
          value: dept.id,
          label: dept.name
        }));
        setDepartments(formattedDepartments);
      } catch (err) {
        setDepartmentsError(err.message);
        setTimeout(() => setDepartmentsError(null), 5000);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      phone_number: value
    }));
    if (errors.phone_number) {
      setErrors(prev => ({
        ...prev,
        phone_number: ''
      }));
    }
  };

  const handleSelectChange = (selectedOption, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: selectedOption
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const apiData = {
        ...formData,
        department: formData.department?.value || null,
        role: formData.role?.value || null
      };

      const response = await fetch('https://my.vivionix.com/employee/registeration/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const apiErrors = {};
          Object.keys(data.errors).forEach(key => {
            apiErrors[key] = data.errors[key].join(', ');
          });
          setErrors(apiErrors);
          showNotification('error', 'Please correct the errors in the form');
        } else {
          showNotification('error', data.message || 'Registration failed');
        }
      } else {
        showNotification('success', 'Registration successful!');
        setFormData({
          first_name: "",
          last_name: "",
          username: "",
          email: "",
          phone_number: "",
          password: "",
          cnic: "",
          address: "",
          bank_account_number: "",
          hire_date: null,
          department: null,
          role: null
        });
        setErrors({});
      }
    } catch (err) {
      showNotification('error', err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="registration-container">
      <Card>
        <Card.Header className="registration-header">
          <h2 className="registration-title">Employee Registration</h2>
        </Card.Header>
        <Card.Body className="registration-body">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
              {success}
            </Alert>
          )}
          {rolesError && (
            <Alert variant="warning" onClose={() => setRolesError(null)} dismissible>
              Warning: {rolesError}
            </Alert>
          )}
          {departmentsError && (
            <Alert variant="warning" onClose={() => setDepartmentsError(null)} dismissible>
              Warning: {departmentsError}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  isInvalid={!!errors.first_name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.first_name}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  isInvalid={!!errors.last_name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.last_name}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={formData.phone_number}
                  onChange={handlePhoneChange}
                  inputClass={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'phone_number',
                  }}
                />
                {errors.phone_number && (
                  <div className="invalid-feedback d-block">
                    {errors.phone_number}
                  </div>
                )}
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>CNIC</Form.Label>
                <Form.Control
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  isInvalid={!!errors.cnic}
                  placeholder="XXXXX-XXXXXXX-X"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cnic}
                </Form.Control.Feedback>
              </Col>
              <Col md={12} className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Bank Account Number</Form.Label>
                <Form.Control
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  isInvalid={!!errors.bank_account_number}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.bank_account_number}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Hire Date</Form.Label>
                <Form.Control
                  type="date"
                  name="hire_date"
                  value={formData.hire_date || ''}
                  onChange={handleChange}
                  isInvalid={!!errors.hire_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.hire_date}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Department</Form.Label>
                <Select
                  options={departments}
                  value={formData.department}
                  onChange={(selected) => handleSelectChange(selected, 'department')}
                  classNamePrefix="Select2"
                  className={`search-panel ${errors.department ? 'is-invalid' : ''}`}
                  isLoading={departmentsLoading}
                  isDisabled={departmentsLoading}
                />
                {errors.department && (
                  <div className="invalid-feedback d-block">
                    {errors.department}
                  </div>
                )}
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Role</Form.Label>
                <Select
                  options={roles}
                  value={formData.role}
                  onChange={(selected) => handleSelectChange(selected, 'role')}
                  classNamePrefix="Select2"
                  className={`search-panel ${errors.role ? 'is-invalid' : ''}`}
                  isLoading={rolesLoading}
                  isDisabled={rolesLoading}
                />
                {errors.role && (
                  <div className="invalid-feedback d-block">
                    {errors.role}
                  </div>
                )}
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                  />
                  <InputGroup.Text 
                    className="password-toggle" 
                    onClick={togglePasswordVisibility}
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                        <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    )}
                  </InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Col>
              <Col md={12} className="text-center mt-3">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="submit-button"
                  disabled={loading || rolesLoading || departmentsLoading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeeRegistrationForm; 