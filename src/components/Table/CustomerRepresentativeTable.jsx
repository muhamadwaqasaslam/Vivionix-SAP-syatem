import React, { useState, useEffect, useRef } from 'react';
import {  Row, Col, Form, Button, Modal, Alert } from 'react-bootstrap';
import './EmployeeTable.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '../../utils/api';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';

const CustomerRepresentativeTable = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredRepresentatives, setFilteredRepresentatives] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [editForm, setEditForm] = useState({
    Contact_person_name: "",
    title: "",
    education: "",
    designation: "",
    qualification: "",
    Contact_person_email: "",
    Contact_person_number: "",
    customer: "",
    registered_by: "",
    CV: null
  });
  const [customers, setCustomers] = useState([]);
  const itemsPerPage = 10;
  const [showSearch, setShowSearch] = useState(false);
  const [representativeIdSearch, setRepresentativeIdSearch] = useState("");
  const [filterFields, setFilterFields] = useState({ 
    Contact_person_name: "",
    email: "", 
    customer: "",
    registered_by: "" 
  });
  const filterFormRef = useRef(null);
  const [registeredByName, setRegisteredByName] = useState("");
  const [success, setSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getUserInfo = () => {
    try {
      const sessionUser = sessionStorage.getItem('user');
      if (sessionUser) {
        const userData = JSON.parse(sessionUser);
        return userData;
      }

      const localUser = localStorage.getItem('user');
      if (localUser) {
        const userData = JSON.parse(localUser);
        return userData;
      }

      return {
        employee_id: 'default_id',
        employee_name: 'default_user',
        email: 'default@example.com'
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return {
        employee_id: 'default_id',
        employee_name: 'default_user',
        email: 'default@example.com'
      };
    }
  };

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        setLoading(true);
        const response = await api.get('/customers/representative/list/');
        if (response.data) {
          setRepresentatives(response.data);
          setFilteredRepresentatives(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch representatives');
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

    const userInfo = getUserInfo();
    
    if (userInfo.employee_name) {
      setRegisteredByName(userInfo.employee_name);
    } else if (userInfo.name) {
      setRegisteredByName(userInfo.name);
    }

    fetchRepresentatives();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!showSearch) return;
    function handleClickOutside(event) {
      if (filterFormRef.current && !filterFormRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  const handleShowEditModal = (representative) => {
    setSelectedRepresentative(representative);
    setEditForm({
      Contact_person_name: representative.Contact_person_name,
      title: representative.title,
      education: representative.education,
      designation: representative.designation,
      qualification: representative.qualification,
      Contact_person_email: representative.Contact_person_email,
      Contact_person_number: representative.Contact_person_number,
      customer: representative.customer_name,
      CV: null
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedRepresentative(null);
    setEditForm({
      Contact_person_name: "",
      title: "",
      education: "",
      designation: "",
      qualification: "",
      Contact_person_email: "",
      Contact_person_number: "",
      customer: "",
      registered_by: "",
      CV: null
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
      setFilterFields({ 
        Contact_person_name: "",
        email: "", 
        customer: "", 
        registered_by: "" 
      });
      setFilteredRepresentatives(representatives);
    }
  };

  const handleFilterFieldChange = (e) => {
    const { name, value } = e.target;
    setFilterFields((prev) => ({ ...prev, [name]: value }));
    
    const newFilters = { ...filterFields, [name]: value };
    const matched = representatives.filter((representative) =>
      (!newFilters.Contact_person_name || (representative.Contact_person_name && representative.Contact_person_name.toLowerCase().includes(newFilters.Contact_person_name.toLowerCase()))) &&
      (!newFilters.email || (representative.Contact_person_email && representative.Contact_person_email.toLowerCase().includes(newFilters.email.toLowerCase()))) &&
      (!newFilters.customer || (representative.customer_name && representative.customer_name.toLowerCase().includes(newFilters.customer.toLowerCase()))) &&
      (!newFilters.registered_by || (representative.registered_by && representative.registered_by.toLowerCase().includes(newFilters.registered_by.toLowerCase())))
    );
    setFilteredRepresentatives(matched);
  };

  const handleApplySearch = () => {
    const { Contact_person_name, email, customer, registered_by } = filterFields;
    if (!Contact_person_name && !email && !customer && !registered_by) {
      setFilteredRepresentatives(representatives);
    } else {
      const matched = representatives.filter((representative) =>
        (!Contact_person_name || (representative.Contact_person_name && representative.Contact_person_name.toLowerCase().includes(Contact_person_name.toLowerCase()))) &&
        (!email || (representative.Contact_person_email && representative.Contact_person_email.toLowerCase().includes(email.toLowerCase()))) &&
        (!customer || (representative.customer_name && representative.customer_name.toLowerCase().includes(customer.toLowerCase()))) &&
        (!registered_by || (representative.registered_by && representative.registered_by.toLowerCase().includes(registered_by.toLowerCase())))
      );
      setFilteredRepresentatives(matched);
    }
    setShowSearch(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should not exceed 5MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setError('Only PDF and Word documents are allowed');
        return;
      }
      setEditForm(prev => ({
        ...prev,
        CV: file
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Get current user info
      const currentUser = getUserInfo();
      
      // Get customer name from the selected customer
      const selectedCustomer = customers.find(c => c.Customer_id === editForm.customer);
      const customerName = selectedCustomer ? selectedCustomer.Companyname : '';
      
      // Append all form fields to FormData
      Object.keys(editForm).forEach(key => {
        if (key === 'CV' && editForm[key]) {
          formData.append(key, editForm[key]);
        } else if (key === 'customer') {
          formData.append('Customer_name', customerName);
        } else if (key !== 'CV') {
          formData.append(key, editForm[key]);
        }
      });

      // Add registered_by from current user
      formData.append('registered_by', currentUser.employee_id);

      const response = await api.put(
        `/customers/representative/update/${selectedRepresentative.id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        setSuccess(true);
        setRepresentatives(prevRepresentatives =>
          prevRepresentatives.map(representative =>
            representative.id === selectedRepresentative.id
              ? { ...representative, ...response.data }
              : representative
          )
        );
        handleCloseEditModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update representative');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepresentative = async (representativeId) => {
    if (!window.confirm("Are you sure you want to delete this representative?")) return;

    try {
      setLoading(true);
      const response = await api.delete(`/customers/representative/delete/${representativeId}/`);

      if (response.status === 200 || response.status === 204) {
        setRepresentatives((prevRepresentatives) => prevRepresentatives.filter(r => r.id !== representativeId));
        setSuccess(true);
        setError(null);
      } else {
        throw new Error('Failed to delete representative');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete representative');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRepresentativeIdSearch = (e) => {
    const value = e.target.value;
    setRepresentativeIdSearch(value);
    if (value.trim() === "") {
      setFilteredRepresentatives(representatives);
    } else {
      const matched = representatives.filter((representative) =>
        representative.id && representative.id.toString().toLowerCase().includes(value.trim().toLowerCase())
      );
      setFilteredRepresentatives(matched);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.Customer_id === customerId);
    return customer ? customer.Companyname : 'Unknown Customer';
  };

  const currentRepresentatives = (representativeIdSearch || showSearch || filteredRepresentatives.length > 0) ? filteredRepresentatives : representatives;
  const totalPages = Math.ceil(currentRepresentatives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRepresentatives = currentRepresentatives.slice(startIndex, endIndex);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.get('/customers/representative/list/');
      if (response.data) {
        setRepresentatives(response.data);
        setFilteredRepresentatives(response.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Customer Representative Management</h3>

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
            placeholder="Search by Representative ID..."
            value={representativeIdSearch}
            onChange={handleRepresentativeIdSearch}
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
                name="Contact_person_name"
                className="form-control search-input"
                placeholder="Contact Person Name"
                value={filterFields.Contact_person_name}
                onChange={handleFilterFieldChange}
              />
              <input
                type="text"
                name="email"
                className="form-control search-input"
                placeholder="Email"
                value={filterFields.email}
                onChange={handleFilterFieldChange}
              />
              <input
                type="text"
                name="customer"
                className="form-control search-input"
                placeholder="Customer Name"
                value={filterFields.customer}
                onChange={handleFilterFieldChange}
              />
              <input
                type="text"
                name="registered_by"
                className="form-control search-input"
                placeholder="Registered By"
                value={filterFields.registered_by}
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
              <th scope="col">Contact Person</th>
              <th scope="col">Title</th>
              <th scope="col">Education</th>
              <th scope="col">Designation</th>
              <th scope="col">Qualification</th>
              <th scope="col">Email</th>
              <th scope="col">Contact</th>
              <th scope="col">Customer</th>
              <th scope="col">Registered By</th>
              <th scope="col">CV</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRepresentatives.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center' }}>No representatives found</td>
              </tr>
            ) : (
              paginatedRepresentatives.map((representative) => (
                <tr key={representative.id}>
                  <td>{representative.id}</td>
                  <td>{representative.Contact_person_name}</td>
                  <td>{representative.title || '-'}</td>
                  <td>{representative.education || '-'}</td>
                  <td>{representative.designation || '-'}</td>
                  <td>{representative.qualification || '-'}</td>
                  <td>{representative.Contact_person_email}</td>
                  <td>{representative.Contact_person_number}</td>
                  <td>{representative.customer_name}</td>
                  <td>{representative.registered_by}</td>
                  <td>
                    {representative.CV ? (
                      <a 
                        href={representative.CV} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-link"
                      >
                        View CV
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="hstack gap-2 fs-15">
                      <button
                        className="btn btn-icon btn-sm btn-primary"
                        title="Edit"
                        onClick={() => handleShowEditModal(representative)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDeleteRepresentative(representative.id)}
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

      {/* Edit Representative Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Representative</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Representative updated successfully!</Alert>}
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="Contact_person_name"
                  value={editForm.Contact_person_name}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                  maxLength={15}
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  maxLength={100}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Education</Form.Label>
                <Form.Control
                  type="text"
                  name="education"
                  value={editForm.education}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  maxLength={100}
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={editForm.designation}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  maxLength={100}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Qualification</Form.Label>
                <Form.Control
                  type="text"
                  name="qualification"
                  value={editForm.qualification}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  maxLength={100}
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="Contact_person_email"
                  value={editForm.Contact_person_email}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                  maxLength={254}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={editForm.Contact_person_number}
                  onChange={(value) => handleEditFormChange({ target: { name: 'Contact_person_number', value } })}
                  inputClass="form-control"
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'Contact_person_number',
                    required: true,
                    maxLength: 15
                  }}
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Customer</Form.Label>
                <Form.Select
                  name="customer"
                  value={editForm.customer}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.Customer_id} value={customer.Customer_id}>
                      {customer.Companyname}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  value={registeredByName}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">CV</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  className="form-control form-control-sm"
                  accept=".pdf,.doc,.docx"
                />
                <small className="text-muted">Accepted formats: PDF, DOC, DOCX (max 5MB)</small>
                {selectedRepresentative?.CV && (
                  <div className="mt-1">
                    <a 
                      href={selectedRepresentative.CV} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-link p-0"
                    >
                      View Current CV
                    </a>
                  </div>
                )}
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

export default CustomerRepresentativeTable; 