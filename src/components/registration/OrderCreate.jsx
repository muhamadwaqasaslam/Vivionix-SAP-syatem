import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import api from '../../utils/api';
import './RegistrationForm.css';

const OrderCreate = () => {
    const [order, setOrder] = useState({
        customer: '',
        order_delivery: '',
        GST: '',
        registered_by_id: '',
        orderdetails: [{
            product_name: '',
            productquantity: '',
            delivered_quantity: ''
        }],
        instructions: ''
    });

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [customerProducts, setCustomerProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
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
        // Get user info for registered_by_id
        const userInfo = getUserInfo();
        setOrder(prev => ({
            ...prev,
            registered_by_id: userInfo.employee_id || '',
            registered_by_name: userInfo.employee_name || ''
        }));
    }, []);

    const getUserInfo = () => {
        try {
            const sessionUser = sessionStorage.getItem('user');
            if (sessionUser) {
                const user = JSON.parse(sessionUser);
                console.log('Session User:', user);
                return user;
            }
            const localUser = localStorage.getItem('user');
            if (localUser) {
                const user = JSON.parse(localUser);
                console.log('Local User:', user);
                return user;
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
            const response = await api.get('/customers/customer-product/list/');
            if (response.data) {
                console.log('Customer Products:', response.data);
                setProducts(response.data);
            }
        } catch (err) {
            setError('Failed to fetch customer products');
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

    const handleCustomerSelect = (customer) => {
        console.log('Selected Customer:', customer);
        setSelectedCustomer(customer);
        setOrder(prev => ({
            ...prev,
            customer: customer.Companyname
        }));
        setCustomerSearchTerm(customer.Companyname);
        setShowCustomerList(false);
        setValidationErrors(prev => ({
            ...prev,
            customer: null
        }));

        // Filter products based on customer ID
        const customerSpecificProducts = products.filter(product => {
            console.log('Checking product:', product);
            return product.customer === customer.Customer_id;
        });
        console.log('Filtered Products:', customerSpecificProducts);
        setCustomerProducts(customerSpecificProducts);
    };

    const handleProductSearch = (e) => {
        const value = e.target.value;
        setProductSearchTerm(value);
        setShowProductList(true);

        if (value.trim() === '') {
            setFilteredProducts([]);
            return;
        }

        // Filter from customer-specific products
        const filtered = customerProducts.filter(product => {
            console.log('Searching product:', product);
            return product.product_names && product.product_names.toLowerCase().includes(value.toLowerCase());
        });
        console.log('Search Results:', filtered);
        setFilteredProducts(filtered);
    };

    const handleProductSelect = (product, index) => {
        const updatedOrderDetails = [...order.orderdetails];
        updatedOrderDetails[index] = {
            ...updatedOrderDetails[index],
            product_name: product.product_names
        };
        setOrder(prev => ({
            ...prev,
            orderdetails: updatedOrderDetails
        }));
        setProductSearchTerm(product.product_names);
        setShowProductList(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrder(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOrderDetailChange = (index, field, value) => {
        const updatedOrderDetails = [...order.orderdetails];
        updatedOrderDetails[index] = {
            ...updatedOrderDetails[index],
            [field]: value
        };
        setOrder(prev => ({
            ...prev,
            orderdetails: updatedOrderDetails
        }));
    };

    const addOrderDetail = () => {
        setOrder(prev => ({
            ...prev,
            orderdetails: [...prev.orderdetails, {
                product_name: '',
                productquantity: '',
                delivered_quantity: ''
            }]
        }));
    };

    const removeOrderDetail = (index) => {
        const updatedOrderDetails = order.orderdetails.filter((_, i) => i !== index);
        setOrder(prev => ({
            ...prev,
            orderdetails: updatedOrderDetails
        }));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!order.customer) {
            errors.customer = 'Customer is required';
        }

        if (!order.order_delivery) {
            errors.order_delivery = 'Delivery date is required';
        }

        if (!order.GST) {
            errors.GST = 'GST is required';
        }

        if (!order.registered_by_id) {
            errors.registered_by_id = 'Registered by is required';
        }

        if (!order.instructions) {
            errors.instructions = 'Instructions are required';
        }

        order.orderdetails.forEach((detail, index) => {
            if (!detail.product_name) {
                errors[`product_name_${index}`] = 'Product name is required';
            }
            if (!detail.productquantity) {
                errors[`productquantity_${index}`] = 'Product quantity is required';
            }
            if (!detail.delivered_quantity) {
                errors[`delivered_quantity_${index}`] = 'Delivered quantity is required';
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const response = await api.post('/orders/orders/create/', order);
            
            if (response.data) {
                setSuccess(true);
                setOrder({
                    customer: '',
                    order_delivery: '',
                    GST: '',
                    registered_by_id: '',
                 
                    orderdetails: [{
                        product_name: '',
                        productquantity: '',
                        delivered_quantity: ''
                    }],
                    instructions: ''
                });
                setCustomerSearchTerm('');
                setProductSearchTerm('');
                setSelectedCustomer(null);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <Card>
                <Card.Header className="registration-header">
                    <h2 className="registration-title">Create Order</h2>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                    {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Order created successfully!</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6} className="mb-3">
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
                            </Col>

                            <Col md={6} className="mb-3">
                                <Form.Label className="form-label">Delivery Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="order_delivery"
                                    value={order.order_delivery}
                                    onChange={handleChange}
                                    className={validationErrors.order_delivery ? 'is-invalid' : ''}
                                    required
                                />
                                {validationErrors.order_delivery && (
                                    <div className="invalid-feedback">{validationErrors.order_delivery}</div>
                                )}
                            </Col>

                            <Col md={6} className="mb-3">
                                <Form.Label className="form-label">GST (%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="GST"
                                    value={order.GST}
                                    onChange={handleChange}
                                    className={validationErrors.GST ? 'is-invalid' : ''}
                                    min="0"
                                    max="100"
                                    required
                                />
                                {validationErrors.GST && (
                                    <div className="invalid-feedback">{validationErrors.GST}</div>
                                )}
                            </Col>

                            <Col md={6} className="mb-3">
                                <Form.Label className="form-label">Registered By</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="registered_by_id"
                                    value={`  ${order.registered_by_name}`}
                                    onChange={handleChange}
                                    className={validationErrors.registered_by_id ? 'is-invalid' : ''}
                                    required
                                    readOnly
                                    disabled    
                                />
                                {validationErrors.registered_by_id && (
                                    <div className="invalid-feedback">{validationErrors.registered_by_id}</div>
                                )}
                            </Col>

                            <Col md={12} className="mb-3">
                                <Form.Label className="form-label">Instructions</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="instructions"
                                    value={order.instructions}
                                    onChange={handleChange}
                                    className={validationErrors.instructions ? 'is-invalid' : ''}
                                    rows="3"
                                    required
                                />
                                {validationErrors.instructions && (
                                    <div className="invalid-feedback">{validationErrors.instructions}</div>
                                )}
                            </Col>
                        </Row>

                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>Order Details</h4>
                            </div>

                            {order.orderdetails.map((detail, index) => (
                                <Card key={index} className="mb-3">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5>Product Details</h5>
                                        </div>

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Label className="form-label">Product Name</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type="text"
                                                        value={detail.product_name}
                                                        onChange={(e) => handleProductSearch(e)}
                                                        placeholder="Search for a product..."
                                                        className={validationErrors[`product_name_${index}`] ? 'is-invalid' : ''}
                                                        disabled={!selectedCustomer}
                                                    />
                                                    {showProductList && filteredProducts.length > 0 && (
                                                        <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
                                                            {filteredProducts.map((product) => (
                                                                <ListGroup.Item
                                                                    key={product.id}
                                                                    action
                                                                    onClick={() => handleProductSelect(product, index)}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {product.product_names}
                                                                </ListGroup.Item>
                                                            ))}
                                                        </ListGroup>
                                                    )}
                                                    {validationErrors[`product_name_${index}`] && (
                                                        <div className="invalid-feedback">{validationErrors[`product_name_${index}`]}</div>
                                                    )}
                                                    {!selectedCustomer && (
                                                        <div className="text-muted small mt-1">Please select a customer first</div>
                                                    )}
                                                </div>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Label className="form-label">Product Quantity</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={detail.productquantity}
                                                    onChange={(e) => handleOrderDetailChange(index, 'productquantity', e.target.value)}
                                                    className={validationErrors[`productquantity_${index}`] ? 'is-invalid' : ''}
                                                    min="0"
                                                    required
                                                />
                                                {validationErrors[`productquantity_${index}`] && (
                                                    <div className="invalid-feedback">{validationErrors[`productquantity_${index}`]}</div>
                                                )}
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Label className="form-label">Delivered Quantity</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={detail.delivered_quantity}
                                                    onChange={(e) => handleOrderDetailChange(index, 'delivered_quantity', e.target.value)}
                                                    className={validationErrors[`delivered_quantity_${index}`] ? 'is-invalid' : ''}
                                                    min="0"
                                                    required
                                                />
                                                {validationErrors[`delivered_quantity_${index}`] && (
                                                    <div className="invalid-feedback">{validationErrors[`delivered_quantity_${index}`]}</div>
                                                )}
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>

                        <div className="text-center">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Order'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default OrderCreate;
