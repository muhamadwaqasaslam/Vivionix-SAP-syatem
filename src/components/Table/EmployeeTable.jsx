import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import './EmployeeTable.css';

const EmployeeTable = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const itemsPerPage = 10;

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('https://my.vivionix.com/employee/departments/');
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setDepartments(data);
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
        const response = await fetch('https://my.vivionix.com/employee/roles/');
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        const data = await response.json();
        setRoles(data);
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
        const response = await fetch('https://my.vivionix.com/employee/employees/list');
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
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
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://my.vivionix.com/employee/employees/${selectedEmployee.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedEmployee),
      });

      if (response.ok) {
        // Update the employee in the local state
        setEmployees(employees.map(emp => 
          emp.username === selectedEmployee.username ? selectedEmployee : emp
        ));
        handleCloseModal();
      } else {
        throw new Error('Failed to update employee');
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Error updating employee: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle delete
  const handleDelete = async (username) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`https://my.vivionix.com/employee/employees/${username}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setEmployees(employees.filter(emp => emp.username !== username));
        } else {
          throw new Error('Failed to delete employee');
        }
      } catch (err) {
        alert('Error deleting employee: ' + err.message);
      }
    }
  };

  // Get role title by ID
  const getRoleTitle = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.title : 'Unknown';
  };

  // Get role badge class based on role ID
  const getRoleBadgeClass = (roleId) => {
    switch (roleId) {
      case 1:
        return 'bg-danger-transparent';
      case 2:
        return 'bg-success-transparent';
      case 3:
        return 'bg-primary-transparent';
      case 4:
        return 'bg-info-transparent';
      default:
        return 'bg-warning-transparent';
    }
  };

  // Get department name by ID
  const getDepartmentName = (deptId) => {
    const department = departments.find(dept => dept.id === deptId);
    return department ? department.name : 'Unknown';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="employee-table-container">
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
              <th scope="col">Name</th>
              <th scope="col">Username</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Department</th>
              <th scope="col">Role</th>
              <th scope="col">Hire Date</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((employee) => (
              <tr key={employee.username}>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="avatar avatar-xs me-2 online avatar-rounded">
                      <img src={`https://ui-avatars.com/api/?name=${employee.first_name}+${employee.last_name}&background=random`} alt="img" />
                    </span>
                    {employee.first_name} {employee.last_name}
                  </div>
                </td>
                <td>{employee.username}</td>
                <td>{employee.email}</td>
                <td>{employee.phone_number}</td>
                <td>
                  <span className="badge bg-info-transparent">
                    {getDepartmentName(employee.department)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getRoleBadgeClass(employee.role)}`}>
                    {getRoleTitle(employee.role)}
                  </span>
                </td>
                <td>{new Date(employee.hire_date).toLocaleDateString()}</td>
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
                      onClick={() => handleDelete(employee.username)}
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
                      value={selectedEmployee.first_name}
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
                      value={selectedEmployee.last_name}
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
                      required
                      disabled
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={selectedEmployee.email}
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
                      value={selectedEmployee.phone_number}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>CNIC</label>
                    <input
                      type="text"
                      name="cnic"
                      value={selectedEmployee.cnic}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Department</label>
                    <select
                      name="department"
                      value={selectedEmployee.department}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Role</label>
                    <select
                      name="role"
                      value={selectedEmployee.role}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Hire Date</label>
                    <input
                      type="date"
                      name="hire_date"
                      value={selectedEmployee.hire_date}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={selectedEmployee.address}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    required
                  />
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