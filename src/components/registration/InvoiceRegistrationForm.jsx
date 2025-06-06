import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import api from '../../utils/api';
import './RegistrationForm.css';

const InvoiceRegistration = () => {
    const [invoice, setInvoice] = useState({
        invoice_date: new Date().toISOString().split('T')[0],
        order: '',
        selected_order_details: [],
        status: 'pending'
        });

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchOrders();
        // Get user info for registered_by_id
        const userInfo = getUserInfo();
        setInvoice(prev => ({
            ...prev,
            registered_by_id: userInfo.employee_id || ''
        }));
    }, []);

    const getUserInfo = () => {
        try {
            const sessionUser = sessionStorage.getItem('user');
            if (sessionUser) {
                return JSON.parse(sessionUser);
            }
            const localUser = localStorage.getItem('user');
            if (localUser) {
                return JSON.parse(localUser);
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

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/orders/');
            if (response.data && Array.isArray(response.data)) {
                console.log('Raw orders data:', response.data);
                setOrders(response.data);
            } else {
                console.error('Invalid orders data format:', response.data);
                setError('Invalid orders data format');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to fetch orders');
        }
    };

    const handleOrderSelect = (e) => {
        const orderId = e.target.value;
        console.log('Selected order ID:', orderId);
        
        const selectedOrder = orders.find(order => {
            console.log('Comparing order:', order);
            return String(order.order_id) === String(orderId);
        });
        
        console.log('Found selected order:', selectedOrder);
        
        if (selectedOrder) {
            setSelectedOrder(selectedOrder);
            // Get all order detail IDs from the selected order
            const orderDetailIds = selectedOrder.orderdetails ? selectedOrder.orderdetails.map(detail => detail.id) : [];
            console.log('Order detail IDs:', orderDetailIds);
            
            setInvoice(prev => ({
                ...prev,
                order: orderId,
                selected_order_details: orderDetailIds
            }));
        } else {
            console.error('Order not found for ID:', orderId);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvoice(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!invoice.invoice_date) {
            errors.invoice_date = 'Invoice date is required';
        }

        if (!invoice.order) {
            errors.order = 'Order is required';
        }

        if (!invoice.status) {
            errors.status = 'Status is required';
        }

        if (!invoice.registered_by_id) {
            errors.registered_by_id = 'Registered by is required';
        }

        if (!invoice.selected_order_details || invoice.selected_order_details.length === 0) {
            errors.selected_order_details = 'At least one order detail must be selected';
        }

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
            
            // Ensure we have valid order details
            if (!selectedOrder || !selectedOrder.orderdetails || selectedOrder.orderdetails.length === 0) {
                throw new Error('No valid order details found');
            }

            // Prepare the request payload
            const payload = {
                invoice_date: invoice.invoice_date,
                order: selectedOrder.order_id,
                selected_order_details: selectedOrder.orderdetails.map(detail => detail.id),
                status: invoice.status
            };

            console.log('Submitting invoice with data:', payload);

            const response = await api.post('/invoice/create/', payload);
            console.log('Response:', response);
            
            // Show success message
            setSuccess(`Invoice created successfully!`);
            setError(null);

            // Reset form
            setInvoice({
                invoice_date: new Date().toISOString().split('T')[0],
                order: '',
                selected_order_details: [],
                status: 'pending'
            });
            setSelectedOrder(null);
            setValidationErrors({});

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 5000);

        } catch (err) {
            console.error('Error creating invoice:', err);
            let errorMessage = 'Failed to create invoice';
            if (err.response) {
                errorMessage = err.response.data?.detail || err.response.data?.message || `Server error: ${err.response.status}`;
            }
            setError(errorMessage);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <Card>
                <Card.Header className="registration-header">
                    <h2 className="registration-title">Create Invoice</h2>
                </Card.Header>
                <Card.Body>
                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
                            {success}
                        </Alert>
                    )}
                    
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label className="form-label">Invoice Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="invoice_date"
                                    value={invoice.invoice_date}
                                    onChange={handleChange}
                                    className={validationErrors.invoice_date ? 'is-invalid' : ''}
                                    required
                                />
                                {validationErrors.invoice_date && (
                                    <div className="invalid-feedback">{validationErrors.invoice_date}</div>
                                )}
                            </Col>

                            <Col md={6} className="mb-3">
                                <Form.Label className="form-label">Order</Form.Label>
                                <Form.Select
                                    name="order"
                                    value={invoice.order}
                                    onChange={handleOrderSelect}
                                    className={validationErrors.order ? 'is-invalid' : ''}
                                    required
                                >
                                    <option value="">Select Order</option>
                                    {orders.map((order) => (
                                        <option key={order.order_id} value={order.order_id}>
                                            Order #{order.order_id}
                                        </option>
                                    ))}
                                </Form.Select>
                                {validationErrors.order && (
                                    <div className="invalid-feedback">{validationErrors.order}</div>
                                )}
                            </Col>

                            <Col md={6} className="mb-3">
                                <Form.Label className="form-label">Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={invoice.status}
                                    onChange={handleChange}
                                    className={validationErrors.status ? 'is-invalid' : ''}
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </Form.Select>
                                {validationErrors.status && (
                                    <div className="invalid-feedback">{validationErrors.status}</div>
                                )}
                            </Col>

                            {selectedOrder && (
                                <Col md={12} className="mb-3">
                                    <Card>
                                        <Card.Header>
                                            <h5>Selected Order Details</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <ListGroup>
                                                {selectedOrder.orderdetails && selectedOrder.orderdetails.map((detail, index) => (
                                                    <ListGroup.Item key={index}>
                                                        <div className="d-flex flex-column">
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <div>
                                                                    <strong>ID:</strong> {detail.id}
                                                                </div>
                                                                <div>
                                                                    <strong>Order:</strong> {detail.order}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <div>
                                                                    <strong>Product Name:</strong> {detail.display_product_name}
                                                                </div>
                                                                <div>
                                                                    <strong>Quantity:</strong> {detail.productquantity}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <div>
                                                                    <strong>Price:</strong> ₹{detail.productprice}
                                                                </div>
                                                                <div>
                                                                    <strong>Total Price:</strong> ₹{detail.total_price}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    <strong>Delivered Quantity:</strong> {detail.delivered_quantity}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )}
                        </Row>

                        <div className="text-center">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Invoice'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default InvoiceRegistration;