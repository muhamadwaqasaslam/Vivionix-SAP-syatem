import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import './RegistrationForm.css';

const ProductRegistrationForm = () => {
  const [product, setProduct] = useState({
    product_name: "",
    reference_number: "",
    packsize: "",
    packprice: "",
    price_date: "",
    vendor_id: "",
    remarks: "",
    registered_by: "",
    Qualitycertifications: "",
    product_category: "",
    brocure: null,
    ifu: null,
    certificates: null
  });

  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

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

        // Fetch employees
        const employeesResponse = await fetch('https://my.vivionix.com/employee/list_all/');
        if (!employeesResponse.ok) {
          throw new Error('Failed to fetch employees');
        }
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
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

    // Price Date validation
    if (!product.price_date) {
      errors.price_date = 'Price date is required';
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
    if (!product.product_category) {
      errors.product_category = 'Product category is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
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

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    setProduct(prev => ({
      ...prev,
      [field]: file
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
      Object.keys(product).forEach(key => {
        formData.append(key, product[key]);
      });

      const response = await fetch('https://my.vivionix.com/products/create/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to register product');
      }

      setSuccess(true);
      setProduct({
        product_name: "",
        reference_number: "",
        packsize: "",
        packprice: "",
        price_date: "",
        vendor_id: "",
        remarks: "",
        registered_by: "",
        Qualitycertifications: "",
        product_category: "",
        brocure: null,
        ifu: null,
        certificates: null
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
      <h3 className="registration-heading">Product Registration</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Product registered successfully!</div>}

      <Card>
        <Card.Body>
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
                <Form.Label className="form-label small">Reference Number</Form.Label>
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
                <Form.Label className="form-label small">Pack Price</Form.Label>
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
                <Form.Label className="form-label small">Price Date</Form.Label>
                <Form.Control
                  type="date"
                  name="price_date"
                  value={product.price_date}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.price_date ? 'is-invalid' : ''}`}
                  required
                />
                {validationErrors.price_date && (
                  <div className="invalid-feedback">{validationErrors.price_date}</div>
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
                <Form.Select
                  name="product_category"
                  value={product.product_category}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.product_category ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Consumable Device">Consumable Device</option>
                </Form.Select>
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
                <Form.Select
                  name="registered_by"
                  value={product.registered_by}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${validationErrors.registered_by ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.name}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.registered_by && (
                  <div className="invalid-feedback">{validationErrors.registered_by}</div>
                )}
              </Col>
              <Col md={2} className="mb-2">
                <Form.Label className="form-label small">Brochure</Form.Label>
                <Form.Control
                  type="file"
                  name="brocure"
                  onChange={(e) => handleFileChange(e, 'brocure')}
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={2} className="mb-2">
                <Form.Label className="form-label small">IFU</Form.Label>
                <Form.Control
                  type="file"
                  name="ifu"
                  onChange={(e) => handleFileChange(e, 'ifu')}
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={2} className="mb-2">
                <Form.Label className="form-label small">Certificates</Form.Label>
                <Form.Control
                  type="file"
                  name="certificates"
                  onChange={(e) => handleFileChange(e, 'certificates')}
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