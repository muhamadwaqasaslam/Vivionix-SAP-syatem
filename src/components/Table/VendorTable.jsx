import React, { useState, useEffect, useRef } from 'react';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';

import { Row, Col, Form, Button, Modal, Alert } from 'react-bootstrap';
import './EmployeeTable.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '../../utils/api';

const VendorTable = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredVendors, setFilteredVendors] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [showRepresentativeModal, setShowRepresentativeModal] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditRepresentativeModal, setShowEditRepresentativeModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedVendorForRep, setSelectedVendorForRep] = useState(null);
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
    deisgnation: "",
    email: "",
    contact_number: "",
    contact_number2: "",
    visitingCard: null,
    registered_by: "",
    vendor: ""
  });
  const [showAddRepresentativeModal, setShowAddRepresentativeModal] = useState(false);
  const itemsPerPage = 10;

  const [showSearch, setShowSearch] = useState(false);

  const [vendorIdSearch, setVendorIdSearch] = useState("");
  const [filterFields, setFilterFields] = useState({ name: "", email: "", type: "" });

  const filterFormRef = useRef(null);

  const [validationErrors, setValidationErrors] = useState({});
  const [registeredByName, setRegisteredByName] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchRepresentatives = async () => {
    try {
      const response = await api.get('/vendors/representatives/');
      if (response.data) {
        // Update the vendors list with representatives data
        setVendors(prevVendors => 
          prevVendors.map(vendor => {
            const vendorReps = response.data.filter(rep => rep.vendor_name === vendor.vendorname);
            return {
              ...vendor,
              representatives_name: vendorReps
            };
          })
        );
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch representatives');
    }
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/vendors/list_all/');
        if (response.data) {
          setVendors(response.data);
          // Fetch representatives after getting vendors
          await fetchRepresentatives();
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch vendors');
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
      setEditRepresentativeForm(prev => ({ ...prev, registered_by: userInfo.employee_id }));
    } else if (userInfo.id) {
      setEditRepresentativeForm(prev => ({ ...prev, registered_by: userInfo.id }));
    }
  }, []);

  const handleShowRepresentative = (representative, vendor) => {
    setSelectedRepresentative(representative);
    setSelectedVendorForRep(vendor);
    setShowRepresentativeModal(true);
  };

  const handleCloseRepresentativeModal = () => {
    setShowRepresentativeModal(false);
    setSelectedRepresentative(null);
  };

  const handleShowEditModal = (vendor) => {
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
          employee_name: 'default_user',
          employee_id: null
        };
      } catch (error) {
        console.error('Error getting user info:', error);
        return {
          employee_name: 'error_user',
          employee_id: null
        };
      }
    };

    const userInfo = getUserInfo();
    
    setSelectedVendor(vendor);
    setEditForm({
      vendorname: vendor.vendorname,
      company_email: vendor.company_email,
      type: vendor.type,
      website: vendor.website,
      company_phone_number: vendor.company_phone_number,
      address: vendor.address,
      productcatalog: vendor.productcatalog,
      iso_files: vendor.iso_files,
      registered_by: userInfo.employee_id,
      registered_by_name: userInfo.employee_name
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
    } else {
      const matched = vendors.filter((vendor) =>
        (!name || (vendor.vendorname && vendor.vendorname.toLowerCase().includes(name.toLowerCase()))) &&
        (!email || (vendor.company_email && vendor.company_email.toLowerCase().includes(email.toLowerCase()))) &&
        (!type || (vendor.type && vendor.type.toLowerCase().includes(type.toLowerCase())))
      );
      setFilteredVendors(matched);
    }
    setShowSearch(false);
  };



  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(editForm).forEach(key => {
        if (key === 'productcatalog' && editForm[key]) {
          formData.append(key, editForm[key]);
        } else if (key === 'iso' && editForm[key]) {
          formData.append(key, editForm[key]);
        } else if (key !== 'productcatalog' && key !== 'iso') {
          formData.append(key, editForm[key]);
        }
      });

      const response = await api.put(
        `/vendors/update/${selectedVendor.vendor_id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        setSuccess(true);
        // Update the vendors list with the edited vendor
        setVendors(prevVendors =>
          prevVendors.map(vendor =>
            vendor.vendor_id === selectedVendor.vendor_id
              ? { ...vendor, ...response.data }
              : vendor
          )
        );
        handleCloseEditModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update vendor');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleShowEditRepresentative = (rep) => {
    setEditRepresentativeForm({
      name: rep.name,
      deisgnation: rep.deisgnation,
      email: rep.email,
      contact_number: rep.contact_number,
      contact_number2: rep.contact_number2,
      visitingCard: rep.visitingcard,
      registered_by: rep.registered_by,
      vendor: rep.vendor_name
    });
    setSelectedRepresentative(rep);
    setShowEditRepresentativeModal(true);
  };

  const handleCloseEditRepresentativeModal = () => {
    setShowEditRepresentativeModal(false);
    setEditRepresentativeForm({
      name: "",
      deisgnation: "",
      email: "",
      contact_number: "",
      contact_number2: "",
      visitingCard: null
    });
  };

  const handleEditRepresentativeFormChange = (e) => {
    const { name, value } = e.target;
    setEditRepresentativeForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
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
      setLoading(true);
      const response = await api.delete(`/vendors/delete/${vendorId}/`);

      if (response.status === 200 || response.status === 204) {
        // Remove deleted vendor from UI
        setVendors((prevVendors) => prevVendors.filter(v => v.vendor_id !== vendorId));
        setSuccess(true);
        setError(null);
      } else {
        throw new Error('Failed to delete vendor');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete vendor');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };


  const handleEditRepresentativeSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

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
      Object.keys(editRepresentativeForm).forEach(key => {
        if (key === 'visitingCard' && editRepresentativeForm[key]) {
          formData.append(key, editRepresentativeForm[key]);
        } else if (key === 'registered_by') {
          formData.append(key, registeredById);
        } else if (key !== 'visitingCard') {
          formData.append(key, editRepresentativeForm[key]);
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
        // Update the vendors list with the edited representative
        setVendors(prevVendors =>
          prevVendors.map(vendor => ({
            ...vendor,
            representatives_name: vendor.representatives_name?.map(rep =>
              rep.id === selectedRepresentative.id ? response.data : rep
            ) || []
          }))
        );
        handleCloseEditRepresentativeModal();
        handleCloseRepresentativeModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update representative');
      setSuccess(false);
    } finally {
      setLoading(false);
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

    setEditRepresentativeForm({
      name: '',
      deisgnation: '',
      email: '',
      contact_number: '',
      contact_number2: '',
      visitingCard: null,
      registered_by: registeredById,
      vendor: selectedVendorForRep.vendorname
    });
    setShowAddRepresentativeModal(true);
  };

  const handleCloseAddRepresentativeModal = () => {
    setShowAddRepresentativeModal(false);
    setEditRepresentativeForm({
      name: "",
      deisgnation: "",
      email: "",
      contact_number: "",
      contact_number2: "",
      visitingCard: null,
      registered_by: editRepresentativeForm.registered_by,
      vendor: ""
    });
    setValidationErrors({});
    setError(null);
    setSuccess(false);
  };

  const handleAddRepresentativeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
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
      Object.keys(editRepresentativeForm).forEach(key => {
        if (key === 'visitingCard' && editRepresentativeForm[key]) {
          formData.append(key, editRepresentativeForm[key]);
        } else if (key === 'registered_by') {
          formData.append(key, registeredById);
        } else if (key !== 'visitingCard') {
          formData.append(key, editRepresentativeForm[key]);
        }
      });

      // Add the vendor name to the form data
      formData.append('vendor', selectedVendorForRep.vendorname);

      const response = await api.post('/vendors/representatives/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setSuccess(true);
        // Reset form
        setEditRepresentativeForm({
          name: "",
          deisgnation: "",
          email: "",
          contact_number: "",
          contact_number2: "",
          visitingCard: null,
          registered_by: registeredById,
          vendor: ""
        });
        handleCloseAddRepresentativeModal();
        // Refresh the representatives list
        fetchRepresentatives();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add representative');
    } finally {
      setLoading(false);
    }
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

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!editRepresentativeForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (editRepresentativeForm.name.length > 30) {
      errors.name = 'Name must be less than 30 characters';
    }

    // Email validation
    if (editRepresentativeForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editRepresentativeForm.email)) {
      errors.email = 'Invalid email format';
    } else if (editRepresentativeForm.email && editRepresentativeForm.email.length > 254) {
      errors.email = 'Email must be less than 254 characters';
    }

    // Contact number validation
    if (editRepresentativeForm.contact_number && editRepresentativeForm.contact_number.length > 15) {
      errors.contact_number = 'Contact number must be less than 15 characters';
    }

    // Contact number 2 validation
    if (editRepresentativeForm.contact_number2 && editRepresentativeForm.contact_number2.length > 15) {
      errors.contact_number2 = 'Alternative contact number must be less than 15 characters';
    }

    // Designation validation
    if (editRepresentativeForm.deisgnation && editRepresentativeForm.deisgnation.length > 15) {
      errors.deisgnation = 'Designation must be less than 15 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeleteRepresentative = async (representativeId) => {
    if (!window.confirm('Are you sure you want to delete this representative?')) return;

    try {
      setLoading(true);
      const response = await api.delete(`/vendors/representatives/delete/${representativeId}/`);

      if (response.status === 200 || response.status === 204) {
        // Update the vendors list to remove the deleted representative
        setVendors(prevVendors =>
          prevVendors.map(vendor => ({
            ...vendor,
            representatives_name: vendor.representatives_name?.filter(rep => rep.id !== representativeId) || []
          }))
        );
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

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/vendors/list_all/');
      if (response.data) {
        setVendors(response.data);
        // Reset filters
        setVendorIdSearch("");
        setFilterFields({ name: "", email: "", type: "" });
        setFilteredVendors(response.data);
        // Fetch representatives after getting vendors
        await fetchRepresentatives();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh vendors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
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
              justifyContent: 'center',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              backgroundColor: '#fff',
              transition: 'border-color 0.2s ease-in-out'
            }}
            className="action-button"
          >
            <RiFilter3Line size={20} />
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={handleRefresh}
            disabled={loading}
            style={{ 
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              backgroundColor: '#fff',
              transition: 'border-color 0.2s ease-in-out'
            }}
            className="action-button"
            title="Refresh Table"
          >
            <RiRefreshLine size={20} className={loading ? 'rotating' : ''} />
          </Button>
          {showSearch && (
            <div
              ref={filterFormRef}
              className="filter-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                zIndex: 1000,
                backgroundColor: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '1rem',
                marginTop: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
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
              <th scope="col">Address</th>
              <th scope="col">Registered By</th>
              <th scope="col">Product Catalog</th>
              <th scope="col">ISO</th>
              <th scope="col">Representative</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVendors.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center' }}>No vendors found</td>
              </tr>
            ) : (
              currentVendors.map((vendor) => (
                <tr key={vendor.vendor_id}>
                  <td>{vendor.vendor_id}</td>
                  <td>{vendor.vendorname}</td>
                  <td>{vendor.company_email}</td>
                  <td>{vendor.company_phone_number}</td>
                  <td>
                    {Array.isArray(vendor.type) ? (
                      vendor.type.map((type, index) => {
                        let badgeClass = 'bg-info-transparent';
                        switch(type) {
                          case 'Manufacturer':
                            badgeClass = 'bg-primary-transparent';
                            break;
                          case 'Importer':
                            badgeClass = 'bg-success-transparent';
                            break;
                          case 'Distributor':
                            badgeClass = 'bg-warning-transparent';
                            break;
                          default:
                            badgeClass = 'bg-info-transparent';
                        }
                        return (
                          <span key={index} className={`badge ${badgeClass} me-1`}>
                            {type}
                          </span>
                        );
                      })
                    ) : (
                      <span className="badge bg-info-transparent">
                        {vendor.type}
                      </span>
                    )}
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
                      <span className="text-muted">No Website</span>
                    )}
                  </td>
                  <td>{vendor.address || <span className="text-muted">No Address</span>}</td>
                  <td>{vendor.registered_by_name || <span className="text-muted">Not Available</span>}</td>
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
                      <span className="text-muted">No Catalog</span>
                    )}
                  </td>
                  <td>
                    {vendor.iso_files ? (
                      <a
                        href={vendor.iso_files}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {vendor.iso_files.split('/').pop()}
                      </a>
                    ) : (
                      <span className="text-muted">No ISO</span>
                    )}
                  </td>
                  <td>
                    {vendor.representatives_name && vendor.representatives_name.length > 0 ? (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleShowRepresentative(vendor.representatives_name[0], vendor)}
                      >
                        View ({vendor.representatives_name.length})
                      </button>
                    ) : (
                      <span className="text-muted">No Representative</span>
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

      <Modal show={showRepresentativeModal} onHide={handleCloseRepresentativeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Representative Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : selectedRepresentative && (
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
                    <th scope="col">Registered By</th>
                    <th scope="col">Visiting Card</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVendorForRep.representatives_name.map((rep) => (
                    <tr key={rep.id}>
                      <td>{rep.id}</td>
                      <td>{rep.name}</td>
                      <td>
                        <span className="badge bg-info-transparent">
                          {rep.deisgnation || 'N/A'}
                        </span>
                      </td>
                      <td>{rep.email}</td>
                      <td>{rep.contact_number}</td>
                      <td>{rep.contact_number2 || 'N/A'}</td>
                      <td>{rep.registered_by_name}</td>
                      <td>
                        {rep.visitingcard ? (
                          <a
                            href={rep.visitingcard}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-link btn-sm p-0"
                          >
                            {rep.visitingcard.split('/').pop()}
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
                            onClick={() => handleShowEditRepresentative(rep)}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            className="btn btn-icon btn-sm btn-danger"
                            title="Delete"
                            onClick={() => handleDeleteRepresentative(rep.id)}
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

      <Modal show={showEditRepresentativeModal} onHide={handleCloseEditRepresentativeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Representative</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Representative updated successfully!</Alert>}
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
                  name="deisgnation"
                  value={editRepresentativeForm.deisgnation}
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
                <PhoneInput
                  country={'pk'}
                  value={editRepresentativeForm.contact_number}
                  onChange={(value) => handleEditRepresentativeFormChange({ target: { name: 'contact_number', value } })}
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
                  value={editRepresentativeForm.contact_number2}
                  onChange={(value) => handleEditRepresentativeFormChange({ target: { name: 'contact_number2', value } })}
                  inputClass="form-control"
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number2'
                  }}
                />
              </Col>
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
                  <small className="text-muted">
                    Current file: {typeof editRepresentativeForm.visitingCard === 'string' 
                      ? editRepresentativeForm.visitingCard.split('/').pop() 
                      : editRepresentativeForm.visitingCard.name}
                  </small>
                )}
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseEditRepresentativeModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Vendor updated successfully!</Alert>}
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
                <PhoneInput
                  country={'pk'}
                  value={editForm.company_phone_number}
                  onChange={(value) => handleEditFormChange({ target: { name: 'company_phone_number', value } })}
                  inputClass="form-control"
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'company_phone_number',
                    required: true
                  }}
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
                  placeholder="Enter website URL (e.g., https://example.com)"
                />
                {editForm.website && (
                  <small className="text-muted">
                    <a
                      href={editForm.website.startsWith('http') ? editForm.website : `https://${editForm.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      Visit Website
                    </a>
                  </small>
                )}
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
                >
                  <option value="">Select Type</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Importer">Importer</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  name="registered_by_name"
                  value={editForm.registered_by_name}
                  className="form-control form-control-sm"
                  disabled
                  readOnly
                />
                <input
                  type="hidden"
                  name="registered_by"
                  value={editForm.registered_by}
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
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Catalog</Form.Label>
                <Form.Control
                  type="file"
                  name="productcatalog"
                  onChange={(e) => setEditForm(prev => ({ ...prev, productcatalog: e.target.files[0] }))}
                  className="form-control form-control-sm"
                />
                {editForm.productcatalog && (
                  <small className="text-muted">
                    Current file: {typeof editForm.productcatalog === 'string' 
                      ? editForm.productcatalog.split('/').pop() 
                      : editForm.productcatalog.name}
                  </small>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">ISO Certificate</Form.Label>
                <Form.Control
                  type="file"
                  name="iso_files"
                  onChange={(e) => setEditForm(prev => ({ ...prev, iso_files: e.target.files[0] }))}
                  className="form-control form-control-sm"
                />
                {editForm.iso_files && (
                  <small className="text-muted">
                    Current file: {typeof editForm.iso_files === 'string' 
                      ? editForm.iso_files.split('/').pop() 
                      : editForm.iso_files.name}
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

      <Modal show={showAddRepresentativeModal} onHide={handleCloseAddRepresentativeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Representative</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Representative added successfully!</Alert>}
          <Form onSubmit={handleAddRepresentativeSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editRepresentativeForm.name}
                  onChange={handleEditRepresentativeFormChange}
                  className={`form-control form-control-sm ${validationErrors.name ? 'is-invalid' : ''}`}
                  required
                  maxLength={30}
                />
                {validationErrors.name && (
                  <div className="invalid-feedback">{validationErrors.name}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="deisgnation"
                  value={editRepresentativeForm.deisgnation}
                  onChange={handleEditRepresentativeFormChange}
                  className={`form-control form-control-sm ${validationErrors.deisgnation ? 'is-invalid' : ''}`}
                  maxLength={15}
                />
                {validationErrors.deisgnation && (
                  <div className="invalid-feedback">{validationErrors.deisgnation}</div>
                )}
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
                  className={`form-control form-control-sm ${validationErrors.email ? 'is-invalid' : ''}`}
                  maxLength={254}
                />
                {validationErrors.email && (
                  <div className="invalid-feedback">{validationErrors.email}</div>
                )}
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Contact Number</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={editRepresentativeForm.contact_number}
                  onChange={(value) => handleEditRepresentativeFormChange({ target: { name: 'contact_number', value } })}
                  inputClass={`form-control ${validationErrors.contact_number ? 'is-invalid' : ''}`}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number',
                    maxLength: 15
                  }}
                />
                {validationErrors.contact_number && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.contact_number}
                  </div>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Alternative Contact</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={editRepresentativeForm.contact_number2}
                  onChange={(value) => handleEditRepresentativeFormChange({ target: { name: 'contact_number2', value } })}
                  inputClass={`form-control ${validationErrors.contact_number2 ? 'is-invalid' : ''}`}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'contact_number2',
                    maxLength: 15
                  }}
                />
                {validationErrors.contact_number2 && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.contact_number2}
                  </div>
                )}
              </Col>
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
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Representative'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

// Update the styles
const styles = `
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .rotating {
    animation: rotate 1s linear infinite;
  }

  .action-button {
    color: #6c757d !important;
  }

  .action-button:hover {
    border-color: #0d6efd !important;
    background-color: #fff !important;
    color: #6c757d !important;
  }

  .action-button:focus {
    box-shadow: none !important;
    border-color: #0d6efd !important;
    background-color: #fff !important;
    color: #6c757d !important;
  }

  .action-button:disabled {
    background-color: #fff !important;
    border-color: #dee2e6 !important;
    opacity: 0.65;
    color: #6c757d !important;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default VendorTable; 