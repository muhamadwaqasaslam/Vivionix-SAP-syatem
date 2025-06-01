import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Form, Button, Modal, Table, Alert } from 'react-bootstrap';
import './EmployeeTable.css';
import api from '../../utils/api';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';

const CustomerProductTable = () => {
  const [customerProducts, setCustomerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCustomerProducts, setFilteredCustomerProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomerProduct, setSelectedCustomerProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    product_names: "",
    productprice: "",
    customer: ""
  });
  const [customers, setCustomers] = useState([]);
  const itemsPerPage = 10;
  const [showSearch, setShowSearch] = useState(false);
  const [customerProductIdSearch, setCustomerProductIdSearch] = useState("");
  const [filterFields, setFilterFields] = useState({ 
    product_names: "", 
    customer: ""
  });
  const filterFormRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCustomerProducts();
    fetchCustomers();
  }, []);

  const fetchCustomerProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers/customer-product/list/');
      if (response.data) {
        setCustomerProducts(response.data);
        setFilteredCustomerProducts(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch customer products');
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

  const handleShowEditModal = (customerProduct) => {
    setSelectedCustomerProduct(customerProduct);
    setEditForm({
      product_names: customerProduct.product_names,
      productprice: customerProduct.productprice,
      customer: getCustomerName(customerProduct.customer)
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCustomerProduct(null);
    setEditForm({
      product_names: "",
      productprice: "",
      customer: ""
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
      setFilterFields({ product_names: "", customer: "" });
      setFilteredCustomerProducts(customerProducts);
    }
  };

  const handleFilterFieldChange = (e) => {
    const { name, value } = e.target;
    setFilterFields((prev) => ({ ...prev, [name]: value }));
    
    const newFilters = { ...filterFields, [name]: value };
    const matched = customerProducts.filter((product) =>
      (!newFilters.product_names || (product.product_names && product.product_names.toLowerCase().includes(newFilters.product_names.toLowerCase()))) &&
      (!newFilters.customer || (product.customer && product.customer.toString().includes(newFilters.customer)))
    );
    setFilteredCustomerProducts(matched);
  };

  const handleApplySearch = () => {
    const { product_names, customer } = filterFields;
    if (!product_names && !customer) {
      setFilteredCustomerProducts(customerProducts);
    } else {
      const matched = customerProducts.filter((product) =>
        (!product_names || (product.product_names && product.product_names.toLowerCase().includes(product_names.toLowerCase()))) &&
        (!customer || (product.customer && product.customer.toString().includes(customer)))
      );
      setFilteredCustomerProducts(matched);
    }
    setShowSearch(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put(
        `/customers/customer-product/update/${selectedCustomerProduct.id}/`,
        {
          ...editForm,
          customer: editForm.customer
        }
      );

      if (response.data) {
        setSuccess(true);
        setCustomerProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === selectedCustomerProduct.id
              ? { ...product, ...response.data }
              : product
          )
        );
        handleCloseEditModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update customer product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomerProduct = async (customerProductId) => {
    if (!window.confirm("Are you sure you want to delete this customer product?")) return;

    try {
      setLoading(true);
      const response = await api.delete(`/customers/customer-product/delete/${customerProductId}/`);

      if (response.status === 200 || response.status === 204) {
        setCustomerProducts((prevProducts) => prevProducts.filter(p => p.id !== customerProductId));
        setSuccess(true);
        setError(null);
      } else {
        throw new Error('Failed to delete customer product');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete customer product');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerProductIdSearch = (e) => {
    const value = e.target.value;
    setCustomerProductIdSearch(value);
    if (value.trim() === "") {
      setFilteredCustomerProducts(customerProducts);
    } else {
      const matched = customerProducts.filter((product) =>
        product.id && product.id.toString().toLowerCase().includes(value.trim().toLowerCase())
      );
      setFilteredCustomerProducts(matched);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.get('/customers/customer-product/list/');
      if (response.data) {
        setCustomerProducts(response.data);
        setFilteredCustomerProducts(response.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.Customer_id === customerId);
    return customer ? customer.Companyname : 'Unknown Customer';
  };

  const getCustomerDisplay = (customerId) => {
    const customer = customers.find(c => c.Customer_id === customerId);
    return customer ? customer.Companyname : 'Unknown Customer';
  };

  const currentCustomerProducts = (customerProductIdSearch || showSearch || filteredCustomerProducts.length > 0) ? filteredCustomerProducts : customerProducts;
  const totalPages = Math.ceil(currentCustomerProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomerProducts = currentCustomerProducts.slice(startIndex, endIndex);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Customer Products Management</h3>

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
            placeholder="Search by ID..."
            value={customerProductIdSearch}
            onChange={handleCustomerProductIdSearch}
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
                name="product_names"
                className="form-control search-input"
                placeholder="Product Name"
                value={filterFields.product_names}
                onChange={handleFilterFieldChange}
              />
              <input
                type="text"
                name="customer"
                className="form-control search-input"
                placeholder="Customer"
                value={filterFields.customer}
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
              <th scope="col">Product ID</th>
              <th scope="col">Product Name</th>
              <th scope="col">Product Price</th>
              <th scope="col">Customer</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomerProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No customer products found</td>
              </tr>
            ) : (
              paginatedCustomerProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.product}</td>
                  <td>{product.product_names}</td>
                  <td>{product.productprice}</td>
                  <td>{getCustomerDisplay(product.customer)}</td>
                  <td>
                    <div className="hstack gap-2 fs-15">
                      <button
                        className="btn btn-icon btn-sm btn-primary"
                        title="Edit"
                        onClick={() => handleShowEditModal(product)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDeleteCustomerProduct(product.id)}
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

      {/* Edit Customer Product Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Customer product updated successfully!</Alert>}
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="product_names"
                  value={editForm.product_names}
                  className="form-control form-control-sm"
                  readOnly
                  disabled
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Price</Form.Label>
                <Form.Control
                  type="number"
                  name="productprice"
                  value={editForm.productprice}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  step="0.01"
                  min="0"
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Customer</Form.Label>
                <Form.Control
                  type="text"
                  name="customer"
                  value={editForm.customer}
                  className="form-control form-control-sm"
                  readOnly
                  disabled
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

export default CustomerProductTable; 