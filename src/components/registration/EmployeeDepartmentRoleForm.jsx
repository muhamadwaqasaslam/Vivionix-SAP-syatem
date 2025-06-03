import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import api from '../../utils/api';
import './RegistrationForm.css';

const EmployeeDepartmentRoleForm = () => {
  const [formData, setFormData] = useState({
    employee_name: null,
    department_name: null,
    role_name: null,
    registered_by: null
  });

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user info
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          setCurrentUser(userData);
          setFormData(prev => ({
            ...prev,
            registered_by: userData.employee_id
          }));
        }
      } catch (err) {
        console.error('Error getting user info:', err);
        setError('Failed to get current user information');
      }
    };

    getUserInfo();
  }, []);

  // Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/employee/departments/');
        const data = response.data;
        const formattedDepartments = data.map(dept => ({
          value: dept.id,
          label: dept.name
        }));
        setDepartments(formattedDepartments);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments');
      }
    };

    fetchDepartments();
  }, []);

  // Load roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/employee/roles/');
        console.log('Raw roles data:', response.data);  // Log raw data
        
        const formattedRoles = response.data.map(role => ({
          value: role.id,
          label: role.title
        }));
        console.log('Formatted roles:', formattedRoles);  // Log formatted data
        
        setRoles(formattedRoles);
      } catch (err) {
        console.error('Error fetching roles:', err);  // Log any errors
        setError('Failed to load roles');
      }
    };

    fetchRoles();
  }, []);

  // Load employees for search
  const loadEmployees = async (inputValue) => {
    try {
      const response = await api.get('/employee/employees/list');
      // Filter employees based on search input
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.registered_by) {
      setError('No registered by information available');
      setLoading(false);
      return;
    }

    try {
      const formDataPayload = new FormData();
      formDataPayload.append('employee', formData.employee_name.value);
      formDataPayload.append('department', formData.department_name.label);
      formDataPayload.append('role', formData.role_name.label);
      formDataPayload.append('registered_by', formData.registered_by);

      console.log('Submitting data:', {
        employee: formData.employee_name.value,
        department: formData.department_name.label,
        role: formData.role_name.label,
        registered_by: formData.registered_by
      });

      const response = await api.post('/employee/employee-department-role/', formDataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess('Employee Department Role assigned successfully!');
        // Reset form
        setFormData({
          employee_name: null,
          department_name: null,
          role_name: null,
          registered_by: currentUser.employee_id
        });
      }
    } catch (err) {
      console.error('Error submitting form:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <Card>
        <Card.Header className="registration-header">
          <h2 className="registration-title">Assign Employee Department Role</h2>
        </Card.Header>
        <Card.Body className="registration-body">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
              {success}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Employee Name</Form.Label>
              <AsyncSelect
                cacheOptions
                defaultOptions={false}
                value={formData.employee_name}
                onChange={(selected) => setFormData({ ...formData, employee_name: selected })}
                loadOptions={loadEmployees}
                placeholder="Search employee..."
                isClearable
                required
                noOptionsMessage={() => "Type to search employees..."}
                loadingMessage={() => "Searching..."}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Select
                options={departments}
                value={formData.department_name}
                onChange={(selected) => setFormData({ ...formData, department_name: selected })}
                placeholder="Select department..."
                isClearable
                required
                classNamePrefix="Select2"
                className="search-panel"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Select
                value={formData.role_name}
                onChange={(selected) => setFormData({ ...formData, role_name: selected })}
                options={roles}
                placeholder="Select role..."
                isClearable
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Registered By</Form.Label>
              <Form.Control
                type="text"
                value={currentUser ? currentUser.employee_name : 'Not available'}
                disabled
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || !currentUser}
              className="w-100"
            >
              {loading ? 'Assigning...' : 'Assign Role'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeeDepartmentRoleForm; 