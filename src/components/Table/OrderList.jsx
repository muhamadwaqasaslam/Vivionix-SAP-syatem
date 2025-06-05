import React, { useState, useEffect, useRef } from 'react';
import {  Row, Col, Form, Button, Modal, Alert, ListGroup } from 'react-bootstrap';
import './EmployeeTable.css';
import api from '../../utils/api';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderForProducts, setSelectedOrderForProducts] = useState(null);
  const [editForm, setEditForm] = useState({
    customer: '',
    order_delivery: '',
    GST: '',
    registered_by_id: '',
    registered_by_name: '',
    instructions: ''
  });
  const [customerMap, setCustomerMap] = useState({});
  const itemsPerPage = 10;
  const [showSearch, setShowSearch] = useState(false);
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const [filterFields, setFilterFields] = useState({
    customer: '',
    order_delivery: ''
  });
  const filterFormRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    product_name: '',
    productquantity: '',
    delivered_quantity: '',
    order: ''
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/orders/');
      if (response.data) {
        // Get user info for each order
        const ordersWithUserInfo = await Promise.all(response.data.map(async (order) => {
          try {
            const userResponse = await api.get(`/employees/employee/${order.registered_by_id}/`);
            return {
              ...order,
              registered_by_name: userResponse.data.employee_name || 'Unknown'
            };
          } catch (err) {
            console.error('Error fetching user info:', err);
            return {
              ...order,
              registered_by_name: 'Unknown'
            };
          }
        }));
        setOrders(ordersWithUserInfo);
        setFilteredOrders(ordersWithUserInfo);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
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
        setAvailableProducts(response.data);
      }
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleShowEditModal = (order) => {
    console.log('Order data:', order);
    setSelectedOrder(order);
    const userInfo = getUserInfo();
    setEditForm({
      customer: order.customer_name,
      order_delivery: formatDate(order.order_delivery),
      GST: order.GST,
      registered_by_id: userInfo.employee_id || '',
      registered_by_name: userInfo.employee_name || '',
      instructions: order.instructions || ''
    });
    setCustomerSearchTerm(order.customer_name);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrder(null);
    setEditForm({
      customer: '',
      order_delivery: '',
      GST: '',
      registered_by_id: '',
      registered_by_name: '',
      instructions: ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterIconClick = () => {
    setShowSearch((prev) => !prev);
    if (!showSearch) {
      setFilterFields({ customer: '', order_delivery: '' });
      setFilteredOrders(orders);
    }
  };

  const handleFilterFieldChange = (e) => {
    const { name, value } = e.target;
    setFilterFields((prev) => ({ ...prev, [name]: value }));

    const newFilters = { ...filterFields, [name]: value };
    const matched = orders.filter((order) =>
      (!newFilters.customer || (order.customer && order.customer.toLowerCase().includes(newFilters.customer.toLowerCase()))) &&
      (!newFilters.order_delivery || (order.order_delivery && order.order_delivery.includes(newFilters.order_delivery)))
    );
    setFilteredOrders(matched);
  };

  const handleApplySearch = () => {
    const { customer, order_delivery } = filterFields;
    if (!customer && !order_delivery) {
      setFilteredOrders(orders);
    } else {
      const matched = orders.filter((order) =>
        (!customer || (order.customer && order.customer.toLowerCase().includes(customer.toLowerCase()))) &&
        (!order_delivery || (order.order_delivery && order.order_delivery.includes(order_delivery)))
      );
      setFilteredOrders(matched);
    }
    setShowSearch(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Updating order:', selectedOrder.order_id);

      // Prepare payload according to Swagger documentation
      const updatePayload = {
        data: {
          customers: editForm.customer,
          order_delivery: editForm.order_delivery,
          GST: editForm.GST,
          registered_by_id: editForm.registered_by_id,
          orderdetails: selectedOrder.orderdetails.map(detail => ({
            product_name: detail.product_name,
            productquantity: parseInt(detail.productquantity) || 0,
            delivered_quantity: parseInt(detail.delivered_quantity) || 0,
          }))
        }
      };

      console.log('Update payload:', updatePayload);

      const response = await api.put(
        `/orders/orders/update/${selectedOrder.order_id}`,
        updatePayload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', response);
      if (response.data) {
        setSuccess(true);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.order_id === selectedOrder.order_id
              ? {
                ...order,
                customer_name: editForm.customer,
                order_delivery: editForm.order_delivery,
                GST: editForm.GST,
                registered_by_id: editForm.registered_by_id,
                orderdetails: updatePayload.data.orderdetails
              }
              : order
          )
        );
        handleCloseEditModal();
      }
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      setLoading(true);
      const response = await api.delete(`/orders/orders/${orderId}/`);

      if (response.status === 200 || response.status === 204) {
        setOrders((prevOrders) => prevOrders.filter(o => o.order_id !== orderId));
        setSuccess(true);
        setError(null);
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (err) {
      console.error('Delete error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to delete order');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderIdSearch = (e) => {
    const value = e.target.value;
    setOrderIdSearch(value);
    if (value.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const matched = orders.filter((order) =>
        order.id && order.id.toString().toLowerCase().includes(value.trim().toLowerCase())
      );
      setFilteredOrders(matched);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.get('/orders/orders/');
      if (response.data) {
        setOrders(response.data);
        setFilteredOrders(response.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShowProductModal = (order) => {
    setSelectedOrderForProducts(order);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedOrderForProducts(null);
  };

  const handleShowAddProduct = () => {
    setShowProductModal(false);
    setProductForm({
      product_name: '',
      productquantity: '',
      delivered_quantity: '',
      order: selectedOrderForProducts.order_id
    });
    setProductSearchTerm('');
    setShowAddProductModal(true);
  };

  const handleCloseAddProductModal = () => {
    setShowAddProductModal(false);
    setProductForm({
      product_name: '',
      productquantity: '',
      delivered_quantity: '',
      order: ''
    });
    setProductSearchTerm('');
    setShowProductList(false);
  };

  const handleShowEditProduct = (product) => {
    setShowProductModal(false);
    setSelectedProduct(product);
    setProductForm({
      product_name: product.display_product_name,
      productquantity: product.productquantity,
      delivered_quantity: product.delivered_quantity,
      order: selectedOrderForProducts.order_id
    });
    setProductSearchTerm(product.display_product_name);
    setShowEditProductModal(true);
  };

  const handleCloseEditProductModal = () => {
    setShowEditProductModal(false);
    setSelectedProduct(null);
    setProductForm({
      product_name: '',
      productquantity: '',
      delivered_quantity: '',
      order: ''
    });
    setProductSearchTerm('');
    setShowProductList(false);
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductSearch = (e) => {
    const value = e.target.value;
    setProductSearchTerm(value);
    setShowProductList(true);

    if (value.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const filtered = availableProducts.filter(product =>
      product.product_names.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product) => {
    setProductForm(prev => ({
      ...prev,
      product_name: product.product_names
    }));
    setProductSearchTerm(product.product_names);
    setShowProductList(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!productForm.product_name.trim()) {
      errors.product_name = 'Product name is required';
    }

    if (!productForm.order) {
      errors.order = 'Order is required';
    }

    if (productForm.productquantity) {
      const quantity = parseInt(productForm.productquantity);
      if (isNaN(quantity) || quantity < 0 || quantity > 4294967295) {
        errors.productquantity = 'Product quantity must be between 0 and 4294967295';
      }
    }

    if (productForm.delivered_quantity) {
      const delivered = parseInt(productForm.delivered_quantity);
      if (isNaN(delivered) || delivered < 0 || delivered > 4294967295) {
        errors.delivered_quantity = 'Delivered quantity must be between 0 and 4294967295';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/orders/ordersdetail/create', productForm);

      if (response.data) {
        setSuccess(true);
        // Update the order's products list
        setSelectedOrderForProducts(prev => ({
          ...prev,
          orderdetails: [...prev.orderdetails, response.data]
        }));
        handleCloseAddProductModal();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create order detail');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.put(
        `/orders/ordersdetail/update/${selectedProduct.id}/`,
        productForm
      );

      if (response.data) {
        setSuccess(true);
        // Update the product in the list
        setSelectedOrderForProducts(prev => ({
          ...prev,
          orderdetails: prev.orderdetails.map(p =>
            p.id === selectedProduct.id ? response.data : p
          )
        }));
        handleCloseEditProductModal();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      const response = await api.delete(
        `/orders/orders/${selectedOrderForProducts.order_id}/delete_product/${productId}/`
      );

      if (response.status === 200 || response.status === 204) {
        setSuccess(true);
        // Remove the product from the list
        setSelectedOrderForProducts(prev => ({
          ...prev,
          orderdetails: prev.orderdetails.filter(p => p.id !== productId)
        }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'saved':
        return 'bg-success-transparent';
      case 'pending':
        return 'bg-warning-transparent';
      case 'processing':
        return 'bg-info-transparent';
      case 'completed':
        return 'bg-success-transparent';
      case 'cancelled':
        return 'bg-danger-transparent';
      default:
        return 'bg-secondary-transparent';
    }
  };

  const getDeliveryStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-success-transparent';
      case 'pending':
        return 'bg-warning-transparent';
      case 'in_transit':
        return 'bg-info-transparent';
      case 'failed':
        return 'bg-danger-transparent';
      default:
        return 'bg-secondary-transparent';
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
    setEditForm(prev => ({
      ...prev,
      customer: customer.Companyname
    }));
    setCustomerSearchTerm(customer.Companyname);
    setShowCustomerList(false);
  };

  const currentOrders = (orderIdSearch || showSearch || filteredOrders.length > 0) ? filteredOrders : orders;
  const totalPages = Math.ceil(currentOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = currentOrders.slice(startIndex, endIndex);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Orders Management</h3>

      <div className="table-header">
        <div className="search-container" style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          flexWrap: 'nowrap',
          gap: '8px'
        }}>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by Order ID..."
            value={orderIdSearch}
            onChange={handleOrderIdSearch}
            style={{
              marginRight: '8px',
              '@media (max-width: 576px)': {
                width: '100%',
                marginRight: '0'
              }
            }}
          />
          <Button
            variant="outline-secondary"
            onClick={handleFilterIconClick}
            style={{
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RiFilter3Line size={20} />
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handleRefresh}
            style={{
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Refresh Table"
            disabled={isRefreshing}
          >
            <RiRefreshLine
              size={20}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                transformOrigin: 'center'
              }}
            />
          </Button>
          {showSearch && (
            <div
              ref={filterFormRef}
              className="filter-dropdown"
            >
              <input
                type="text"
                name="customer"
                className="form-control search-input"
                placeholder="Customer"
                value={filterFields.customer}
                onChange={handleFilterFieldChange}
              />
              <input
                type="date"
                name="order_delivery"
                className="form-control search-input"
                placeholder="Delivery Date"
                value={filterFields.order_delivery}
                onChange={handleFilterFieldChange}
              />
              <Button variant="primary" onClick={handleApplySearch} style={{ width: '100%' }}>
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table text-nowrap">
          <thead>
            <tr>
              <th scope="col">Order ID</th>
              <th scope="col" className='text-center'>Customer</th>
              <th scope="col">Created At</th>
              <th scope="col">Delivery Date</th>
              <th scope="col">Total Price</th>
              <th scope="col">GST (%)</th>
              <th scope="col">Total with GST</th>
              <th scope="col">Status</th>
              <th scope="col">Delivery Status</th>
              <th scope="col">Registered By</th>
              <th scope="col">Instructions</th>
              <th scope="col">Products</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="13" style={{ textAlign: 'center' }}>No orders found</td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td className='text-center'>{order.customer_name}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>{formatDate(order.order_delivery)}</td>
                  <td>{parseFloat(order.totalprice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>{order.GST}%</td>
                  <td>{parseFloat(order.totalpricewithgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getDeliveryStatusBadgeClass(order.deliverystatus)}`}>
                      {order.deliverystatus}
                    </span>
                  </td>
                  <td>{order.registered_by_name}</td>
                  <td>{order.instructions}</td>
                  <td>
                    {order.orderdetails && order.orderdetails.length > 0 ? (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleShowProductModal(order)}
                      >
                        View ({order.orderdetails.length})
                      </button>
                    ) : (
                      <span className="text-muted">No Products</span>
                    )}
                  </td>
                  <td>
                    <div className="hstack gap-2 fs-15">
                      <button
                        className="btn btn-icon btn-sm btn-primary"
                        title="Edit"
                        onClick={() => handleShowEditModal(order)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDeleteOrder(order.order_id)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Edit Order Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Order updated successfully!</Alert>}
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Order ID</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedOrder?.order_id || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Created At</Form.Label>
                <Form.Control
                  type="text"
                  value={formatDate(selectedOrder?.created_at) || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Customer</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={customerSearchTerm}
                    onChange={handleCustomerSearch}
                    placeholder="Search for a customer..."
                    className="form-control form-control-sm"
                    required
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
                </div>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Delivery Date</Form.Label>
                <Form.Control
                  type="date"
                  name="order_delivery"
                  value={editForm.order_delivery}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Total Price</Form.Label>
                <Form.Control
                  type="text"
                  value={`₹${parseFloat(selectedOrder?.totalprice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">GST (%)</Form.Label>
                <Form.Control
                  type="text"
                  name="GST"
                  value={editForm.GST}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                  minLength={1}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Total with GST</Form.Label>
                <Form.Control
                  type="text"
                  value={`₹${parseFloat(selectedOrder?.totalpricewithgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  value={`${editForm.registered_by_id} - ${editForm.registered_by_name}`}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Status</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedOrder?.status || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Delivery Status</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedOrder?.deliverystatus || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Instructions</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedOrder?.instructions || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseEditModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Product Information Modal */}
      <Modal show={showProductModal} onHide={handleCloseProductModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Product Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : selectedOrderForProducts && (
            <div className="table-responsive">
              <table className="table text-nowrap">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Order ID</th>
                    <th scope="col">Product Name</th>
                    <th scope="col" className="text-center">Product Quantity</th>
                    <th scope="col">Product Price</th>
                    <th scope="col">Total Price</th>
                    <th scope="col" className="text-center">Delivered Quantity</th>
                    <th scope="col">Delivery Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderForProducts.orderdetails.map((product, index) => (
                    <tr key={index}>
                      <td>{product.id}</td>
                      <td>{product.order}</td>
                      <td>{product.display_product_name}</td>
                      <td className="text-center">{product.productquantity}</td>
                      <td>₹{parseFloat(product.productprice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>₹{parseFloat(product.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">{product.delivered_quantity}</td>
                      <td>
                        <span className={`badge ${getDeliveryStatusBadgeClass(product.deliverystatus)}`}>
                          {product.deliverystatus}
                        </span>
                      </td>
                      <td>
                        <div className="hstack gap-2 fs-15">
                          <button
                            className="btn btn-icon btn-sm btn-primary"
                            title="Edit"
                            onClick={() => handleShowEditProduct(product)}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            className="btn btn-icon btn-sm btn-danger"
                            title="Delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" className="ms-3" onClick={handleShowAddProduct}>
            Add Product
          </Button>
          <Button variant="secondary" onClick={handleCloseProductModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal */}
      <Modal show={showAddProductModal} onHide={handleCloseAddProductModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Product added successfully!</Alert>}
          <Form onSubmit={handleAddProduct}>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Order ID</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedOrderForProducts?.order_id || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Product Name</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    placeholder="Search for a product..."
                    className={`form-control form-control-sm ${validationErrors.product_name ? 'is-invalid' : ''}`}
                    required
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
                          {product.product_names}
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
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="productquantity"
                  value={productForm.productquantity}
                  onChange={handleProductFormChange}
                  className={`form-control form-control-sm ${validationErrors.productquantity ? 'is-invalid' : ''}`}
                  min="0"
                  required
                />
                {validationErrors.productquantity && (
                  <div className="invalid-feedback">{validationErrors.productquantity}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Delivered Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="delivered_quantity"
                  value={productForm.delivered_quantity}
                  onChange={handleProductFormChange}
                  className={`form-control form-control-sm ${validationErrors.delivered_quantity ? 'is-invalid' : ''}`}
                  min="0"
                  required
                />
                {validationErrors.delivered_quantity && (
                  <div className="invalid-feedback">{validationErrors.delivered_quantity}</div>
                )}
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseAddProductModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={showEditProductModal} onHide={handleCloseEditProductModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Product updated successfully!</Alert>}
          <Form onSubmit={handleEditProduct}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">ID</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct?.id || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Order ID</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedOrderForProducts?.order_id || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Product Name</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    placeholder="Search for a product..."
                    className={`form-control form-control-sm ${validationErrors.product_name ? 'is-invalid' : ''}`}
                    required
                    disabled
                    readOnly
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
                          {product.product_names}
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
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Price</Form.Label>
                <Form.Control
                  type="text"
                  value={`₹${parseFloat(selectedProduct?.productprice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Total Price</Form.Label>
                <Form.Control
                  type="text"
                  value={`₹${parseFloat(selectedProduct?.total_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="productquantity"
                  value={productForm.productquantity}
                  onChange={handleProductFormChange}
                  className={`form-control form-control-sm ${validationErrors.productquantity ? 'is-invalid' : ''}`}
                  min="0"
                  required
                />
                {validationErrors.productquantity && (
                  <div className="invalid-feedback">{validationErrors.productquantity}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Delivered Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="delivered_quantity"
                  value={productForm.delivered_quantity}
                  onChange={handleProductFormChange}
                  className={`form-control form-control-sm ${validationErrors.delivered_quantity ? 'is-invalid' : ''}`}
                  min="0"
                  required
                />
                {validationErrors.delivered_quantity && (
                  <div className="invalid-feedback">{validationErrors.delivered_quantity}</div>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Delivery Status</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct?.deliverystatus || ''}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseEditProductModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
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
          .badge {
            padding: 0.5em 0.75em;
            font-weight: 500;
            border-radius: 4px;
          }
          .bg-success-transparent {
            background-color: rgba(40, 167, 69, 0.1);
            color: #28a745;
          }
          .bg-warning-transparent {
            background-color: rgba(255, 193, 7, 0.1);
            color: #ffc107;
          }
          .bg-info-transparent {
            background-color: rgba(23, 162, 184, 0.1);
            color: #17a2b8;
          }
          .bg-danger-transparent {
            background-color: rgba(220, 53, 69, 0.1);
            color: #dc3545;
          }
          .bg-secondary-transparent {
            background-color: rgba(108, 117, 125, 0.1);
            color: #6c757d;
          }
        `}
      </style>
    </div>
  );
};

export default OrderList; 