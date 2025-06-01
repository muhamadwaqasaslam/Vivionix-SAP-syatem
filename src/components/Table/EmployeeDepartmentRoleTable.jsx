import React, { useState, useEffect } from 'react';
import { Table, Card, Form, InputGroup, Button, Toast } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../utils/api';
import './EmployeeTable.css';

const EmployeeDepartmentRoleTable = () => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editForm, setEditForm] = useState({
    employee: '',
    department: '',
    role: '',
    registered_by: ''
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchRoleList();
  }, []);

  useEffect(() => {
    filterRoles();
  }, [searchTerm, roles]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/employee/employee-department-role/list');
      setRoles(response.data);
      setFilteredRoles(response.data);
    } catch (err) {
      setError('Failed to load employee department roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/employee/departments/');
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchRoleList = async () => {
    try {
      const response = await api.get('/employee/roles/');
      setRoleList(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const filterRoles = () => {
    const filtered = roles.filter(role => 
      role.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.registered_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role assignment?')) {
      try {
        await api.delete(`/employee/employee-department-role/${id}/`);
        fetchRoles();
        setNotification({
          show: true,
          message: 'Role assignment deleted successfully!',
          type: 'success'
        });
      } catch (err) {
        setNotification({
          show: true,
          message: 'Failed to delete role assignment',
          type: 'error'
        });
      }
    }
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setEditForm({
      employee: role.employee,
      department: role.department,
      role: role.role,
      registered_by: role.registered_by
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedRole(null);
    setEditForm({
      employee: '',
      department: '',
      role: '',
      registered_by: ''
    });
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('employee', editForm.employee);
      formData.append('department', editForm.department);
      formData.append('role', editForm.role);
      formData.append('registered_by', editForm.registered_by);

      const response = await api.put(
        `/employee/employee-department-role/${selectedRole.id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        setRoles(roles.map(role => 
          role.id === selectedRole.id ? response.data : role
        ));
        handleCloseModal();
        setNotification({
          show: true,
          message: 'Role assignment updated successfully!',
          type: 'success'
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        message: 'Failed to update role assignment',
        type: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="employee-table-container">
      {/* Notification Toast */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px'
      }}>
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

      <h2 className="table-heading">Employee Department Roles</h2>
      <div className="table-header">
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by employee, department, role or registered by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table text-nowrap">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Department</th>
              <th scope="col">Role</th>
              <th scope="col">Registered By</th>
              <th scope="col">Registered By Name</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRoles.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No role assignments found</td>
              </tr>
            ) : (
              currentRoles.map((role) => (
                <tr key={role.id}>
                  <td>{role.employee}</td>
                  <td>
                    <span className="badge bg-info-transparent">
                      {role.department}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(role.role)}`}>
                      {role.role}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted">{role.registered_by}</span>
                  </td>
                  <td>
                    <span className="fw-bold">{role.registered_by_name}</span>
                  </td>
                  <td>
                    <div className="hstack gap-2 fs-15">
                      <button 
                        className="btn btn-icon btn-sm btn-primary"
                        onClick={() => handleEdit(role)}
                        title="Edit"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button 
                        className="btn btn-icon btn-sm btn-danger"
                        onClick={() => handleDelete(role.id)}
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
      {showEditModal && selectedRole && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Role Assignment</h3>
              <button className="close-button" onClick={handleCloseModal}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateRole}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Employee</label>
                    <input
                      type="text"
                      name="employee"
                      value={editForm.employee}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Department</label>
                    <select
                      name="department"
                      value={editForm.department}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.title}>
                          {dept.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Role</label>
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Role</option>
                      {roleList.map((role) => (
                        <option key={role.id} value={role.title}>
                          {role.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Registered By</label>
                    <input
                      type="text"
                      name="registered_by"
                      value={editForm.registered_by}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
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

export default EmployeeDepartmentRoleTable; 