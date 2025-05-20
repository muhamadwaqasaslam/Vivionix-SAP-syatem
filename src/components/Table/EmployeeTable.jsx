import React, { useState, useEffect } from 'react';
import {Toast } from 'react-bootstrap';
import './EmployeeTable.css';
import api from '../../utils/api';

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    address: "",
    hire_date: "",
    emergency_contact_number: "",
    date_of_birth: "",
    bank_account_number: "",
    passport_number: "",
    department_id: "",
    role_id: "",
    office_branch: ""
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // 'success' or 'error'
  });
  const itemsPerPage = 10;

  // Function to get user info from session or local storage
  const getUserInfo = () => {
    try {
      const sessionUser = sessionStorage.getItem('user');
      if (sessionUser) {
        const userData = JSON.parse(sessionUser);
        console.log('User data from session:', userData);
        return userData;
      }

      const localUser = localStorage.getItem('user');
      if (localUser) {
        const userData = JSON.parse(localUser);
        console.log('User data from local storage:', userData);
        return userData;
      }

      // Fallback if no user data found
      return {
        employee_name: 'default_user',
        employee_id: null
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      // Return fallback on error
      return {
        employee_name: 'error_user',
        employee_id: null
      };
    }
  };

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/employee/departments/');
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/employee/roles/');
        const data = response.data;
        const formattedRoles = data.map(role => ({
          id: role.id,
          title: role.title
        }));
        setRoles(formattedRoles);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };

    fetchRoles();
  }, []);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await api.get('/employee/employees/list');
        setEmployees(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.first_name.toLowerCase().includes(searchLower) ||
      employee.last_name.toLowerCase().includes(searchLower) ||
      employee.username.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.phone_number.includes(searchTerm)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle edit
  const handleEdit = (employee) => {
    // Find the department and role IDs from the lists
    const currentDepartment = departments.find(dept => dept.name === employee.department_name);
    const currentRole = roles.find(role => role.title === employee.role_name);

    console.log('Employee role:', employee.role_name);
    console.log('Available roles:', roles);
    console.log('Found role:', currentRole);

    setSelectedEmployee(employee);
    setEditForm({
      first_name: employee.first_name,
      last_name: employee.last_name,
      username: employee.username,
      email: employee.email,
      phone_number: employee.phone_number,
      address: employee.address,
      hire_date: employee.hire_date || "",
      emergency_contact_number: employee.emergency_contact_number || "",
      date_of_birth: employee.date_of_birth || "",
      bank_account_number: employee.bank_account_number || "",
      passport_number: employee.passport_number || "",
      department_id: currentDepartment ? currentDepartment.id : "",
      role_id: currentRole ? currentRole.id : "",
      office: employee.office || ""
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
    setEditForm({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone_number: "",
      address: "",
      hire_date: "",
      emergency_contact_number: "",
      date_of_birth: "",
      bank_account_number: "",
      passport_number: "",
      department_id: "",
      role_id: "",
      office: ""
    });
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const currentUser = getUserInfo();
      
      // Append all form fields
      formData.append('first_name', editForm.first_name);
      formData.append('last_name', editForm.last_name);
      formData.append('email', editForm.email);
      formData.append('phone_number', editForm.phone_number);
      formData.append('address', editForm.address);
      formData.append('hire_date', editForm.hire_date || '');
      formData.append('emergency_contact_number', editForm.emergency_contact_number || '');
      formData.append('date_of_birth', editForm.date_of_birth || '');
      formData.append('bank_account_number', editForm.bank_account_number || '');
      formData.append('passport_number', editForm.passport_number || '');
      formData.append('department_id', editForm.department_id || '');
      formData.append('role_id', editForm.role_id || '');
      formData.append('office', editForm.office || '');
      formData.append('registered_by', currentUser.employee_id || '');

      // Handle file uploads if new files are selected
      if (editForm.cnic instanceof File) {
        formData.append('cnic', editForm.cnic);
      }
      if (editForm.document instanceof File) {
        formData.append('document', editForm.document);
      }

      const response = await api.put(
        `/employee/employees/edit/${selectedEmployee.employee_id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setEmployees(employees.map(emp => 
          emp.employee_id === selectedEmployee.employee_id ? response.data : emp
        ));
        handleCloseModal();
        setNotification({
          show: true,
          message: 'Employee updated successfully!',
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.message;
      setNotification({
        show: true,
        message: 'Error updating employee: ' + errorMessage,
        type: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      // Handle file inputs
      setEditForm(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      // Handle other inputs
      setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    }
  };

  // Handle delete
  const handleDelete = async (employee) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await api.delete(`/employee/employees/delete/${employee.employee_id}/`);
        
        if (response.status === 200 || response.status === 204) {
          // Remove the deleted employee from the state
          setEmployees(employees.filter(emp => emp.employee_id !== employee.employee_id));
          
          // Show success notification
          setNotification({
            show: true,
            message: 'Employee deleted successfully!',
            type: 'success'
          });
        }
      } catch (err) {
        console.error('Error deleting employee:', err);
        const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.message;
        
        // Show error notification
        setNotification({
          show: true,
          message: 'Error deleting employee: ' + errorMessage,
          type: 'error'
        });
      }
    }
  };

  // Get role badge class based on role name
  const getRoleBadgeClass = (roleName) => {
    if (!roleName) return 'bg-warning-transparent';
    
    switch (roleName) {
      case 'Admin':
        return 'bg-danger-transparent';
      case 'Manager':
        return 'bg-success-transparent';
      case 'Sales - Order Entry':
        return 'bg-primary-transparent';
      case 'Accountant':
        return 'bg-info-transparent';
      default:
        return 'bg-warning-transparent';
    }
  };

  // Add notification styles to your CSS
  const notificationStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    minWidth: '300px'
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="employee-table-container">
      {/* Notification Toast */}
      <div style={notificationStyles}>
        <Toast 
          show={notification.show} 
          onClose={() => setNotification({ ...notification, show: false })}
          delay={5000} 
          autohide
          bg={notification.type === 'success' ? 'success' : 'danger'}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {notification.message}
          </Toast.Body>
        </Toast>
      </div>

      <h2 className="table-heading">Employee Management</h2>
      <div className="table-header">
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table text-nowrap">
          <thead>
            <tr>
              <th scope="col">Employee ID</th>
              <th scope="col">First Name</th>
              <th scope="col">Last Name</th>
              <th scope="col">Username</th>
              <th scope="col">Email</th>
              <th scope="col">Phone Number</th>
              <th scope="col">Office/Branch</th>
              <th scope="col">Emergency Contact</th>
              <th scope="col">Date of Birth</th>
              <th scope="col">CNIC</th>
              <th scope="col">Address</th>
              <th scope="col">Bank Account</th>
              <th scope="col">Hire Date</th>
              <th scope="col">Department</th>
              <th scope="col">Role</th>
              <th scope="col">Registered By Name</th>
              <th scope="col">Passport Number</th>
              <th scope="col">Document</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length === 0 ? (
              <tr>
                <td colSpan="21" style={{ textAlign: 'center' }}>No employees found</td>
              </tr>
            ) : (
              currentEmployees.map((employee) => (
              <tr key={employee.username}>
                  <td>{employee.employee_id}</td>
                  <td>{employee.first_name}</td>
                  <td>{employee.last_name}</td>
                <td>{employee.username}</td>
                <td>{employee.email}</td>
                <td>{employee.phone_number}</td>
                  <td>{employee.office || 'N/A'}</td>
                  <td>{employee.emergency_contact_number || 'N/A'}</td>
                  <td>{employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {employee.cnic ? (
                      <a
                        href={employee.cnic}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        View CNIC
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{employee.address}</td>
                  <td>{employee.bank_account_number || 'N/A'}</td>
                  <td>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span className="badge bg-info-transparent">
                    {employee.department_name || 'Not Assigned'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getRoleBadgeClass(employee.role_name)}`}>
                    {employee.role_name || 'Not Assigned'}
                  </span>
                </td>
                   <td>{employee.registered_by_name || 'N/A'}</td>
                   <td>{employee.passport_number || 'N/A'}</td>
                  <td>
                    {employee.document ? (
                      <a
                        href={employee.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        View Document
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                <td>
                  <div className="hstack gap-2 fs-15">
                    <button 
                      className="btn btn-icon btn-sm btn-primary"
                      onClick={() => handleEdit(employee)}
                      title="Edit"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      className="btn btn-icon btn-sm btn-danger"
                        onClick={() => handleDelete(employee)}
                      title="Delete"
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

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Employee</h3>
              <button className="close-button" onClick={handleCloseModal}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={selectedEmployee.username}
                      onChange={handleInputChange}
                      className="form-control"
                      
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Office/Branch</label>
                    <input
                      type="text"
                      name="office"
                      value={editForm.office}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Emergency Contact Number</label>
                    <input
                      type="tel"
                      name="emergency_contact_number"
                      value={editForm.emergency_contact_number}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editForm.date_of_birth}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Bank Account Number</label>
                    <input
                      type="text"
                      name="bank_account_number"
                      value={editForm.bank_account_number}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Passport Number</label>
                    <input
                      type="text"
                      name="passport_number"
                      value={editForm.passport_number}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>CNIC (File)</label>
                    <input
                      type="file"
                      name="cnic"
                      onChange={handleInputChange}
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {selectedEmployee.cnic && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Current CNIC: <a
                            href={selectedEmployee.cnic}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            View CNIC
                          </a>
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="form-group col-md-6">
                    <label>Office</label>
                    <input
                      type="text"
                      name="office"
                      value={editForm.office}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Department</label>
                    <select
                      name="department_id"
                      value={editForm.department_id}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {selectedEmployee && selectedEmployee.department_name && (
                      <small className="text-muted">
                        Current: {selectedEmployee.department_name}
                      </small>
                    )}
                  </div>
                  <div className="form-group col-md-6">
                    <label>Role</label>
                    <select
                      name="role_id"
                      value={editForm.role_id}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.title}
                        </option>
                      ))}
                    </select>
                    {selectedEmployee && selectedEmployee.role_name && (
                      <small className="text-muted">
                        Current: {selectedEmployee.role_name}
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Hire Date</label>
                    <input
                      type="date"
                      name="hire_date"
                      value={editForm.hire_date}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Registered By</label>
                    <input
                      type="text"
                      value={getUserInfo().employee_name || 'N/A'}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Document (Education/Resume File)</label>
                  <input
                    type="file"
                    name="document"
                    onChange={handleInputChange}
                    className="form-control"
                    accept=".pdf,.doc,.docx"
                  />
                  {selectedEmployee.document && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Current Document: <a
                          href={selectedEmployee.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          View Document
                        </a>
                      </small>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable; 