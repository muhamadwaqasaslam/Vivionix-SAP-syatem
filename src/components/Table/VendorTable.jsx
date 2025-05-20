import React, { useState, useEffect, useRef } from 'react';
import { RiFilter3Line } from 'react-icons/ri';

import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import './EmployeeTable.css';

const VendorTable = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [showRepresentativeModal, setShowRepresentativeModal] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditRepresentativeModal, setShowEditRepresentativeModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editForm, setEditForm] = useState({
    category: "",
    type: "",
    capacity: "",
    Companyname: "",
    Companyemail: "",
    Company_phone_number: "",
    address: "",
    city: "",
    registered_by: "",
    productcatalog: null,
    iso: null,
    // Set the existing product catalog

  });
  const [editRepresentativeForm, setEditRepresentativeForm] = useState({
    name: "",
    designation: "",
    email: "",
    contact_number: "",
    contact_number2: "",
    registered_by: "",
    visitingCard: null
  });
  const [showAddRepresentativeModal, setShowAddRepresentativeModal] = useState(false);
  const itemsPerPage = 10;

  const [showSearch, setShowSearch] = useState(false);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");

  const [vendorIdSearch, setVendorIdSearch] = useState("");
  const [filterFields, setFilterFields] = useState({ name: "", email: "", type: "" });

  const filterFormRef = useRef(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://my.vivionix.com/vendors/list_all/');
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }
        const data = await response.json();
        setVendors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
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

  const handleShowRepresentative = (representative) => {
    setSelectedRepresentative(representative);
    setShowRepresentativeModal(true);
  };

  const handleCloseRepresentativeModal = () => {
    setShowRepresentativeModal(false);
    setSelectedRepresentative(null);
  };

  const handleShowEditModal = (vendor) => {
    setSelectedVendor(vendor);
    setEditForm({
      vendorname: vendor.vendorname,
      company_email: vendor.company_email,
      type: vendor.type,
      website: vendor.website,
      company_phone_number: vendor.company_phone_number,
      address: vendor.address,
      productcatalog: vendor.productcatalog, // Set the existing product catalog


    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedVendor(null);
    setEditForm({
      vendorname: '',
      company_email: '',
      type: '',
      website: '',
      company_phone_number: '',
      address: ''
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
    // Reset filter fields when opening the filter
    if (!showSearch) {
      setFilterFields({ name: "", email: "", type: "" });
      setFilteredVendors(vendors);
    }
  };

  const handleFilterFieldChange = (e) => {
    const { name, value } = e.target;
    setFilterFields((prev) => ({ ...prev, [name]: value }));
    
    // Apply real-time filtering as user types
    const newFilters = { ...filterFields, [name]: value };
    const matched = vendors.filter((vendor) =>
      (!newFilters.name || (vendor.vendorname && vendor.vendorname.toLowerCase().includes(newFilters.name.toLowerCase()))) &&
      (!newFilters.email || (vendor.company_email && vendor.company_email.toLowerCase().includes(newFilters.email.toLowerCase()))) &&
      (!newFilters.type || (vendor.type && vendor.type.toLowerCase().includes(newFilters.type.toLowerCase())))
    );
    setFilteredVendors(matched);
  };

  const handleApplySearch = () => {
    const { name, email, type } = filterFields;
    if (!name && !email && !type) {
      setFilteredVendors(vendors);
      setSearchTerm("");
    } else {
      const matched = vendors.filter((vendor) =>
        (!name || (vendor.vendorname && vendor.vendorname.toLowerCase().includes(name.toLowerCase()))) &&
        (!email || (vendor.company_email && vendor.company_email.toLowerCase().includes(email.toLowerCase()))) &&
        (!type || (vendor.type && vendor.type.toLowerCase().includes(type.toLowerCase())))
      );
      setFilteredVendors(matched);
      setSearchTerm(name || email || type);
    }
    setShowSearch(false);
  };



  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://my.vivionix.com/vendors/update/${selectedVendor.vendor_id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update vendor');
      }

      // Update the vendors list with the edited vendor
      setVendors(prevVendors =>
        prevVendors.map(vendor =>
          vendor.vendor_id === selectedVendor.vendor_id
            ? { ...vendor, ...editForm }
            : vendor
        )
      );

      handleCloseEditModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShowEditRepresentative = () => {
    setEditRepresentativeForm({
      name: selectedRepresentative.name,
      designation: selectedRepresentative.designation,
      email: selectedRepresentative.email,
      contact_number: selectedRepresentative.contact_number,
      contact_number2: selectedRepresentative.contact_number2,
      registered_by: selectedRepresentative.registered_by,
      visitingCard: selectedRepresentative.visitingcard
    });
    setShowEditRepresentativeModal(true);
  };

  const handleCloseEditRepresentativeModal = () => {
    setShowEditRepresentativeModal(false);
    setEditRepresentativeForm({
      name: "",
      designation: "",
      email: "",
      contact_number: "",
      contact_number2: "",
      registered_by: "",
      visitingCard: null
    });
  };

  const handleEditRepresentativeFormChange = (e) => {
    const { name, value } = e.target;
    setEditRepresentativeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditRepresentativeFileChange = (e) => {
    const file = e.target.files[0];
    setEditRepresentativeForm(prev => ({
      ...prev,
      visitingCard: file
    }));
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const accessToken = localStorage.getItem("access_token");

      const response = await fetch(`https://my.vivionix.com/vendors/delete/${vendorId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // Remove deleted vendor from UI
        setVendors((prevVendors) => prevVendors.filter(v => v.vendor_id !== vendorId));
        alert("Vendor deleted successfully.");
      } else {
        const errorText = await response.text();
        alert("Failed to delete vendor: " + errorText);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong while deleting.");
    }
  };


  const handleEditRepresentativeSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setVendors(prevVendors =>
        prevVendors.map(vendor => {
          if (vendor.representatives_name && vendor.representatives_name.length > 0) {
            const updatedRepresentatives = vendor.representatives_name.map(rep =>
              rep.id === selectedRepresentative.id
                ? { ...rep, ...editRepresentativeForm }
                : rep
            );
            return { ...vendor, representatives_name: updatedRepresentatives };
          }
          return vendor;
        })
      );
      handleCloseEditRepresentativeModal();
      handleCloseRepresentativeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // const filteredVendors = vendors.filter(vendor => {
  //   const searchLower = searchTerm.toLowerCase();
  //   return (
  //     vendor.vendorname.toLowerCase().includes(searchLower) ||
  //     vendor.company_email.toLowerCase().includes(searchLower) ||
  //     vendor.company_phone_number.includes(searchTerm) ||
  //     vendor.type?.toLowerCase().includes(searchLower)
  //   );
  // });

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  // const currentVendors = filteredVendors.slice(startIndex, endIndex);


  

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowAddRepresentative = () => {
    setEditRepresentativeForm({
      name: '',
      designation: '',
      email: '',
      contact_number: '',
      contact_number2: '',
      registered_by: '',
      visitingCard: null
    });
    setShowAddRepresentativeModal(true);
  };

  const handleCloseAddRepresentativeModal = () => {
    setShowAddRepresentativeModal(false);
  };

  const handleAddRepresentativeSubmit = (e) => {
    e.preventDefault();
    if (!selectedVendor) return;
    setVendors(prevVendors =>
      prevVendors.map(vendor => {
        if (vendor.vendor_id === selectedVendor.vendor_id) {
          const newRep = {
            ...editRepresentativeForm,
            id: Date.now(), 
            visitingcard: editRepresentativeForm.visitingCard
          };
          return {
            ...vendor,
            representatives_name: vendor.representatives_name
              ? [...vendor.representatives_name, newRep]
              : [newRep]
          };
        }
        return vendor;
      })
    );
    setShowAddRepresentativeModal(false);
  };

  const handleVendorIdSearch = (e) => {
    const value = e.target.value;
    setVendorIdSearch(value);
    if (value.trim() === "") {
      setFilteredVendors(vendors);
    } else {
      const matched = vendors.filter((vendor) =>
        vendor.vendor_id && vendor.vendor_id.toString().toLowerCase().includes(value.trim().toLowerCase())
      );
      setFilteredVendors(matched);
    }
  };

  // Update currentVendors to use filteredVendors when filter is active
  const currentVendors = (vendorIdSearch || showSearch || filteredVendors.length > 0) ? filteredVendors : vendors;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Vendor Management</h3>

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
            placeholder="Search by Vendor ID..."
            value={vendorIdSearch}
            onChange={handleVendorIdSearch}
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
          {showSearch && (
            <div
              ref={filterFormRef}
              className="filter-dropdown"
            >
              <input
                type="text"
                name="name"
                className="form-control search-input"
                placeholder="Name"
                value={filterFields.name}
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
                name="type"
                className="form-control search-input"
                placeholder="Type"
                value={filterFields.type}
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
              <th scope="col">Vendor ID</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Type</th>
              <th scope="col">Website</th>
              <th scope="col">Product Catalog</th>
              <th scope="col">IOS</th>
              <th scope="col">Representative</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVendors.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>No vendors found</td>
              </tr>
            ) : (
              currentVendors.map((vendor) => (
                <tr key={vendor.vendor_id}>
                  <td>{vendor.vendor_id}</td>
                  <td>{vendor.vendorname}</td>
                  <td>{vendor.company_email}</td>
                  <td>{vendor.company_phone_number}</td>
                  <td>
                    <span className="badge bg-info-transparent">
                      {vendor.type}
                    </span>
                  </td>
                  <td>
                    {vendor.website ? (
                      <a
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {vendor.website}
                      </a>
                    ) : (
                      'No Website'
                    )}
                  </td>
                  <td>
                    {vendor.productcatalog ? (
                      <a
                        href={vendor.productcatalog}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {vendor.productcatalog.split('/').pop()}
                      </a>
                    ) : (
                      'No Product Catalog'
                    )}
                  </td>
                  <td>
                    {vendor.iso ? (
                      <a
                        href={vendor.iso}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {vendor.iso.split('/').pop()}
                      </a>
                    ) : (
                      'No ISO'
                    )}
                  </td>
                  <td>
                    {vendor.representatives_name && vendor.representatives_name.length > 0 ? (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleShowRepresentative(vendor.representatives_name[0])}
                      >
                        View
                      </button>
                    ) : (
                      'No Representative'
                    )}
                  </td>
                  <td>
                    <div className="hstack gap-2 fs-15">
                      <button
                        className="btn btn-icon btn-sm btn-primary"
                        title="Edit"
                        onClick={() => handleShowEditModal(vendor)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDeleteVendor(vendor.vendor_id)}
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

      {/* Representative Modal */}
      <Modal show={showRepresentativeModal} onHide={handleCloseRepresentativeModal} centered size="lg" >
        <Modal.Header closeButton>
          <Modal.Title>Representative Information</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          {selectedRepresentative && (
            <div className="table-responsive">
              <table className="table text-nowrap">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Designation</th>
                    <th scope="col">Email</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Alt. Contact</th>
                    <th scope="col">Registered By</th>
                    <th scope="col">Visiting Card</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedRepresentative.name}</td>
                    <td>
                      <span className="badge bg-info-transparent">
                        {selectedRepresentative.designation}
                      </span>
                    </td>
                    <td>{selectedRepresentative.email}</td>
                    <td>{selectedRepresentative.contact_number}</td>
                    <td>{selectedRepresentative.contact_number2 || 'N/A'}</td>
                    <td>{selectedRepresentative.registered_by_name}</td>
                    <td>
                      {selectedRepresentative.visitingcard ? (
                        <a
                          href={selectedRepresentative.visitingcard}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-link btn-sm p-0"
                        >
                          {selectedRepresentative.visitingcard.split('/').pop()}
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
                          onClick={handleShowEditRepresentative}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          className="btn btn-icon btn-sm btn-danger"
                          title="Delete"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this representative?')) {
                              // Add delete functionality here
                              console.log('Delete representative:', selectedRepresentative.id);
                            }
                          }}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          )}
        </Modal.Body>
        <Modal.Footer>
        <Button variant="success" className="ms-3" onClick={handleShowAddRepresentative}>
            Add Representative
          </Button>
          <Button variant="secondary" onClick={handleCloseRepresentativeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Representative Modal */}
      <Modal show={showEditRepresentativeModal} onHide={handleCloseEditRepresentativeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Representative</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditRepresentativeSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editRepresentativeForm.name}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={editRepresentativeForm.designation}
                  onChange={handleEditRepresentativeFormChange}
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
                  value={editRepresentativeForm.email}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_number"
                  value={editRepresentativeForm.contact_number}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Alternative Contact</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_number2"
                  value={editRepresentativeForm.contact_number2}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Select
                  name="registered_by"
                  value={editRepresentativeForm.registered_by}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Employee</option>
                </Form.Select>
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Visiting Card</Form.Label>
                <Form.Control
                  type="file"
                  name="visitingCard"
                  onChange={handleEditRepresentativeFileChange}
                  className="form-control form-control-sm"
                />
                {editRepresentativeForm.visitingCard && (
                  <small className="text-muted">Current file: {typeof editRepresentativeForm.visitingCard === 'string' ? editRepresentativeForm.visitingCard.split('/').pop() : editRepresentativeForm.visitingCard.name}</small>
                )}
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseEditRepresentativeModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Vendor Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Vendor Name</Form.Label>
                <Form.Control
                  type="text"
                  name="vendorname"
                  value={editForm.vendorname}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                  disabled
                  readOnly

                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Email</Form.Label>
                <Form.Control
                  type="email"
                  name="company_email"
                  value={editForm.company_email}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                  disabled
                  readOnly

                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="company_phone_number"
                  value={editForm.company_phone_number}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Website</Form.Label>
                <Form.Control
                  type="url"
                  name="website"
                  value={editForm.website}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  disabled
                  readOnly

                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Type</Form.Label>
                <Form.Select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                  disabled
                  readOnly
                >
                  <option value="">Select Type</option>
                  <option value="supplier">Supplier</option>
                  <option value="service">Service Provider</option>
                  <option value="Maufacturer">Manufacturer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Importer">Importer</option>
                </Form.Select>
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
              <Form.Label className="form-label small">Product Catalog</Form.Label>
                <Form.Control
                  type="file"
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  rows="2"
                  required
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

      {/* Add Representative Modal */}
      <Modal show={showAddRepresentativeModal} onHide={handleCloseAddRepresentativeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Representative</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddRepresentativeSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editRepresentativeForm.name}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={editRepresentativeForm.designation}
                  onChange={handleEditRepresentativeFormChange}
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
                  value={editRepresentativeForm.email}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_number"
                  value={editRepresentativeForm.contact_number}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Alternative Contact</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_number2"
                  value={editRepresentativeForm.contact_number2}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Select
                  name="registered_by"
                  value={editRepresentativeForm.registered_by}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Employee</option>
                </Form.Select>
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Visiting Card</Form.Label>
                <Form.Control
                  type="file"
                  name="visitingCard"
                  onChange={handleEditRepresentativeFileChange}
                  className="form-control form-control-sm"
                />
                {editRepresentativeForm.visitingCard && (
                  <small className="text-muted">Current file: {typeof editRepresentativeForm.visitingCard === 'string' ? editRepresentativeForm.visitingCard.split('/').pop() : editRepresentativeForm.visitingCard.name}</small>
                )}
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseAddRepresentativeModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Representative
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VendorTable; 