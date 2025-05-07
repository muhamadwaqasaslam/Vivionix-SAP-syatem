import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Modal, Table, Alert } from 'react-bootstrap';
import './EmployeeTable.css';

const CustomerTable = () => {
  // Dummy data for testing
  const dummyCustomers = [
    {
      Customer_id: "CUST001",
      Companyname: "City Hospital",
      Companyemail: "info@cityhospital.com",
      Company_phone_number: "1234567890",
      address: "123 Medical Center Drive",
      city: "New York",
      category: "Private",
      type: "Hospital",
      capacity: "High End",
      registered_by_name: "John Doe",
      representatives_name: [
        {
          id: 1,
          name: "Dr. Sarah Smith",
          designation: "Medical Director",
          email: "sarah.smith@cityhospital.com",
          contact_number: "9876543210",
          contact_number2: "9876543211",
          registered_by: "EMP001",
          visitingcard: "https://example.com/visitingcard1.pdf",
          customer_name: "City Hospital",
          registered_by_name: "John Doe"
        }
      ]
    },
    {
      Customer_id: "CUST002",
      Companyname: "Community Clinic",
      Companyemail: "contact@communityclinic.com",
      Company_phone_number: "2345678901",
      address: "456 Health Street",
      city: "Los Angeles",
      category: "Public",
      type: "Clinic",
      capacity: "Medium",
      registered_by_name: "Jane Smith",
      representatives_name: [
        {
          id: 2,
          name: "Dr. Michael Brown",
          designation: "Clinic Manager",
          email: "michael.brown@communityclinic.com",
          contact_number: "8765432109",
          contact_number2: "8765432108",
          registered_by: "EMP002",
          visitingcard: "https://example.com/visitingcard2.pdf",
          customer_name: "Community Clinic",
          registered_by_name: "Jane Smith"
        }
      ]
    },
    {
      Customer_id: "CUST003",
      Companyname: "Metro Medical Center",
      Companyemail: "info@metromedical.com",
      Company_phone_number: "3456789012",
      address: "789 Healthcare Avenue",
      city: "Chicago",
      category: "Private",
      type: "Hospital",
      capacity: "High End",
      registered_by_name: "Robert Johnson",
      representatives_name: [
        {
          id: 3,
          name: "Dr. Emily Wilson",
          designation: "Chief Medical Officer",
          email: "emily.wilson@metromedical.com",
          contact_number: "7654321098",
          contact_number2: "7654321097",
          registered_by: "EMP003",
          visitingcard: "https://example.com/visitingcard3.pdf",
          customer_name: "Metro Medical Center",
          registered_by_name: "Robert Johnson"
        }
      ]
    }
  ];

  const [customers, setCustomers] = useState(dummyCustomers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRepresentativeModal, setShowRepresentativeModal] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditRepresentativeModal, setShowEditRepresentativeModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [editForm, setEditForm] = useState({
    category: "",
    type: "",
    capacity: "",
    Companyname: "",
    Companyemail: "",
    Company_phone_number: "",
    address: "",
    city: "",
    registered_by: ""
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
  const itemsPerPage = 10;

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await fetch('https://my.vivionix.com/employee/list_all/');
//         if (!response.ok) {
//           throw new Error('Failed to fetch employees');
//         }
//         const data = await response.json();
//         setEmployees(data);
//       } catch (err) {
//         setError(err.message);
//       }
//     };

//     fetchEmployees();
//   }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleShowRepresentative = (representative) => {
    setSelectedRepresentative(representative);
    setShowRepresentativeModal(true);
  };

  const handleCloseRepresentativeModal = () => {
    setShowRepresentativeModal(false);
    setSelectedRepresentative(null);
  };

  const handleShowEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      category: customer.category,
      type: customer.type,
      capacity: customer.capacity,
      Companyname: customer.Companyname,
      Companyemail: customer.Companyemail,
      Company_phone_number: customer.Company_phone_number,
      address: customer.address,
      city: customer.city,
      registered_by: customer.registered_by
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCustomer(null);
    setEditForm({
      category: "",
      type: "",
      capacity: "",
      Companyname: "",
      Companyemail: "",
      Company_phone_number: "",
      address: "",
      city: "",
      registered_by: ""
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.Customer_id === selectedCustomer.Customer_id 
            ? { ...customer, ...editForm }
            : customer
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

  const handleEditRepresentativeSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => {
          if (customer.representatives_name && customer.representatives_name.length > 0) {
            const updatedRepresentatives = customer.representatives_name.map(rep => 
              rep.id === selectedRepresentative.id 
                ? { ...rep, ...editRepresentativeForm }
                : rep
            );
            return { ...customer, representatives_name: updatedRepresentatives };
          }
          return customer;
        })
      );
      handleCloseEditRepresentativeModal();
      handleCloseRepresentativeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.Companyname.toLowerCase().includes(searchLower) ||
      customer.Companyemail?.toLowerCase().includes(searchLower) ||
      customer.Company_phone_number?.includes(searchTerm) ||
      customer.city?.toLowerCase().includes(searchLower) ||
      customer.category?.toLowerCase().includes(searchLower) ||
      customer.type?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

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
      <h3 className="table-heading">Customer Management</h3>
      
      <div className="table-header">
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table text-nowrap">
          <thead>
            <tr>
              <th scope="col">Customer ID</th>
              <th scope="col">Company Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">City</th>
              <th scope="col">Category</th>
              <th scope="col">Type</th>
              <th scope="col">Capacity</th>
              <th scope="col">Representative</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.map((customer) => (
              <tr key={customer.Customer_id}>
                <td>{customer.Customer_id}</td>
                <td>{customer.Companyname}</td>
                <td>{customer.Companyemail}</td>
                <td>{customer.Company_phone_number}</td>
                <td>{customer.city}</td>
                <td>
                  <span className="badge bg-info-transparent">
                    {customer.category}
                  </span>
                </td>
                <td>
                  <span className="badge bg-primary-transparent">
                    {customer.type}
                  </span>
                </td>
                <td>
                  <span className="badge bg-success-transparent">
                    {customer.capacity}
                  </span>
                </td>
                <td>
                  {customer.representatives_name && customer.representatives_name.length > 0 ? (
                    <button
                      className="btn btn-link btn-sm p-0"
                      onClick={() => handleShowRepresentative(customer.representatives_name[0])}
                    >
                      {customer.representatives_name[0].name}
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
                      onClick={() => handleShowEdit(customer)}
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      className="btn btn-icon btn-sm btn-danger"
                      title="Delete"
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

      {/* Representative Modal */}
      <Modal show={showRepresentativeModal} onHide={handleCloseRepresentativeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Representative Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRepresentative && (
            <div>
              <Row>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedRepresentative.name}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Designation</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedRepresentative.designation}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={selectedRepresentative.email}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={selectedRepresentative.contact_number}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Alternative Contact</Form.Label>
                  <Form.Control
                    type="tel"
                    value={selectedRepresentative.contact_number2}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Registered By</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedRepresentative.registered_by_name}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Col md={12} className="mb-2">
                  <Form.Label className="form-label small">Visiting Card</Form.Label>
                  {selectedRepresentative.visitingcard ? (
                    <a 
                      href={selectedRepresentative.visitingcard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link btn-sm p-0"
                    >
                      View Visiting Card
                    </a>
                  ) : (
                    <span className="text-muted">No visiting card available</span>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleShowEditRepresentative} className="me-2">
            Update Representative
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
                  {employees.map(employee => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.name}
                    </option>
                  ))}
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
                  <small className="text-muted">Current file: {editRepresentativeForm.visitingCard}</small>
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

      {/* Edit Customer Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="Companyname"
                  value={editForm.Companyname}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Email</Form.Label>
                <Form.Control
                  type="email"
                  name="Companyemail"
                  value={editForm.Companyemail}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="Company_phone_number"
                  value={editForm.Company_phone_number}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={editForm.city}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Category</Form.Label>
                <Form.Select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Type</Form.Label>
                <Form.Select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                </Form.Select>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Capacity</Form.Label>
                <Form.Select
                  name="capacity"
                  value={editForm.capacity}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Capacity</option>
                  <option value="High End">High End</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Select
                  name="registered_by"
                  value={editForm.registered_by}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.name}
                    </option>
                  ))}
                </Form.Select>
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
    </div>
  );
};

export default CustomerTable; 