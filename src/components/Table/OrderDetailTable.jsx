import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Form, Button, Modal, Table, Alert } from 'react-bootstrap';
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
    product_name: "",
    productquantity: "",
    order: "",
    delivered_quantity: ""
  });
  const [orders, setOrders] = useState([]);
  const itemsPerPage = 10;
  const [showSearch, setShowSearch] = useState(false);
  const [orderDetailIdSearch, setOrderDetailIdSearch] = useState("");
  const [filterFields, setFilterFields] = useState({ 
    product_name: "", 
    order: ""
  });
  const filterFormRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
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

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/order/list/');
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
      product_name: orderDetail.product_name,
      productquantity: orderDetail.productquantity,
      order: orderDetail.order,
      delivered_quantity: orderDetail.delivered_quantity
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrderDetail(null);
    setEditForm({
      product_name: "",
      productquantity: "",
      order: "",
      delivered_quantity: ""
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put(
        `/orders/ordersdetail/update/${selectedOrderDetail.id}/`,
        editForm
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
      const response = await api.delete(`/orders/ordersdetail/delete/${orderDetailId}/`);

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
              <th scope="col">Product Quantity</th>
              <th scope="col">Order</th>
              <th scope="col">Delivered Quantity</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrderDetails.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No order details found</td>
              </tr>
            ) : (
              paginatedOrderDetails.map((detail) => (
                <tr key={detail.id}>
                  <td>{detail.id}</td>
                  <td>{detail.product_name}</td>
                  <td>{detail.productquantity}</td>
                  <td>{detail.order}</td>
                  <td>{detail.delivered_quantity}</td>
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
                <Form.Control
                  type="text"
                  name="product_name"
                  value={editForm.product_name}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                  minLength={1}
                />
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
                <Form.Label className="form-label small">Order</Form.Label>
                <Form.Select
                  name="order"
                  value={editForm.order}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                >
                  <option value="">Select Order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.id}
                    </option>
                  ))}
                </Form.Select>
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
        `}
      </style>
    </div>
  );
};

export default OrderDetailTable; 