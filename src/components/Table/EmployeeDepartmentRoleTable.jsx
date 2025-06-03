import React, { useState, useEffect } from 'react';
import { Table, Card, Form, InputGroup, Button, Toast } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../utils/api';
import './EmployeeTable.css';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';

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
    employee_name: null,
    department_name: null,
    role_name: null,
    registered_by: null
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const itemsPerPage = 10;
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchRoleList();
  }, []);

  useEffect(() => {
    filterRoles();
  }, [searchTerm, roles]);

  // Get current user info
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Error getting user info:', err);
        setError('Failed to get current user information');
      }
    };

    getUserInfo();
  }, []);

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
    const filtered = roles.filter(role => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (role.employee_name?.toLowerCase() || '').includes(searchTermLower) ||
        (role.department_name?.toLowerCase() || '').includes(searchTermLower) ||
        (role.role_name?.toLowerCase() || '').includes(searchTermLower) ||
        (role.registered_by_name?.toLowerCase() || '').includes(searchTermLower)
      );
    });
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
      employee_name: { value: role.employee_name, label: role.employee_name },
      department_name: { value: role.department_name, label: role.department_name },
      role_name: { value: role.role_name, label: role.role_name },
      registered_by: currentUser?.employee_id || role.registered_by
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedRole(null);
    setEditForm({
      employee_name: null,
      department_name: null,
      role_name: null,
      registered_by: null
    });
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('employee', editForm.employee_name.value);
      formData.append('department', editForm.department_name.label);
      formData.append('role', editForm.role_name.label);
      formData.append('registered_by', currentUser?.employee_id || editForm.registered_by);

      const response = await api.put(
        `/employee/employee-department-role/update/${selectedRole.id}/`,
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
        setNotification({
          show: true,
          message: 'Role assignment updated successfully!',
          type: 'success'
        });
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating role:', err.response?.data);
      setNotification({
        show: true,
        message: err.response?.data?.message || 'Failed to update role assignment',
        type: 'error'
      });
    }
  };

  // Load employees for search in edit modal
  const loadEmployees = async (inputValue) => {
    try {
      const response = await api.get('/employee/employees/list');
      const filteredEmployees = response.data.filter(emp => 
        emp.first_name.toLowerCase().includes(inputValue.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(inputValue.toLowerCase()) 
      );
      
      return filteredEmployees.map(emp => ({
        value: emp.username,
        label: `${emp.first_name} ${emp.last_name}`
      }));
    } catch (err) {
      console.error('Error loading employees:', err);
      return [];
    }
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
      case 'Sales - Order Entry':
        return 'bg-primary-transparent';
      case 'Sales - Approve Order':
        return 'bg-success-transparent';
      default:
        return 'bg-warning-transparent';
    }
  };

  // Get department badge class
  const getDepartmentBadgeClass = (departmentName) => {
    if (!departmentName) return 'bg-warning-transparent';
    
    switch (departmentName) {
      case 'Sales':
        return 'bg-info-transparent';
      case 'Supply Chain':
        return 'bg-success-transparent';
      case 'Accounts':
        return 'bg-primary-transparent';
      default:
        return 'bg-warning-transparent';
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchRoles();
      setNotification({
        show: true,
        message: 'Data refreshed successfully!',
        type: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh data');
      setTimeout(() => {
        setError(null);
      }, 2000);
    } finally {
      setRefreshing(false);
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
            placeholder="Search by employee, department, role or registered by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            onClick={() => {
              const filtered = roles.filter(role => 
                role.department_name === 'Sales' || 
                role.department_name === 'Supply Chain' || 
                role.department_name === 'Accounts'
              );
              setFilteredRoles(filtered);
            }}
            style={{ 
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className="ri-filter-3-line" style={{ fontSize: '20px' }}></i>
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ 
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className={`ri-refresh-line ${refreshing ? 'rotating' : ''}`} style={{ fontSize: '20px' }}></i>
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table text-nowrap">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Employee</th>
              <th scope="col">Department</th>
              <th scope="col">Role</th>
              <th scope="col">Registered By</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRoles.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No role assignments found</td>
              </tr>
            ) : (
              currentRoles.map((role, index) => (
                <tr key={index}>
                  <td>
                    <span className="fw-bold">{role.id}</span>
                  </td>
                  <td>
                    <span className="text-muted">{role.employee_name}</span>
                  </td>
                  <td>
                    <span className={`badge ${getDepartmentBadgeClass(role.department_name)}`}>
                      {role.department_name}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(role.role_name)}`} style={{ fontSize: '0.75rem' }}>
                      {role.role_name}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted">
                      {role.registered_by_name || 'Not specified'}
                    </span>
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
                    <label className="form-label small">Employee</label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions={false}
                      value={editForm.employee_name}
                      onChange={(selected) => setEditForm({ ...editForm, employee_name: selected })}
                      loadOptions={loadEmployees}
                      placeholder="Search employee..."
                      isClearable
                      required
                      noOptionsMessage={() => "Type to search employees..."}
                      loadingMessage={() => "Searching..."}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '32px',
                          height: '32px',
                          fontSize: '0.875rem'
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          height: '32px',
                          padding: '0 8px'
                        }),
                        input: (base) => ({
                          ...base,
                          margin: '0px',
                          fontSize: '0.875rem'
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: '32px'
                        }),
                        option: (base) => ({
                          ...base,
                          fontSize: '0.875rem'
                        })
                      }}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label className="form-label small">Department</label>
                    <Select
                      options={departments.map(dept => ({
                        value: dept.id,
                        label: dept.name
                      }))}
                      value={editForm.department_name}
                      onChange={(selected) => setEditForm({ ...editForm, department_name: selected })}
                      placeholder="Select department..."
                      isClearable
                      required
                      classNamePrefix="Select2"
                      className="search-panel"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '32px',
                          height: '32px',
                          fontSize: '0.875rem'
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          height: '32px',
                          padding: '0 8px'
                        }),
                        input: (base) => ({
                          ...base,
                          margin: '0px',
                          fontSize: '0.875rem'
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: '32px'
                        }),
                        option: (base) => ({
                          ...base,
                          fontSize: '0.875rem'
                        })
                      }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label className="form-label small">Role</label>
                    <Select
                      options={roleList.map(role => ({
                        value: role.id,
                        label: role.title
                      }))}
                      value={editForm.role_name}
                      onChange={(selected) => setEditForm({ ...editForm, role_name: selected })}
                      placeholder="Select role..."
                      isClearable
                      required
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '32px',
                          height: '32px',
                          fontSize: '0.875rem'
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          height: '32px',
                          padding: '0 8px'
                        }),
                        input: (base) => ({
                          ...base,
                          margin: '0px',
                          fontSize: '0.875rem'
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: '32px'
                        }),
                        option: (base) => ({
                          ...base,
                          fontSize: '0.875rem'
                        })
                      }}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label className="form-label small">Registered By</label>
                    <Form.Control
                      type="text"
                      value={currentUser ? currentUser.employee_name : 'Not available'}
                      disabled
                      className="form-control form-control-sm"
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