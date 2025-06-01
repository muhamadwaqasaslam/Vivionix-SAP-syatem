import React, { useState, useEffect } from 'react';
import {  Row, Col, Form, Button, Modal, Alert } from 'react-bootstrap';
import './EmployeeTable.css';
import api from '../../utils/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const RepresentativeTable = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [registeredByName, setRegisteredByName] = useState('');
  const [editForm, setEditForm] = useState({
    name: "",
    deisgnation: "",
    email: "",
    contact_number: "",
    contact_number2: "",
    registered_by: "",
    vendor: "",
    visitingCard: null
  });
  const itemsPerPage = 10;
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await api.get('/vendors/list_all/');
        setVendors(response.data);
        setFilteredVendors(response.data);
      } catch (err) {
        setError('Failed to fetch vendors');
        console.error('Error fetching vendors:', err);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
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

    const userInfo = getUserInfo();
    
    if (userInfo.employee_name) {
      setRegisteredByName(userInfo.employee_name);
    } else if (userInfo.name) {
      setRegisteredByName(userInfo.name);
    }

    if (userInfo.employee_id) {
      setEditForm(prev => ({ ...prev, registered_by: userInfo.employee_id }));
    } else if (userInfo.id) {
      setEditForm(prev => ({ ...prev, registered_by: userInfo.id }));
    }
  }, []);

  const handleVendorSearch = (e) => {
    const searchTerm = e.target.value;
    setVendorSearchTerm(searchTerm);
    if (searchTerm.trim() === '') {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter(vendor =>
        vendor.vendorname.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendors(filtered);
    }
  };

  const handleVendorSelect = (vendor) => {
    setEditForm(prev => ({
      ...prev,
      vendor: vendor.vendorname
    }));
    setVendorSearchTerm('');
    setFilteredVendors(vendors);
  };

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        setLoading(true);
        const response = await api.get('/vendors/representatives/');
        if (response.data) {
          setRepresentatives(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch representatives');
      } finally {
        setLoading(false);
      }
    };

    fetchRepresentatives();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleShowEdit = (representative) => {
    setSelectedRepresentative(representative);
    setEditForm({
      name: representative.name,
      deisgnation: representative.deisgnation,
      email: representative.email,
      contact_number: representative.contact_number,
      contact_number2: representative.contact_number2,
      registered_by: representative.registered_by,
      vendor: representative.vendor_name,
      visitingCard: representative.visitingcard
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedRepresentative(null);
    setEditForm({
      name: "",
      deisgnation: "",
      email: "",
      contact_number: "",
      contact_number2: "",
      registered_by: "",
      vendor: "",
      visitingCard: null
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditForm(prev => ({
      ...prev,
      visitingCard: file
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setSuccessMessage('');

      const formData = new FormData();
      
      // Get user info for registered_by
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

      const userInfo = getUserInfo();
      let registeredById = userInfo.employee_id || userInfo.id;

      // Append all fields to FormData
      Object.keys(editForm).forEach(key => {
        if (key === 'visitingCard' && editForm[key]) {
          formData.append(key, editForm[key]);
        } else if (key === 'registered_by') {
          formData.append(key, registeredById);
        } else if (key !== 'visitingCard') {
          formData.append(key, editForm[key]);
        }
      });

      const response = await api.put(
        `/vendors/representatives/update/${selectedRepresentative.id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        setSuccess(true);
        setSuccessMessage('Representative updated successfully!');
        
        // Update the representatives list with the edited representative
        setRepresentatives(prevRepresentatives =>
          prevRepresentatives.map(rep =>
            rep.id === selectedRepresentative.id ? response.data : rep
          )
        );
        
        // Close the modal after a short delay to show the success message
        setTimeout(() => {
          handleCloseEditModal();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update representative');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this representative?')) {
      try {
        setLoading(true);
        const response = await api.delete(`/vendors/representatives/delete/${id}/`);

        if (response.status === 200 || response.status === 204) {
          setRepresentatives(prevRepresentatives =>
            prevRepresentatives.filter(rep => rep.id !== id)
          );
          setError(null);
        } else {
          throw new Error('Failed to delete representative');
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to delete representative');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredRepresentatives = representatives.filter(representative => {
    const searchLower = searchTerm.toLowerCase();
    return (
      representative.name.toLowerCase().includes(searchLower) ||
      representative.email.toLowerCase().includes(searchLower) ||
      representative.contact_number.includes(searchTerm) ||
      representative.vendor.toLowerCase().includes(searchLower) ||
      representative.deisgnation?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredRepresentatives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRepresentatives = filteredRepresentatives.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Representative Management</h3>
      
      <div className="table-header">
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search representatives..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table text-nowrap">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Designation</th>
              <th scope="col">Email</th>
              <th scope="col">Contact</th>
              <th scope="col">Alt. Contact</th>
              <th scope="col">Vendor</th>
              <th scope="col">Registered By</th>
              <th scope="col">Visiting Card</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRepresentatives.map((representative) => (
              <tr key={representative.id}>
                <td>{representative.id}</td>
                <td>{representative.name}</td>
                <td>
                  <span className="badge bg-info-transparent">
                    {representative.deisgnation || 'N/A'}
                  </span>
                </td>
                <td>{representative.email}</td>
                <td>{representative.contact_number}</td>
                <td>{representative.contact_number2 || 'N/A'}</td>
                <td>{representative.vendor_name}</td>
                <td>{representative.registered_by_name}</td>
                <td>
                  {representative.visitingcard ? (
                    <a 
                      href={representative.visitingcard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link btn-sm p-0"
                    >
                      {representative.visitingcard.split('/').pop()}
                    </a>
                  ) : (
                    <span className="text-muted">No card</span>
                  )}
                </td>
                <td>
                  <div className="hstack gap-2 fs-15">
                    <button 
                      className="btn btn-icon btn-sm btn-primary"
                      title="Edit"
                      onClick={() => handleShowEdit(representative)}
                      disabled={loading}
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      className="btn btn-icon btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDelete(representative.id)}
                      disabled={loading}
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

      <div className="pagination-container">
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Representative</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>{successMessage}</Alert>}
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="deisgnation"
                  value={editForm.deisgnation}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={editForm.contact_number}
                  onChange={(value) => handleEditFormChange({ target: { name: 'contact_number', value } })}
                  inputClass="form-control"
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number',
                    required: true
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Alternative Contact</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={editForm.contact_number2}
                  onChange={(value) => handleEditFormChange({ target: { name: 'contact_number2', value } })}
                  inputClass="form-control"
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number2'
                  }}
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Vendor</Form.Label>
                <div className="vendor-search-container" style={{ position: 'relative' }}>
                  <Form.Control
                    type="text"
                    placeholder="Search vendor..."
                    value={vendorSearchTerm}
                    onChange={handleVendorSearch}
                    className="form-control form-control-sm"
                  />
                  {vendorSearchTerm && filteredVendors.length > 0 && (
                    <div className="vendor-search-results" style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {filteredVendors.map(vendor => (
                        <div
                          key={vendor.vendor_id}
                          className="vendor-search-item"
                          onClick={() => handleVendorSelect(vendor)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            ':hover': {
                              backgroundColor: '#f8f9fa'
                            }
                          }}
                        >
                          {vendor.vendorname}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editForm.vendor && (
                  <div className="selected-vendor mt-1" style={{
                    padding: '4px 8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    Selected: {editForm.vendor}
                  </div>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  name="registered_by"
                  value={registeredByName}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Visiting Card</Form.Label>
                <Form.Control
                  type="file"
                  name="visitingCard"
                  onChange={handleEditFileChange}
                  className="form-control form-control-sm"
                />
                {editForm.visitingCard && (
                  <small className="text-muted">
                    Current file: {typeof editForm.visitingCard === 'string' 
                      ? editForm.visitingCard.split('/').pop() 
                      : editForm.visitingCard.name}
                  </small>
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
    </div>
  );
};

export default RepresentativeTable; 