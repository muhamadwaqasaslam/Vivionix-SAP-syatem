import React, { useState, useRef, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Modal, Table, Alert } from 'react-bootstrap';
import './EmployeeTable.css'; // Import the CSS for styling

const PendingApprovals = () => {
  // Mock data for pending DCs
  const initialDCs = [
    {
      id: 1,
      dcDate: '2024-05-14',
      dcNo: 'DC240501',
      orderNo: '1', // Use ID to match mockOrdersByCustomer
      orderDate: '2024-03-20',
      customerName: '1', // Use ID to match mockCustomers
      orderDeliveryDate: '2024-05-16',
      comments: 'Sample comments for DC1',
      products: [
        {
          srNo: 1,
          productId: 101,
          productName: 'Product A',
          brandName: 'Brand X',
          packSize: '10kg',
          orderedQuantity: '50',
          pendingQuantity: '30',
          quantity: '20'
        },
        {
          srNo: 2,
          productId: 102,
          productName: 'Product B',
          brandName: 'Brand Y',
          packSize: '5kg',
          orderedQuantity: '30',
          pendingQuantity: '20',
          quantity: '10'
        }
      ]
    },
    {
      id: 2,
      dcDate: '2024-05-13',
      dcNo: 'DC240502',
      orderNo: '3', // Use ID
      orderDate: '2024-03-22',
      customerName: '2', // Use ID
      orderDeliveryDate: '2024-05-15',
      comments: 'Comments for DC2',
      products: [
        {
          srNo: 1,
          productId: 104,
          productName: 'Product D',
          brandName: 'Brand W',
          packSize: '1kg',
          orderedQuantity: '10',
          pendingQuantity: '8',
          quantity: '5'
        }
      ]
    },
    {
      id: 3,
      dcDate: '2024-05-12',
      dcNo: 'DC240503',
      orderNo: '4', // Use ID
      orderDate: '2024-03-23',
      customerName: '3', // Use ID
      orderDeliveryDate: '2024-05-14',
      comments: 'DC3 comments',
      products: [
        {
          srNo: 1,
          productId: 105,
          productName: 'Product E',
          brandName: 'Brand V',
          packSize: '500g',
          orderedQuantity: '5',
          pendingQuantity: '3',
          quantity: '2'
        }
      ]
    },
  ];

  // Mock data for demonstration (copied from CreateDC.jsx)
  const mockCustomers = [
    { id: 1, name: 'Customer 1' },
    { id: 2, name: 'Customer 2' },
    { id: 3, name: 'Customer 3' }
  ];

  // Map orders by customer id (copied from CreateDC.jsx)
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

  // Mock products by order id (copied from CreateDC.jsx)
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

  const [pendingDCs, setPendingDCs] = useState(initialDCs);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({}); // Use a different state for modal form data
  const [selectedDC, setSelectedDC] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState({});
  const [showDropdown, setShowDropdown] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const dropdownRefs = useRef({});

  // Filtered DCs based on search
  const filteredDCs = pendingDCs.filter(dc => {
    // Find customer name by ID for filtering
    const customer = mockCustomers.find(cust => cust.id === parseInt(dc.customerName));
    const customerName = customer ? customer.name : '';
    return (
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dc.dcNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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

  // Handlers
  const handleShowEdit = (dc) => {
    setSelectedDC(dc);
    // Set modal form data with selected DC data
    setEditFormData({ ...dc });
    setProductSearch({}); // Clear product search on modal open
    setShowDropdown({}); // Close any open dropdowns
    setValidationErrors({}); // Clear validation errors
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDC(null);
    setEditFormData({});
    setValidationErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setEditFormData(prev => ({
      ...prev,
      customerName: customerId,
      orderNo: '',
      orderDate: '',
      products: []
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
    const selectedOrder = mockOrdersByCustomer[editFormData.customerName]?.find(order => order.id === parseInt(orderId));
    setEditFormData(prev => ({
      ...prev,
      orderNo: orderId,
      orderDate: selectedOrder ? selectedOrder.orderDate : '',
      orderDeliveryDate: '',
      products: []
    }));
    if (validationErrors.orderNo) {
      setValidationErrors(prev => ({
        ...prev,
        orderNo: null
      }));
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...editFormData.products];
    if (field === 'productId') {
      // Find selected product details
      const selectedProduct = (mockProductsByOrder[editFormData.orderNo] || []).find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newProducts[index] = {
          ...newProducts[index],
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          brandName: selectedProduct.brand,
          packSize: selectedProduct.packSize,
          orderedQuantity: selectedProduct.orderedQty, // Assuming orderedQty comes from selected product
          pendingQuantity: selectedProduct.orderedQty, // Assuming pending starts as ordered
          quantity: '' // Clear quantity on product change
        };
      }
    } else {
      newProducts[index] = {
        ...newProducts[index],
        [field]: value
      };
    }
    setEditFormData(prev => ({
      ...prev,
      products: newProducts
    }));
    // Clear product quantity validation error if user types in quantity
    if (field === 'quantity' && validationErrors[`product_${index}_quantity`]) {
       setValidationErrors(prev => ({
         ...prev,
         [`product_${index}_quantity`]: null
       }));
    }
  };

  const addProductRow = () => {
    setEditFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          srNo: prev.products.length + 1,
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
  };

  const removeProductRow = (index) => {
    if (editFormData.products.length > 1) {
      const newProducts = editFormData.products.filter((_, i) => i !== index);
      newProducts.forEach((product, i) => {
        product.srNo = i + 1;
      });
      setEditFormData(prev => ({
        ...prev,
        products: newProducts
      }));
       // Remove validation error for the removed row
       const newValidationErrors = { ...validationErrors };
       delete newValidationErrors[`product_${index}_quantity`];
       setValidationErrors(newValidationErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editFormData.customerName) {
      errors.customerName = 'Customer name is required';
    }
    if (!editFormData.orderNo) {
      errors.orderNo = 'Order number is required';
    }
    if (!editFormData.orderDeliveryDate) {
        errors.orderDeliveryDate = 'Order Delivery Date is required';
    }
    editFormData.products.forEach((product, index) => {
      if (!product.productName || !product.productId) {
         errors[`product_${index}_name`] = 'Product name is required'; // More specific error key
      }
      if (!product.quantity) {
        errors[`product_${index}_quantity`] = 'Quantity is required';
      } else if (parseInt(product.quantity) > parseInt(product.pendingQuantity)) {
        errors[`product_${index}_quantity`] = 'Quantity cannot exceed pending quantity';
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setPendingDCs((prev) =>
      prev.map((dc) => (dc.id === selectedDC.id ? { ...dc, ...editFormData } : dc))
    );
    setAlert({ type: 'success', message: 'DC updated successfully!' });
    handleCloseEditModal();
  };

  const handleApprove = (id) => {
    setPendingDCs((prev) => prev.filter((dc) => dc.id !== id));
    setAlert({ type: 'success', message: 'DC approved!' });
  };

  const handleDelete = (id) => {
    setPendingDCs((prev) => prev.filter((dc) => dc.id !== id));
    setAlert({ type: 'danger', message: 'DC deleted.' });
  };

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Pending Delivery Challans for Approval</h3>
      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}
      <div className="table-header mb-2">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search by Customer Name or DC No..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>
      <div className="table-responsive">
        <Table className="table text-nowrap">
          <thead>
            <tr>
              <th>DC Date</th>
              <th>DC No</th>
              <th>Order No</th>
              <th>Order Date</th>
              <th>Customer Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDCs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted">No pending DCs.</td>
              </tr>
            ) : (
              filteredDCs.map((dc) => (
                <tr key={dc.id}>
                  <td>{dc.dcDate}</td>
                  <td>{dc.dcNo}</td>
                  {/* Display OrderNo and OrderDate from the DC object */}
                  <td>{dc.orderNo}</td>
                  <td>{dc.orderDate}</td>
                  {/* Display CustomerName by finding the name from mockCustomers */}
                  <td>{mockCustomers.find(cust => cust.id === parseInt(dc.customerName))?.name || dc.customerName}</td>
                  <td>
                    <div className="hstack gap-2 fs-15">
                      <Button variant="primary" size="sm" onClick={() => handleShowEdit(dc)} title="Edit">
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(dc.id)} title="Delete">
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                      <Button variant="success" size="sm" onClick={() => handleApprove(dc.id)} title="Approve">
                        <i className="ri-check-line"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Edit/Update Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit/Update Delivery Challan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">DC No</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.dcNo || ''}
                  readOnly
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">DC Date</Form.Label>
                <Form.Control
                  type="date"
                  value={editFormData.dcDate || ''}
                  readOnly
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Customer Name</Form.Label>
                <Form.Select
                  value={editFormData.customerName || ''}
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
                  name="orderDeliveryDate"
                  value={editFormData.orderDeliveryDate || ''}
                  onChange={handleEditFormChange}
                  className={`form-control form-control-sm ${validationErrors.orderDeliveryDate ? 'is-invalid' : ''}`}
                  required
                />
                 {validationErrors.orderDeliveryDate && (
                  <div className="invalid-feedback">{validationErrors.orderDeliveryDate}</div>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Order No</Form.Label>
                <Form.Select
                  value={editFormData.orderNo || ''}
                  onChange={handleOrderChange}
                  className={`form-control form-control-sm ${validationErrors.orderNo ? 'is-invalid' : ''}`}
                  required
                  disabled={!editFormData.customerName}
                >
                  <option value="">Select Order</option>
                  {(mockOrdersByCustomer[editFormData.customerName] || []).map(order => (
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
                  value={editFormData.orderDate || ''}
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
                <span></span> {/* For the remove button */}
              </div>
              {editFormData.products?.map((product, index) => {
                // Filter available products based on selected order and exclude already selected products in other rows
                const selectedProductIds = editFormData.products.filter((_, i) => i !== index).map(p => p.productId);
                let availableProducts = (mockProductsByOrder[editFormData.orderNo] || []).filter(p => !selectedProductIds.includes(p.id));

                // Further filter by product search input
                const searchText = productSearch[index] || '';
                if (searchText) {
                  availableProducts = availableProducts.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()));
                }

                // Find the full product details for the currently selected product in the row
                const currentProductDetails = mockProductsByOrder[editFormData.orderNo]?.find(p => p.id === product.productId);

                return (
                  <div key={index} className="dc-product-row">
                    <input type="text" value={product.srNo} readOnly className="dc-input dc-srno" />
                    <div style={{ position: 'relative' }} ref={el => dropdownRefs.current[index] = el}>
                      <input
                        className={`dc-input ${validationErrors[`product_${index}_name`] ? 'is-invalid' : ''}`}
                        type="text"
                        value={product.productName || (searchText ? searchText : '')}
                        placeholder="Search Product"
                        onChange={e => {
                          setProductSearch(prev => ({ ...prev, [index]: e.target.value }));
                          setShowDropdown(prev => ({ ...prev, [index]: true }));
                          handleProductChange(index, 'productName', e.target.value); // Update product name directly for search input
                          handleProductChange(index, 'productId', ''); // Clear product ID when typing
                           // Clear product name validation error when typing
                           if (validationErrors[`product_${index}_name`]) {
                            setValidationErrors(prev => ({
                              ...prev,
                              [`product_${index}_name`]: null
                            }));
                           }
                        }}
                        onFocus={() => setShowDropdown(prev => ({ ...prev, [index]: true }))}
                        autoComplete="off"
                        disabled={!editFormData.orderNo}
                        required
                      />
                       {validationErrors[`product_${index}_name`] && (
                          <div className="invalid-feedback d-block">{validationErrors[`product_${index}_name`]}</div>
                       )}
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
                     {/* Display brandName and packSize based on the selected product ID */}
                    <input type="text" value={currentProductDetails?.brand || product.brandName || ''} className="dc-input" readOnly />
                    <input type="text" value={currentProductDetails?.packSize || product.packSize || ''} className="dc-input dc-packsize" readOnly />
                    {/* Display ordered and pending quantity based on the selected product ID */}
                    <input type="number" value={currentProductDetails?.orderedQty || product.orderedQuantity || ''} className="dc-input" readOnly />
                    <input type="number" value={currentProductDetails?.orderedQty || product.pendingQuantity || ''} className="dc-input" readOnly />

                    <div className="dc-qty-col">
                      <input type="number" value={product.quantity} onChange={e => handleProductChange(index, 'quantity', e.target.value)} className={`dc-input dc-qty ${validationErrors[`product_${index}_quantity`] ? 'is-invalid' : ''}`} required max={currentProductDetails?.orderedQty || product.pendingQuantity || ''} />
                      {validationErrors[`product_${index}_quantity`] && (
                        <div className="invalid-feedback d-block">{validationErrors[`product_${index}_quantity`]}</div>
                      )}
                    </div>
                    <button type="button" className="btn btn-danger btn-sm dc-remove-btn" onClick={() => removeProductRow(index)} disabled={editFormData.products.length === 1}>&ndash;</button>
                  </div>
                );
              })}
              <Button
                variant="secondary"
                className="mb-3 btn-sm dc-add-btn"
                onClick={addProductRow}
                disabled={
                  !editFormData.orderNo || // Disable if no order is selected
                  (mockProductsByOrder[editFormData.orderNo] || []).length === editFormData.products?.length // Disable if all products for the order are added
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
                  name="comments"
                  value={editFormData.comments || ''}
                  onChange={handleEditFormChange}
                  placeholder="Enter any additional comments here..."
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>

            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseEditModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PendingApprovals; 