import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import api from '../../utils/api';

const OrderDetailRegistrationForm = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    productquantity: '',
    order: '',
    delivered_quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [showOrderList, setShowOrderList] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/orders/');
      if (response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      setError('Failed to fetch orders');
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

  const handleOrderSearch = (e) => {
    const value = e.target.value;
    setOrderSearchTerm(value);
    setShowOrderList(true);

    if (value.trim() === '') {
      setFilteredOrders([]);
      return;
    }

    const filtered = orders.filter(order =>
      order.order_id.toString().toLowerCase().includes(value.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleOrderSelect = (order) => {
    setFormData(prev => ({
      ...prev,
      order: order.order_id
    }));
    setOrderSearchTerm(`${order.order_id} - ${order.customer_name}`);
    setShowOrderList(false);
  };

  const handleProductSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowProductList(true);

    if (value.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(product =>
      product.product_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product) => {
    setFormData(prev => ({
      ...prev,
      product_name: product.product_name
    }));
    setSearchTerm(product.product_name);
    setShowProductList(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.product_name.trim()) {
      errors.product_name = 'Product name is required';
    } else if (formData.product_name.length < 1) {
      errors.product_name = 'Product name must be at least 1 character long';
    }

    if (!formData.order.trim()) {
      errors.order = 'Order is required';
    }

    if (formData.productquantity) {
      const quantity = parseInt(formData.productquantity);
      if (isNaN(quantity) || quantity < 0 || quantity > 4294967295) {
        errors.productquantity = 'Product quantity must be between 0 and 4294967295';
      }
    }

    if (formData.delivered_quantity) {
      const delivered = parseInt(formData.delivered_quantity);
      if (isNaN(delivered) || delivered < 0 || delivered > 4294967295) {
        errors.delivered_quantity = 'Delivered quantity must be between 0 and 4294967295';
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
      
      const response = await api.post('/orders/ordersdetail/create', formData);
      
      if (response.data) {
        setSuccess(true);
        setFormData({
          product_name: '',
          productquantity: '',
          order: '',
          delivered_quantity: ''
        });
        setSearchTerm('');
        setOrderSearchTerm('');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create order detail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form-container">
      <Card>
        <Card.Header>
          <h3 className="card-title">Order Detail Registration</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Order detail created successfully!</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label">Order</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={orderSearchTerm}
                    onChange={handleOrderSearch}
                    placeholder="Search by Order ID or Customer Name..."
                    className={validationErrors.order ? 'is-invalid' : ''}
                  />
                  {showOrderList && filteredOrders.length > 0 && (
                    <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
                      {filteredOrders.map((order) => (
                        <ListGroup.Item
                          key={order.order_id}
                          action
                          onClick={() => handleOrderSelect(order)}
                          style={{ cursor: 'pointer' }}
                        >
                          {order.order_id} - {order.customer_name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  {validationErrors.order && (
                    <div className="invalid-feedback">{validationErrors.order}</div>
                  )}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label">Product Name</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={searchTerm}
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
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label">Product Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="productquantity"
                  value={formData.productquantity}
                  onChange={handleChange}
                  className={validationErrors.productquantity ? 'is-invalid' : ''}
                  min={0}
                  max={4294967295}
                />
                {validationErrors.productquantity && (
                  <div className="invalid-feedback">{validationErrors.productquantity}</div>
                )}
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label">Delivered Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="delivered_quantity"
                  value={formData.delivered_quantity}
                  onChange={handleChange}
                  className={validationErrors.delivered_quantity ? 'is-invalid' : ''}
                  min={0}
                  max={4294967295}
                />
                {validationErrors.delivered_quantity && (
                  <div className="invalid-feedback">{validationErrors.delivered_quantity}</div>
                )}
              </Col>
            </Row>
            <div className="text-center mt-3">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Order Detail'}
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
          .list-group-item {
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
          }
          .list-group-item:hover {
            background-color: #f8f9fa;
          }
        `}
      </style>
    </div>
  );
};

export default OrderDetailRegistrationForm; 