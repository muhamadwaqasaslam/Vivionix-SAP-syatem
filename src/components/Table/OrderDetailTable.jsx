import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Form, Button, Modal, Table, Alert, ListGroup } from 'react-bootstrap';
import './EmployeeTable.css';
import api from '../../utils/api';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';

const OrderDetailTable = () => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredOrderDetails, setFilteredOrderDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [editForm, setEditForm] = useState({
    product_id: "",
    product_name: "",
    productquantity: "",
    order: "",
    delivered_quantity: "",
    productprice: "",
    total_price: "",
    deliverystatus: ""
  });
  const itemsPerPage = 10;
  const [showSearch, setShowSearch] = useState(false);
  const [orderDetailIdSearch, setOrderDetailIdSearch] = useState("");
  const [filterFields, setFilterFields] = useState({ 
    product_name: "", 
    order: ""
  });
  const filterFormRef = useRef(null);
  const [success, setSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [showOrderList, setShowOrderList] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrderDetails();
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/ordersdetail/');
      if (response.data) {
        setOrderDetails(response.data);
        setFilteredOrderDetails(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/list_all/');
      if (response.data) {
        setAvailableProducts(response.data);
      }
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

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

  const handleShowEditModal = (orderDetail) => {
    setSelectedOrderDetail(orderDetail);
    setEditForm({
      product_id: orderDetail.product_id,
      product_name: orderDetail.display_product_name,
      productquantity: orderDetail.productquantity,
      order: orderDetail.order,
      delivered_quantity: orderDetail.delivered_quantity,
      productprice: orderDetail.productprice,
      total_price: orderDetail.total_price,
      deliverystatus: orderDetail.deliverystatus
    });
    setProductSearchTerm(orderDetail.display_product_name);
    const selectedOrder = orders.find(order => order.order_id === orderDetail.order);
    if (selectedOrder) {
      setOrderSearchTerm(`${selectedOrder.order_id} - ${selectedOrder.customer_name}`);
    } else {
      setOrderSearchTerm(orderDetail.order);
    }
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrderDetail(null);
    setEditForm({
      product_id: "",
      product_name: "",
      productquantity: "",
      order: "",
      delivered_quantity: "",
      productprice: "",
      total_price: "",
      deliverystatus: ""
    });
    setProductSearchTerm('');
    setOrderSearchTerm('');
    setShowProductList(false);
    setShowOrderList(false);
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
      setFilterFields({ product_name: "", order: "" });
      setFilteredOrderDetails(orderDetails);
    }
  };

  const handleFilterFieldChange = (e) => {
    const { name, value } = e.target;
    setFilterFields((prev) => ({ ...prev, [name]: value }));
    
    const newFilters = { ...filterFields, [name]: value };
    const matched = orderDetails.filter((detail) =>
      (!newFilters.product_name || (detail.product_name && detail.product_name.toLowerCase().includes(newFilters.product_name.toLowerCase()))) &&
      (!newFilters.order || (detail.order && detail.order.toLowerCase().includes(newFilters.order.toLowerCase())))
    );
    setFilteredOrderDetails(matched);
  };

  const handleApplySearch = () => {
    const { product_name, order } = filterFields;
    if (!product_name && !order) {
      setFilteredOrderDetails(orderDetails);
    } else {
      const matched = orderDetails.filter((detail) =>
        (!product_name || (detail.product_name && detail.product_name.toLowerCase().includes(product_name.toLowerCase()))) &&
        (!order || (detail.order && detail.order.toLowerCase().includes(order.toLowerCase())))
      );
      setFilteredOrderDetails(matched);
    }
    setShowSearch(false);
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
      product.product_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product) => {
    setEditForm(prev => ({
      ...prev,
      product_id: product.id,
      product_name: product.product_name
    }));
    setProductSearchTerm(product.product_name);
    setShowProductList(false);
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
    setEditForm(prev => ({
      ...prev,
      order: order.order_id
    }));
    setOrderSearchTerm(`${order.order_id} - ${order.customer_name}`);
    setShowOrderList(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
  
      const payload = {
       
        product_name: editForm.product_name,
        productquantity: parseInt(editForm.productquantity),
        order: editForm.order,
        delivered_quantity: parseInt(editForm.delivered_quantity),
      };
    
  
      const response = await api.put(
        `/orders/ordersdetail/update/${selectedOrderDetail.id}`,
        payload
      );
  
      if (response.data) {
        setSuccess(true);
        setOrderDetails(prevDetails =>
          prevDetails.map(detail =>
            detail.id === selectedOrderDetail.id
              ? { ...detail, ...response.data }
              : detail
          )
        );
        handleCloseEditModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update order detail');
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteOrderDetail = async (orderDetailId) => {
    if (!window.confirm("Are you sure you want to delete this order detail?")) return;

    try {
      setLoading(true);
      const response = await api.delete(`/orders/ordersdetail/delete/${orderDetailId}`);

      if (response.status === 200 || response.status === 204) {
        setOrderDetails((prevDetails) => prevDetails.filter(d => d.id !== orderDetailId));
        setSuccess(true);
        setError(null);
      } else {
        throw new Error('Failed to delete order detail');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete order detail');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderDetailIdSearch = (e) => {
    const value = e.target.value;
    setOrderDetailIdSearch(value);
    if (value.trim() === "") {
      setFilteredOrderDetails(orderDetails);
    } else {
      const matched = orderDetails.filter((detail) =>
        detail.id && detail.id.toString().toLowerCase().includes(value.trim().toLowerCase())
      );
      setFilteredOrderDetails(matched);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.get('/orders/ordersdetail/');
      if (response.data) {
        setOrderDetails(response.data);
        setFilteredOrderDetails(response.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getDeliveryStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-success-transparent';
      case 'undelivered':
        return 'bg-warning-transparent';
      case 'in_transit':
        return 'bg-info-transparent';
      case 'failed':
        return 'bg-danger-transparent';
      default:
        return 'bg-secondary-transparent';
    }
  };

  const currentOrderDetails = (orderDetailIdSearch || showSearch || filteredOrderDetails.length > 0) ? filteredOrderDetails : orderDetails;
  const totalPages = Math.ceil(currentOrderDetails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrderDetails = currentOrderDetails.slice(startIndex, endIndex);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Order Details Management</h3>

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
            placeholder="Search by Order Detail ID..."
            value={orderDetailIdSearch}
            onChange={handleOrderDetailIdSearch}
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
                name="product_name"
                className="form-control search-input"
                placeholder="Product Name"
                value={filterFields.product_name}
                onChange={handleFilterFieldChange}
              />
              <input
                type="text"
                name="order"
                className="form-control search-input"
                placeholder="Order"
                value={filterFields.order}
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
              <th scope="col">ID</th>
              <th scope="col">Product Name</th>
              <th scope="col" className="text-center">Product Quantity</th>
              <th scope="col">Product Price</th>
              <th scope="col">Total Price</th>
              <th scope="col">Order</th>
              <th scope="col" className="text-center">Delivered Quantity</th>
              <th scope="col">Delivery Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrderDetails.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>No order details found</td>
              </tr>
            ) : (
              paginatedOrderDetails.map((detail) => (
                <tr key={detail.id}>
                  <td>{detail.id}</td>
                  <td>{detail.display_product_name}</td>
                  <td className='text-center'>{detail.productquantity}</td>
                  <td>{parseFloat(detail.productprice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>{parseFloat(detail.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>{detail.order}</td>
                  <td className="text-center">{detail.delivered_quantity}</td>
                  <td>
                    <span className={`badge ${getDeliveryStatusBadgeClass(detail.deliverystatus)}`}>
                      {detail.deliverystatus}
                    </span>
                  </td>
                  <td>
                    <div className="hstack gap-2 fs-15">
                      <button
                        className="btn btn-icon btn-sm btn-primary"
                        title="Edit"
                        onClick={() => handleShowEditModal(detail)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDeleteOrderDetail(detail.id)}
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

      {/* Edit Order Detail Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Order Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Order detail updated successfully!</Alert>}
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Name</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    placeholder="Search for a product..."
                    className="form-control form-control-sm"
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
                          {product.product_name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="productquantity"
                  value={editForm.productquantity}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  min={0}
                  max={4294967295}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Price</Form.Label>
                <Form.Control
                  type="text"
                  name="productprice"
                  value={editForm.productprice}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Total Price</Form.Label>
                <Form.Control
                  type="text"
                  value={parseFloat(editForm.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Order</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={orderSearchTerm}
                    onChange={handleOrderSearch}
                    placeholder="Search by Order ID or Customer Name..."
                    className="form-control form-control-sm"
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
                </div>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Delivered Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="delivered_quantity"
                  value={editForm.delivered_quantity}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  min={0}
                  max={4294967295}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Delivery Status</Form.Label>
                <Form.Control
                  type="text"
                  name="deliverystatus"
                  value={editForm.deliverystatus}
                  onChange={handleEditFormChange}
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
          .list-group-item {
            font-size: 0.75rem;
            padding: 0.35rem 0.5rem;
            cursor: pointer;
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

export default OrderDetailTable; 