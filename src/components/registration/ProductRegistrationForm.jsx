import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import api from '../../utils/api';
import './RegistrationForm.css';

const ProductRegistrationForm = () => {
  const [product, setProduct] = useState({
    product_name: "",
    reference_number: "",
    packsize: "",
    packprice: "",
    vendor_id: "",
    remarks: "",
    registered_by: "",
    Qualitycertifications: "",
    product_category: [],
    brocure: null,
    ifu: null,
    ce_certificate: null,
    usfda_certificate: null,
    jis_mhlw_certificate: null,
    nmpa_certificate: null,
    ifcc_certificate: null
  });

  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

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

      // Fallback if no user data found
      return {
        employee_name: 'default_user',
        employee_id: null
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      // Return fallback on error
      return {
        employee_name: 'error_user',
        employee_id: null
      };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch vendors
        const vendorsResponse = await fetch('https://my.vivionix.com/vendors/list_all/');
        if (!vendorsResponse.ok) {
          throw new Error('Failed to fetch vendors');
        }
        const vendorsData = await vendorsResponse.json();
        setVendors(vendorsData);

        // Set registered_by from user info
        const userInfo = getUserInfo();
        setProduct(prev => ({
          ...prev,
          registered_by: userInfo.employee_id || ''
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    const errors = {};
    
    // Product Name validation
    if (!product.product_name.trim()) {
      errors.product_name = 'Product name is required';
    }

    // Reference Number validation
    if (!product.reference_number.trim()) {
      errors.reference_number = 'Reference number is required';
    }

    // Pack Size validation
    if (!product.packsize.trim()) {
      errors.packsize = 'Pack size is required';
    }

    // Pack Price validation
    if (!product.packprice.trim()) {
      errors.packprice = 'Pack price is required';
    }


    // Vendor validation
    if (!product.vendor_id) {
      errors.vendor_id = 'Vendor is required';
    }

    // Remarks validation
    if (!product.remarks.trim()) {
      errors.remarks = 'Remarks are required';
    }

    // Registered By validation
    if (!product.registered_by) {
      errors.registered_by = 'Registered by is required';
    }

    // Product Category validation
    if (product.product_category.length === 0) {
      errors.product_category = 'Product category is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'select-multiple') {
      // Handle multiple select
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setProduct(prev => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else {
      // Handle other inputs
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
    }
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    setProduct(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleCategoryChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setProduct(prev => ({
      ...prev,
      product_category: selectedValues
    }));
    
    if (validationErrors.product_category) {
      setValidationErrors(prev => ({
        ...prev,
        product_category: null
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
      
      // Append basic fields
      formData.append('product_name', product.product_name);
      formData.append('reference_number', product.reference_number);
      formData.append('packsize', product.packsize);
      formData.append('packprice', product.packprice);
      formData.append('vendorname', product.vendor_id);
      formData.append('remarks', product.remarks);
      formData.append('registered_by', product.registered_by);
      formData.append('Qualitycertifications', product.Qualitycertifications);
      
      // Append product categories as individual values
      product.product_category.forEach((category, index) => {
        formData.append(`product_category[${index}]`, category);
      });

      // Append file fields if they exist
      if (product.brocure) {
        formData.append('brocure', product.brocure);
      }
      if (product.ifu) {
        formData.append('ifu', product.ifu);
      }
      if (product.ce_certificate) {
        formData.append('CE', product.ce_certificate);
      }
      if (product.usfda_certificate) {
        formData.append('USFDA', product.usfda_certificate);
      }
      if (product.jis_mhlw_certificate) {
        formData.append('MHLW', product.jis_mhlw_certificate);
      }
      if (product.nmpa_certificate) {
        formData.append('NMPA', product.nmpa_certificate);
      }
      if (product.ifcc_certificate) {
        formData.append('IFCC', product.ifcc_certificate);
      }

      // Log the form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await api.post('/products/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setSuccess(true);
        
        // Reset form
        setProduct({
          product_name: "",
          reference_number: "",
          packsize: "",
          packprice: "",
          vendor_id: "",
          remarks: "",
          registered_by: "",
          Qualitycertifications: "",
          product_category: [],
          brocure: null,
          ifu: null,
          ce_certificate: null,
          usfda_certificate: null,
          jis_mhlw_certificate: null,
          nmpa_certificate: null,
          ifcc_certificate: null
        });
        setValidationErrors({});
      }
    } catch (err) {
      console.error('Error registering product:', err);
      if (err.response?.data) {
        // Handle validation errors
        if (err.response.data.product_category) {
          setError('Invalid product category selection');
        } else {
          setError(err.response.data.detail || 'Failed to register product');
        }
      } else {
        setError('Failed to register product. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="registration-container">
      <Card>
        <Card.Header className="registration-header">
          <h2 className="registration-title">Product Registration</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Product registered successfully!</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="product_name"
                  value={product.product_name}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.product_name ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.product_name && (
                  <div className="invalid-feedback">{validationErrors.product_name}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Ref/Cat Number</Form.Label>
                <Form.Control
                  type="text"
                  name="reference_number"
                  value={product.reference_number}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.reference_number ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.reference_number && (
                  <div className="invalid-feedback">{validationErrors.reference_number}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Pack Size</Form.Label>
                <Form.Control
                  type="text"
                  name="packsize"
                  value={product.packsize}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.packsize ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.packsize && (
                  <div className="invalid-feedback">{validationErrors.packsize}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Pack Price / MRP</Form.Label>
                <Form.Control
                  type="text"
                  name="packprice"
                  value={product.packprice}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.packprice ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.packprice && (
                  <div className="invalid-feedback">{validationErrors.packprice}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Vendor</Form.Label>
                <Form.Select
                  name="vendor_id"
                  value={product.vendor_id}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.vendor_id ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.vendor_id} value={vendor.vendor_id}>
                      {vendor.vendorname}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.vendor_id && (
                  <div className="invalid-feedback">{validationErrors.vendor_id}</div>
                )}
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Category</Form.Label>
                <Select
                  isMulti
                  name="product_category"
                  value={product.product_category.map(category => ({ value: category, label: category }))}
                  onChange={handleCategoryChange}
                  options={[
                    { value: 'Equipment', label: 'Equipment' },
                    { value: 'Chemical', label: 'Chemical' },
                    { value: 'Consumable Device', label: 'Consumable Device' }
                  ]}
                  className={`${validationErrors.product_category ? 'is-invalid' : ''}`}
                  classNamePrefix="select"
                  placeholder="Select Category(s)"
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
                {validationErrors.product_category && (
                  <div className="invalid-feedback">{validationErrors.product_category}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Quality Certifications</Form.Label>
                <Form.Control
                  type="text"
                  name="Qualitycertifications"
                  value={product.Qualitycertifications}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                />
              </Col>

              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  value={getUserInfo().employee_name || 'N/A'}
                  className="form-control form-control-sm"
                  readOnly
                />
              </Col>
              <Row>
            
            <Col md={3} className="mb-2">
              <Form.Label className="form-label small">USFDA Certificate</Form.Label>
              <Form.Control
                type="file"
                name="usfda_certificate"
                onChange={(e) => handleFileChange(e, 'usfda_certificate')}
                className="form-control form-control-sm"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Col>
            <Col md={3} className="mb-2">
              <Form.Label className="form-label small">JIS/MHLW Certificate</Form.Label>
              <Form.Control
                type="file"
                name="jis_mhlw_certificate"
                onChange={(e) => handleFileChange(e, 'jis_mhlw_certificate')}
                className="form-control form-control-sm"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Col>
            <Col md={3} className="mb-2">
              <Form.Label className="form-label small">NMPA Certificate</Form.Label>
              <Form.Control
                type="file"
                name="nmpa_certificate"
                onChange={(e) => handleFileChange(e, 'nmpa_certificate')}
                className="form-control form-control-sm"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Col>
            <Col md={3} className="mb-2">
              <Form.Label className="form-label small">IFCC Certificate</Form.Label>
              <Form.Control
                type="file"
                name="ifcc_certificate"
                onChange={(e) => handleFileChange(e, 'ifcc_certificate')}
                className="form-control form-control-sm"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Col>
          </Row>
              <Col md={3} className="mb-2">
                <Form.Label className="form-label small">Brochure</Form.Label>
                <Form.Control
                  type="file"
                  name="brocure"
                  onChange={(e) => handleFileChange(e, 'brocure')}
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={3} className="mb-2">
                <Form.Label className="form-label small">IFU</Form.Label>
                <Form.Control
                  type="file"
                  name="ifu"
                  onChange={(e) => handleFileChange(e, 'ifu')}
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>

          

              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  name="remarks"
                  value={product.remarks}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.remarks ? 'is-invalid' : ''}`}
                  rows="2"
                  required
                />
                {validationErrors.remarks && (
                  <div className="invalid-feedback">{validationErrors.remarks}</div>
                )}
              </Col>

            <Row className="mt-3">
              <Col md={12} className="text-center">
                <Button type="submit" variant="primary" className="btn-primary btn-sm">
                  Register Product
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductRegistrationForm; 