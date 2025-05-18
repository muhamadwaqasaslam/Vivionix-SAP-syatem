import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import './RegistrationForm.css';

const CreateDC = () => {
    const [formData, setFormData] = useState({
        dcNo: '',
        dcDate: '',
        customerName: '',
        orderNo: '',
        orderDate: '',
        orderDeliveryDate: '',
        comments: '',
        products: [
            {
                srNo: 1,
                productName: '',
                brandName: '',
                packSize: '',
                orderedQuantity: '',
                pendingQuantity: '',
                quantity: ''
            }
        ]
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [productSearch, setProductSearch] = useState({}); // {rowIndex: searchText}
    const [showDropdown, setShowDropdown] = useState({}); // {rowIndex: true/false}
    const dropdownRefs = useRef({});

    // Mock data for demonstration
    const mockCustomers = [
        { id: 1, name: 'Customer 1' },
        { id: 2, name: 'Customer 2' },
        { id: 3, name: 'Customer 3' }
    ];

    // Map orders by customer id
    const mockOrdersByCustomer = {
        1: [
            { id: 1, orderNo: 'ORD001', orderDate: '2024-03-20' },
            { id: 2, orderNo: 'ORD002', orderDate: '2024-03-21' }
        ],
        2: [
            { id: 3, orderNo: 'ORD003', orderDate: '2024-03-22' }
        ],
        3: [
            { id: 4, orderNo: 'ORD004', orderDate: '2024-03-23' }
        ]
    };

    // Mock products by order id
    const mockProductsByOrder = {
        1: [
            { id: 101, name: 'Product A', brand: 'Brand X', packSize: '10kg', orderedQty: 50 },
            { id: 102, name: 'Product B', brand: 'Brand Y', packSize: '5kg', orderedQty: 30 }
        ],
        2: [
            { id: 103, name: 'Product C', brand: 'Brand Z', packSize: '2kg', orderedQty: 20 }
        ],
        3: [
            { id: 104, name: 'Product D', brand: 'Brand W', packSize: '1kg', orderedQty: 10 }
        ],
        4: [
            { id: 105, name: 'Product E', brand: 'Brand V', packSize: '500g', orderedQty: 5 }
        ]
    };

    // Generate DC Number and Date on component mount
    useEffect(() => {
        const generateDCNumber = () => {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `DC${year}${month}${random}`;
        };

        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({
            ...prev,
            dcNo: generateDCNumber(),
            dcDate: today
        }));
    }, []);

    // Add click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.keys(dropdownRefs.current).forEach((key) => {
                if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
                    setShowDropdown((prev) => ({ ...prev, [key]: false }));
                }
            });
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!formData.customerName) {
            errors.customerName = 'Customer name is required';
        }

        if (!formData.orderNo) {
            errors.orderNo = 'Order number is required';
        }

        formData.products.forEach((product, index) => {
            if (!product.quantity) {
                errors[`product_${index}_quantity`] = 'Quantity is required';
            } else if (parseInt(product.quantity) > parseInt(product.pendingQuantity)) {
                errors[`product_${index}_quantity`] = 'Quantity cannot exceed pending quantity';
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        setFormData(prev => ({
            ...prev,
            customerName: customerId,
            orderNo: '',
            orderDate: ''
        }));
        if (validationErrors.customerName) {
            setValidationErrors(prev => ({
                ...prev,
                customerName: null
            }));
        }
    };

    const handleOrderChange = (e) => {
        const orderId = e.target.value;
        const selectedOrder = mockOrdersByCustomer[formData.customerName]?.find(order => order.id === parseInt(orderId));
        setFormData(prev => ({
            ...prev,
            orderNo: orderId,
            orderDate: selectedOrder ? selectedOrder.orderDate : '',
            orderDeliveryDate: '',
            products: [
                {
                    srNo: 1,
                    productId: '',
                    productName: '',
                    brandName: '',
                    packSize: '',
                    orderedQuantity: '',
                    pendingQuantity: '',
                    quantity: ''
                }
            ]
        }));
        if (validationErrors.orderNo) {
            setValidationErrors(prev => ({
                ...prev,
                orderNo: null
            }));
        }
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...formData.products];
        if (field === 'productId') {
            // Find selected product details
            const selectedProduct = (mockProductsByOrder[formData.orderNo] || []).find(p => p.id === parseInt(value));
            if (selectedProduct) {
                newProducts[index] = {
                    ...newProducts[index],
                    productId: selectedProduct.id,
                    productName: selectedProduct.name,
                    brandName: selectedProduct.brand,
                    packSize: selectedProduct.packSize,
                    pendingQuantity: '',
                    quantity: ''
                };
            }
        } else {
            newProducts[index] = {
                ...newProducts[index],
                [field]: value
            };
        }
        setFormData(prev => ({
            ...prev,
            products: newProducts
        }));
        if (validationErrors[`product_${index}_quantity`]) {
            setValidationErrors(prev => ({
                ...prev,
                [`product_${index}_quantity`]: null
            }));
        }
    };

    const addProductRow = () => {
        setFormData(prev => ({
            ...prev,
            products: [
                ...prev.products,
                {
                    srNo: prev.products.length + 1,
                    productName: '',
                    brandName: '',
                    packSize: '',
                    orderedQuantity: '',
                    pendingQuantity: '',
                    quantity: ''
                }
            ]
        }));
    };

    const removeProductRow = (index) => {
        if (formData.products.length > 1) {
            const newProducts = formData.products.filter((_, i) => i !== index);
            newProducts.forEach((product, i) => {
                product.srNo = i + 1;
            });
            setFormData(prev => ({
                ...prev,
                products: newProducts
            }));
        }
    };

    const handleSubmit = (e, isForApproval = false) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        // Mock API call
        console.log('Form Data:', formData);
        setSuccess(true);
        setFormData(prev => ({
            ...prev,
            customerName: '',
            orderNo: '',
            orderDate: '',
            orderDeliveryDate: '',
            comments: '',
            products: [{
                srNo: 1,
                productName: '',
                brandName: '',
                packSize: '',
                orderedQuantity: '',
                pendingQuantity: '',
                quantity: ''
            }]
        }));
    };

    return (
        <div className="registration-container">

            <Card>
                <Card.Header className="registration-header">
                    <h3 className="registration-heading">Create Delivery Challan</h3>

                </Card.Header>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">Delivery Challan created successfully!</div>}

                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6} className="mb-2">
                                <Form.Label className="form-label small">DC No</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.dcNo}
                                    readOnly
                                    className="form-control form-control-sm"
                                />
                            </Col>
                            <Col md={6} className="mb-2">
                                <Form.Label className="form-label small">DC Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.dcDate}
                                    readOnly
                                    className="form-control form-control-sm"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} className="mb-2">
                                <Form.Label className="form-label small">Customer Name</Form.Label>
                                <Form.Select
                                    value={formData.customerName}
                                    onChange={handleCustomerChange}
                                    className={`form-control form-control-sm ${validationErrors.customerName ? 'is-invalid' : ''}`}
                                    required
                                >
                                    <option value="">Select Customer</option>
                                    {mockCustomers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {validationErrors.customerName && (
                                    <div className="invalid-feedback">{validationErrors.customerName}</div>
                                )}
                            </Col>
                            <Col md={6} className="mb-2">
                                <Form.Label className="form-label small">Order Delivery Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.orderDeliveryDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, orderDeliveryDate: e.target.value }))}
                                    className="form-control form-control-sm"
                                    required
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} className="mb-2">
                                <Form.Label className="form-label small">Order No</Form.Label>
                                <Form.Select
                                    value={formData.orderNo}
                                    onChange={handleOrderChange}
                                    className={`form-control form-control-sm ${validationErrors.orderNo ? 'is-invalid' : ''}`}
                                    required
                                    disabled={!formData.customerName}
                                >
                                    <option value="">Select Order</option>
                                    {(mockOrdersByCustomer[formData.customerName] || []).map(order => (
                                        <option key={order.id} value={order.id}>
                                            {order.orderNo}
                                        </option>
                                    ))}
                                </Form.Select>
                                {validationErrors.orderNo && (
                                    <div className="invalid-feedback">{validationErrors.orderNo}</div>
                                )}
                            </Col>
                            <Col md={6} className="mb-2">
                                <Form.Label className="form-label small">Order Date</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.orderDate}
                                    readOnly
                                    className="form-control form-control-sm"
                                />
                            </Col>
                        </Row>

                        <div className="mt-4 dc-product-section">
                            <h5 className="form-section-title">Stockout/Create Delivery Challan</h5>
                            <div className="dc-product-header-row">
                                <span>Sr. No</span>
                                <span>Product Name</span>
                                <span>Brand Name</span>
                                <span>Pack Size</span>
                                <span>Ordered Qty</span>
                                <span>Pending Qty</span>
                                <span>Quantity</span>
                                <span></span>
                            </div>
                            {formData.products.map((product, index) => {
                                // Exclude already selected products in other rows
                                const selectedProductIds = formData.products.filter((_, i) => i !== index).map(p => p.productId);
                                let availableProducts = (mockProductsByOrder[formData.orderNo] || []).filter(p => !selectedProductIds.includes(p.id));
                                // Filter by search
                                const searchText = productSearch[index] || '';
                                if (searchText) {
                                    availableProducts = availableProducts.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()));
                                }
                                return (
                                    <div key={index} className="dc-product-row">
                                        <input type="text" value={product.srNo} readOnly className="dc-input dc-srno" />
                                        <div style={{ position: 'relative' }} ref={el => dropdownRefs.current[index] = el}>
                                            <input
                                                className="dc-input"
                                                type="text"
                                                value={product.productName || (searchText ? searchText : '')}
                                                placeholder="Search Product"
                                                onChange={e => {
                                                    setProductSearch(prev => ({ ...prev, [index]: e.target.value }));
                                                    setShowDropdown(prev => ({ ...prev, [index]: true }));
                                                    // Clear productId and productName if user types
                                                    handleProductChange(index, 'productName', e.target.value);
                                                }}
                                                onFocus={() => setShowDropdown(prev => ({ ...prev, [index]: true }))}
                                                autoComplete="off"
                                                disabled={!formData.orderNo}
                                                required
                                            />
                                            {showDropdown[index] && availableProducts.length > 0 && (
                                                <div className="dropdown-menu show dc-product-dropdown" style={{ width: '100%', maxHeight: 180, overflowY: 'auto', zIndex: 10 }}>
                                                    {availableProducts.map(p => (
                                                        <button
                                                            type="button"
                                                            className="dropdown-item"
                                                            key={p.id}
                                                            onClick={() => {
                                                                handleProductChange(index, 'productId', p.id);
                                                                setProductSearch(prev => ({ ...prev, [index]: p.name }));
                                                                setShowDropdown(prev => ({ ...prev, [index]: false }));
                                                            }}
                                                        >
                                                            {p.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <input type="text" value={product.brandName} className="dc-input" readOnly />
                                        <input type="text" value={product.packSize} className="dc-input dc-packsize" readOnly />
                                        <input type="number" value={product.orderedQuantity} onChange={e => handleProductChange(index, 'orderedQuantity', e.target.value)} className="dc-input" required />
                                        <input type="number" value={product.pendingQuantity} onChange={e => handleProductChange(index, 'pendingQuantity', e.target.value)} className="dc-input" required />
                                        <div className="dc-qty-col">
                                            <input type="number" value={product.quantity} onChange={e => handleProductChange(index, 'quantity', e.target.value)} className={`dc-input dc-qty ${validationErrors[`product_${index}_quantity`] ? 'is-invalid' : ''}`} required max={product.pendingQuantity} />
                                            {validationErrors[`product_${index}_quantity`] && (
                                                <div className="invalid-feedback d-block">{validationErrors[`product_${index}_quantity`]}</div>
                                            )}
                                        </div>
                                        <button type="button" className="btn btn-danger btn-sm dc-remove-btn" onClick={() => removeProductRow(index)} disabled={formData.products.length === 1}>&ndash;</button>
                                    </div>
                                );
                            })}
                            <Button
                                variant="secondary"
                                className="mb-3 btn-sm dc-add-btn"
                                onClick={addProductRow}
                                disabled={
                                    (mockProductsByOrder[formData.orderNo] || []).length === formData.products.length
                                }
                            >
                                Add Product
                            </Button>
                        </div>

                        <Row className="mt-3">
                            <Col md={12} className="mb-3">
                                <Form.Label className="form-label small">Comments</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={formData.comments}
                                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                                    placeholder="Enter any additional comments here..."
                                    className="form-control form-control-sm"
                                />
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col md={12} className="text-center">
                                <Button type="button" variant="primary" className="btn-primary btn-sm me-2" onClick={e => handleSubmit(e, false)}>Save</Button>
                                <Button type="button" variant="success" className="btn-success btn-sm" onClick={e => handleSubmit(e, true)}>Submit for Approval</Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CreateDC; 