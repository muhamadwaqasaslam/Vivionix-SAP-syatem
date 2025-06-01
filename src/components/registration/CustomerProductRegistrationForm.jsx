import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import api from '../../utils/api';

const CustomerProductRegistrationForm = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    productprice: '',
    customer: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

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

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/list_all/');
      if (response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearchTerm(value);
    setShowCustomerList(true);

    if (value.trim() === '') {
      setFilteredCustomers([]);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.Companyname && customer.Companyname.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleProductSearch = (e) => {
    const value = e.target.value;
    setProductSearchTerm(value);
    setShowProductList(true);

    if (value.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(product =>
      product.product_name && product.product_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customer: customer.Companyname
    }));
    setCustomerSearchTerm(customer.Companyname);
    setShowCustomerList(false);
    setValidationErrors(prev => ({
      ...prev,
      customer: null
    }));
  };

  const handleProductSelect = (product) => {
    setFormData(prev => ({
      ...prev,
      product_name: product.product_name
    }));
    setProductSearchTerm(product.product_name);
    setShowProductList(false);
    setValidationErrors(prev => ({
      ...prev,
      product_name: null
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.product_name.trim()) {
      errors.product_name = 'Product name is required';
    } else if (formData.product_name.length < 1) {
      errors.product_name = 'Product name must be at least 1 character long';
    }

    if (!formData.customer || !formData.customer.trim()) {
      errors.customer = 'Customer is required';
    }

    if (formData.productprice) {
      const price = parseFloat(formData.productprice);
      if (isNaN(price) || price < 0) {
        errors.productprice = 'Product price must be a positive number';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/customers/customer-product/create/', formData);
      
      if (response.data) {
        setSuccess(true);
        setFormData({
          product_name: '',
          productprice: '',
          customer: ''
        });
        setCustomerSearchTerm('');
        setProductSearchTerm('');
        setSelectedCustomer(null);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create customer product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form-container">
      <Card>
        <Card.Header>
          <h3 className="card-title">Customer Product Registration</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Customer product created successfully!</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label">Product Name</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    placeholder="Search for a product..."
                    className={validationErrors.product_name ? 'is-invalid' : ''}
                  />
                  {showProductList && filteredProducts.length > 0 && (
                    <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
                      {filteredProducts.map((product) => (
                        <ListGroup.Item
                          key={product.id}
                          action
                          onClick={() => handleProductSelect(product)}
                          style={{ cursor: 'pointer' }}
                        >
                          {product.product_name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  {validationErrors.product_name && (
                    <div className="invalid-feedback">{validationErrors.product_name}</div>
                  )}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label">Product Price</Form.Label>
                <Form.Control
                  type="number"
                  name="productprice"
                  value={formData.productprice}
                  onChange={handleChange}
                  className={validationErrors.productprice ? 'is-invalid' : ''}
                  step="0.01"
                  min="0"
                />
                {validationErrors.productprice && (
                  <div className="invalid-feedback">{validationErrors.productprice}</div>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label className="form-label">Customer</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={customerSearchTerm}
                    onChange={handleCustomerSearch}
                    placeholder="Search for a customer..."
                    className={validationErrors.customer ? 'is-invalid' : ''}
                  />
                  {showCustomerList && filteredCustomers.length > 0 && (
                    <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
                      {filteredCustomers.map((customer) => (
                        <ListGroup.Item
                          key={customer.Customer_id}
                          action
                          onClick={() => handleCustomerSelect(customer)}
                          style={{ cursor: 'pointer' }}
                        >
                          {customer.Companyname}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  {validationErrors.customer && (
                    <div className="invalid-feedback">{validationErrors.customer}</div>
                  )}
                </div>
                {selectedCustomer && (
                  <div className="mt-2 text-muted small">
                    Selected Customer: {selectedCustomer.Companyname}
                  </div>
                )}
              </Col>
            </Row>
            <div className="text-center mt-3">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Customer Product'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <style>
        {`
          .position-relative {
            position: relative;
          }
          .position-absolute {
            position: absolute;
            top: 100%;
            left: 0;
            max-height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .list-group-item:hover {
            background-color: #f8f9fa;
          }
        `}
      </style>
    </div>
  );
};

export default CustomerProductRegistrationForm; 