import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Form, Button, Modal, Table, Alert, ListGroup } from 'react-bootstrap';
import './EmployeeTable.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '../../utils/api';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';

const CustomerTable = () => {
  // Function to get user info from session or local storage
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

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRepresentativeModal, setShowRepresentativeModal] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditRepresentativeModal, setShowEditRepresentativeModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerForRep, setSelectedCustomerForRep] = useState(null);
  const [editForm, setEditForm] = useState({
    Companyname: "",
    Companyemail: "",
    type: "",
    category: "",
    capacity: "",
    Company_phone_number: "",
    address: "",
    city: "",
    registered_by: ""
  });
  const [editRepresentativeForm, setEditRepresentativeForm] = useState({
    Contact_person_name: "",
    title: "",
    education: "",
    designation: "",
    qualification: "",
    Contact_person_email: "",
    Contact_person_number: "",
    registered_by: "",
    customer: "",
    CV: null
  });
  const [showAddRepresentativeModal, setShowAddRepresentativeModal] = useState(false);
  const itemsPerPage = 10;
  const [showSearch, setShowSearch] = useState(false);
  const [customerIdSearch, setCustomerIdSearch] = useState("");
  const [filterFields, setFilterFields] = useState({ name: "", email: "", type: "" });
  const filterFormRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [registeredByName, setRegisteredByName] = useState("");
  const [success, setSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [customerProducts, setCustomerProducts] = useState({});
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedCustomerForProducts, setSelectedCustomerForProducts] = useState(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    product_names: '',
    productprice: '',
    customer: ''
  });
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [addProductForm, setAddProductForm] = useState({
    product_name: '',
    productprice: '',
    customer: ''
  });
  const [products, setProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/customers/customer/list/');
        if (response.data) {
          setCustomers(response.data);
          setFilteredCustomers(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

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

  useEffect(() => {
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/list_all/');
      if (response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const handleProductSearch = (e) => {
    const value = e.target.value;
    setProductSearchTerm(value);
    setShowProductList(true);

    if (value.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(product =>
      product.product_name && product.product_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product) => {
    setAddProductForm(prev => ({
      ...prev,
      product_name: product.product_name
    }));
    setProductSearchTerm(product.product_name);
    setShowProductList(false);
  };

  const handleAddProductFormChange = (e) => {
    const { name, value } = e.target;
    setAddProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowRepresentative = (representatives, customer) => {
    // Ensure we have valid data
    if (!customer || !customer.representative) {
      setSelectedRepresentative([]);
    } else {
      setSelectedRepresentative(Array.isArray(customer.representative) ? customer.representative : []);
    }
    setSelectedCustomerForRep(customer);
    setShowRepresentativeModal(true);
  };

  const handleCloseRepresentativeModal = () => {
    setShowRepresentativeModal(false);
    setSelectedRepresentative(null);
  };

  const handleShowEditModal = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      Companyname: customer.Companyname,
      Companyemail: customer.Companyemail,
      type: customer.type,
      category: customer.category,
      capacity: customer.capacity,
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
      Companyname: "",
      Companyemail: "",
      type: "",
      category: "",
      capacity: "",
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

  const handleFilterIconClick = () => {
    setShowSearch((prev) => !prev);
    if (!showSearch) {
      setFilterFields({ name: "", email: "", type: "" });
      setFilteredCustomers(customers);
    }
  };

  const handleFilterFieldChange = (e) => {
    const { name, value } = e.target;
    setFilterFields((prev) => ({ ...prev, [name]: value }));
    
    const newFilters = { ...filterFields, [name]: value };
    const matched = customers.filter((customer) =>
      (!newFilters.name || (customer.Companyname && customer.Companyname.toLowerCase().includes(newFilters.name.toLowerCase()))) &&
      (!newFilters.email || (customer.Companyemail && customer.Companyemail.toLowerCase().includes(newFilters.email.toLowerCase()))) &&
      (!newFilters.type || (customer.type && customer.type.toLowerCase().includes(newFilters.type.toLowerCase())))
    );
    setFilteredCustomers(matched);
  };

  const handleApplySearch = () => {
    const { name, email, type } = filterFields;
    if (!name && !email && !type) {
      setFilteredCustomers(customers);
    } else {
      const matched = customers.filter((customer) =>
        (!name || (customer.Companyname && customer.Companyname.toLowerCase().includes(name.toLowerCase()))) &&
        (!email || (customer.Companyemail && customer.Companyemail.toLowerCase().includes(email.toLowerCase()))) &&
        (!type || (customer.type && customer.type.toLowerCase().includes(type.toLowerCase())))
      );
      setFilteredCustomers(matched);
    }
    setShowSearch(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put(
        `/customers/customer/update/${selectedCustomer.Customer_id}/`,
        editForm
      );

      if (response.data) {
        setSuccess(true);
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.Customer_id === selectedCustomer.Customer_id 
              ? { ...customer, ...response.data }
            : customer
        )
      );
      handleCloseEditModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      setLoading(true);
      const response = await api.delete(`/customers/customer/delete/${customerId}/`);

      if (response.status === 200 || response.status === 204) {
        setCustomers((prevCustomers) => prevCustomers.filter(c => c.Customer_id !== customerId));
        setSuccess(true);
        setError(null);
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete customer');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerIdSearch = (e) => {
    const value = e.target.value;
    setCustomerIdSearch(value);
    if (value.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const matched = customers.filter((customer) =>
        customer.Customer_id && customer.Customer_id.toString().toLowerCase().includes(value.trim().toLowerCase())
      );
      setFilteredCustomers(matched);
    }
  };

  const handleShowEditRepresentative = (rep) => {
    setEditRepresentativeForm({
      Contact_person_name: rep.Contact_person_name,
      title: rep.title,
      education: rep.education,
      designation: rep.designation,
      qualification: rep.qualification,
      Contact_person_email: rep.Contact_person_email,
      Contact_person_number: rep.Contact_person_number,
      registered_by: rep.registered_by,
      customer: rep.customer_name
    });
    setSelectedRepresentative(rep);
    setShowEditRepresentativeModal(true);
  };

  const handleCloseEditRepresentativeModal = () => {
    setShowEditRepresentativeModal(false);
    setEditRepresentativeForm({
      Contact_person_name: "",
      title: "",
      education: "",
      designation: "",
      qualification: "",
      Contact_person_email: "",
      Contact_person_number: "",
      registered_by: "",
      customer: "",
      CV: null
    });
  };

  const handleEditRepresentativeFormChange = (e) => {
    const { name, value } = e.target;
    setEditRepresentativeForm(prev => ({
      ...prev,
      [name]: value
    }));
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
      setEditRepresentativeForm(prev => ({
        ...prev,
        CV: file
      }));
    }
  };

  const handleEditRepresentativeSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(editRepresentativeForm).forEach(key => {
        if (key === 'CV' && editRepresentativeForm[key]) {
          formData.append(key, editRepresentativeForm[key]);
        } else if (key !== 'CV') {
          formData.append(key, editRepresentativeForm[key]);
        }
      });

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
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => {
            if (customer.Customer_id === selectedCustomerForRep.Customer_id) {
              return {
                ...customer,
                representative: customer.representative.map(rep => 
                  rep.id === selectedRepresentative.id ? response.data : rep
                )
              };
            }
            return customer;
          })
        );
        handleCloseEditRepresentativeModal();
        handleCloseRepresentativeModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update representative');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepresentative = async (representativeId) => {
    if (!window.confirm('Are you sure you want to delete this representative?')) return;

    try {
      setLoading(true);
      const response = await api.delete(`/customers/representative/delete/${representativeId}/`);

      if (response.status === 200 || response.status === 204) {
        setCustomers(prevCustomers =>
          prevCustomers.map(customer => {
            if (customer.Customer_id === selectedCustomerForRep.Customer_id) {
              return {
                ...customer,
                representative: customer.representative.filter(rep => rep.id !== representativeId)
              };
            }
            return customer;
          })
        );
        setSuccess(true);
        setError(null);
        handleCloseRepresentativeModal();
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

  const handleShowAddRepresentative = () => {
    const userInfo = getUserInfo();
    let registeredById = userInfo.employee_id || userInfo.id;

    setEditRepresentativeForm({
      Contact_person_name: '',
      title: '',
      education: '',
      designation: '',
      qualification: '',
      Contact_person_email: '',
      Contact_person_number: '',
      registered_by: registeredById,
      customer: selectedCustomerForRep.Customer_id,
      customer_name: selectedCustomerForRep.Companyname,
      CV: null
    });
    setShowAddRepresentativeModal(true);
  };

  const handleCloseAddRepresentativeModal = () => {
    setShowAddRepresentativeModal(false);
    setEditRepresentativeForm({
      Contact_person_name: "",
      title: "",
      education: "",
      designation: "",
      qualification: "",
      Contact_person_email: "",
      Contact_person_number: "",
      registered_by: "",
      customer: "",
      CV: null
    });
  };

  const handleAddRepresentativeSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(editRepresentativeForm).forEach(key => {
        if (key === 'CV' && editRepresentativeForm[key]) {
          formData.append(key, editRepresentativeForm[key]);
        } else if (key === 'customer') {
          // Pass the customer name instead of ID
          formData.append(key, selectedCustomerForRep.Companyname);
        } else if (key !== 'CV') {
          formData.append(key, editRepresentativeForm[key]);
        }
      });

      const response = await api.post('/customers/representative/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setSuccess(true);
        // Update the customer's representatives list directly
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => {
            if (customer.Customer_id === selectedCustomerForRep.Customer_id) {
              return {
                ...customer,
                representative: [...(customer.representative || []), response.data]
              };
            }
            return customer;
          })
        );
        // Update the selected representative list
        setSelectedRepresentative(prev => [...(prev || []), response.data]);
        handleCloseAddRepresentativeModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add representative');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/customers/customer/list/');
      
      if (response.data) {
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleShowProducts = (customer) => {
    setSelectedCustomerForProducts(customer);
    setShowProductsModal(true);
  };

  const handleCloseProductsModal = () => {
    setShowProductsModal(false);
    setSelectedCustomerForProducts(null);
  };

  const handleShowEditProduct = (product) => {
    setSelectedProduct(product);
    setEditProductForm({
      product_names: product.product_names,
      productprice: product.productprice,
      customer: selectedCustomerForProducts.Companyname
    });
    setShowEditProductModal(true);
  };

  const handleCloseEditProductModal = () => {
    setShowEditProductModal(false);
    setSelectedProduct(null);
    setEditProductForm({
      product_names: '',
      productprice: '',
      customer: ''
    });
  };

  const handleEditProductFormChange = (e) => {
    const { name, value } = e.target;
    setEditProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = {
        ...editProductForm,
        customer: selectedCustomerForProducts.Companyname
      };
      const response = await api.put(
        `/customers/customer-product/update/${selectedProduct.id}/`,
        formData
      );

      if (response.data) {
        setSuccess(true);
        // Update the customer's products list
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => {
            if (customer.Customer_id === selectedCustomerForProducts.Customer_id) {
              return {
                ...customer,
                products: customer.products.map(product =>
                  product.id === selectedProduct.id ? response.data : product
                )
              };
            }
            return customer;
          })
        );
        handleCloseEditProductModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      const response = await api.delete(`/customers/customer-product/delete/${productId}/`);

      if (response.status === 200 || response.status === 204) {
        setSuccess(true);
        // Update the customer's products list
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => {
            if (customer.Customer_id === selectedCustomerForProducts.Customer_id) {
              return {
                ...customer,
                products: customer.products.filter(product => product.id !== productId)
              };
            }
            return customer;
          })
        );
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerDisplay = (customerId) => {
    const customer = customers.find(c => c.Customer_id === customerId);
    return customer ? customer.Companyname : 'Unknown Customer';
  };

  const currentCustomers = (customerIdSearch || showSearch || filteredCustomers.length > 0) ? filteredCustomers : customers;
  const totalPages = Math.ceil(currentCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = currentCustomers.slice(startIndex, endIndex);

  const handleShowAddProduct = () => {
    setAddProductForm({
      product_name: '',
      productprice: '',
      customer: selectedCustomerForProducts.Companyname
    });
    setShowAddProductModal(true);
  };

  const handleCloseAddProductModal = () => {
    setShowAddProductModal(false);
    setAddProductForm({
      product_name: '',
      productprice: '',
      customer: ''
    });
    setProductSearchTerm('');
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = {
        ...addProductForm,
        customer: selectedCustomerForProducts.Companyname
      };
      const response = await api.post('/customers/customer-product/create/', formData);

      if (response.data) {
        setSuccess(true);
        // Update the customer's products list
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => {
            if (customer.Customer_id === selectedCustomerForProducts.Customer_id) {
              return {
                ...customer,
                products: [...(customer.products || []), response.data]
              };
            }
            return customer;
          })
        );
        handleCloseAddProductModal();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customers/customer/${selectedCustomerForProducts.Customer_id}/products/`);
      if (response.data) {
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => {
            if (customer.Customer_id === selectedCustomerForProducts.Customer_id) {
              return {
                ...customer,
                products: response.data
              };
            }
            return customer;
          })
        );
        setSuccess(true);
        // Clear success message after 2 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh products');
      // Clear error message after 2 seconds
      setTimeout(() => {
        setError(null);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Customer Management</h3>
      
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
            placeholder="Search by Customer ID..."
            value={customerIdSearch}
            onChange={handleCustomerIdSearch}
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
            <RiRefreshLine size={20} className={refreshing ? 'rotating' : ''} />
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
                placeholder="Company Name"
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
              <th scope="col">Customer ID</th>
              <th scope="col">Company Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">City</th>
              <th scope="col">Category</th>
              <th scope="col">Type</th>
              <th scope="col">Capacity</th>
              <th scope="col">Products</th>
              <th scope="col">Representative</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center' }}>No customers found</td>
              </tr>
            ) : (
              paginatedCustomers.map((customer) => (
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
                    {customer.products && customer.products.length > 0 ? (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleShowProducts(customer)}
                      >
                        View ({customer.products.length})
                      </button>
                    ) : (
                      <span className="text-muted">No Products</span>
                    )}
                  </td>
                  <td>
                    {customer.representative && Array.isArray(customer.representative) && customer.representative.length > 0 ? (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleShowRepresentative(customer.representative, customer)}
                      >
                        View ({customer.representative.length})
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
                        onClick={() => handleShowEditModal(customer)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDeleteCustomer(customer.Customer_id)}
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

      {/* Edit Customer Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Customer updated successfully!</Alert>}
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
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Company Phone Number</Form.Label>
                <PhoneInput
                  country={'pk'}
                  value={editForm.Company_phone_number}
                  onChange={(value) => handleEditFormChange({ target: { name: 'Company_phone_number', value } })}
                  inputClass="form-control"
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  inputProps={{
                    name: 'Company_phone_number',
                    required: true
                  }}
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
                  required
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
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Products Modal */}
      <Modal show={showProductsModal} onHide={handleCloseProductsModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Products List - {selectedCustomerForProducts?.Companyname}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : selectedCustomerForProducts && (
            <div className="table-responsive">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Total Products: {selectedCustomerForProducts.products?.length || 0}</h6>
                <Button 
                  variant="outline-primary" 
                  onClick={handleRefreshProducts}
                  disabled={loading}
                  size="sm"
                >
                  <RiRefreshLine size={16} className={loading ? 'rotating' : ''} /> Refresh
                </Button>
              </div>
              <table className="table text-nowrap">
                <thead>
                  <tr>
                    <th scope="col">Product ID</th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Price</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCustomerForProducts.products && selectedCustomerForProducts.products.length > 0 ? (
                    selectedCustomerForProducts.products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.product}</td>
                        <td>{product.product_names}</td>
                        <td>{getCustomerDisplay(product.customer)}</td>
                        <td>{product.productprice}</td>
                        <td>
                          <div className="hstack gap-2 fs-15">
                            <button
                              className="btn btn-icon btn-sm btn-primary"
                              title="Edit"
                              onClick={() => handleShowEditProduct(product)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              className="btn btn-icon btn-sm btn-danger"
                              title="Delete"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No products found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleShowAddProduct}>
            Add Product
          </Button>
          <Button variant="secondary" onClick={handleCloseProductsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal */}
      <Modal show={showAddProductModal} onHide={handleCloseAddProductModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Product added successfully!</Alert>}
          <Form onSubmit={handleAddProductSubmit}>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Product Name</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    placeholder="Search for a product..."
                    className="form-control form-control-sm"
                  />
                  {showProductList && filteredProducts.length > 0 && (
                    <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
                      {filteredProducts.map((product) => (
                        <ListGroup.Item
                          key={product.id}
                          action
                          onClick={() => handleProductSelect(product)}
                          style={{ cursor: 'pointer' }}
                        >
                          {product.product_name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Customer</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedCustomerForProducts?.Companyname}
                  className="form-control form-control-sm"
                  readOnly
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Price</Form.Label>
                <Form.Control
                  type="number"
                  name="productprice"
                  value={addProductForm.productprice}
                  onChange={handleAddProductFormChange}
                  className="form-control form-control-sm"
                  step="0.01"
                  min="0"
                  required
                />
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseAddProductModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={showEditProductModal} onHide={handleCloseEditProductModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Product updated successfully!</Alert>}
          <Form onSubmit={handleEditProductSubmit}>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="product_names"
                  value={editProductForm.product_names}
                  className="form-control form-control-sm"
                  readOnly
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Customer</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedCustomerForProducts?.Companyname}
                  className="form-control form-control-sm"
                  readOnly
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Price</Form.Label>
                <Form.Control
                  type="number"
                  name="productprice"
                  value={editProductForm.productprice}
                  onChange={handleEditProductFormChange}
                  className="form-control form-control-sm"
                  step="0.01"
                  min="0"
                  required
                />
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseEditProductModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Representative Modal */}
      <Modal show={showRepresentativeModal} onHide={handleCloseRepresentativeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Representatives List - {selectedCustomerForRep?.Companyname}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : selectedRepresentative && (
            <div className="table-responsive">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Total Representatives: {selectedRepresentative.length}</h6>
              </div>
              <table className="table text-nowrap">
                <thead>
                  <tr>
                    <th scope="col">Contact Person</th>
                    <th scope="col">Title</th>
                    <th scope="col">Education</th>
                    <th scope="col">Designation</th>
                    <th scope="col">Qualification</th>
                    <th scope="col">Email</th>
                    <th scope="col">Contact</th>
                    <th scope="col">CV</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRepresentative.length > 0 ? (
                    selectedRepresentative.map((rep) => (
                      <tr key={rep.id}>
                        <td>{rep.Contact_person_name}</td>
                        <td>{rep.title || '-'}</td>
                        <td>{rep.education || '-'}</td>
                        <td>{rep.designation || '-'}</td>
                        <td>{rep.qualification || '-'}</td>
                        <td>{rep.Contact_person_email}</td>
                        <td>{rep.Contact_person_number}</td>
                        <td>
                          {rep.CV ? (
                            <a 
                              href={rep.CV} 
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
                              onClick={() => handleShowEditRepresentative(rep)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              className="btn btn-icon btn-sm btn-danger"
                              title="Delete"
                              onClick={() => handleDeleteRepresentative(rep.id)}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">No representatives found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleShowAddRepresentative}>
            Add Representative
          </Button>
          <Button variant="secondary" onClick={handleCloseRepresentativeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Representative Modal */}
      <Modal show={showAddRepresentativeModal} onHide={handleCloseAddRepresentativeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Representative</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>Representative added successfully!</Alert>}
          <Form onSubmit={handleAddRepresentativeSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="Contact_person_name"
                  value={editRepresentativeForm.Contact_person_name}
                  onChange={handleEditRepresentativeFormChange}
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
                  value={editRepresentativeForm.title}
                  onChange={handleEditRepresentativeFormChange}
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
                  value={editRepresentativeForm.education}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  maxLength={100}
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
                  value={editRepresentativeForm.qualification}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  maxLength={100}
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="Contact_person_email"
                  value={editRepresentativeForm.Contact_person_email}
                  onChange={handleEditRepresentativeFormChange}
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
                  value={editRepresentativeForm.Contact_person_number}
                  onChange={(value) => handleEditRepresentativeFormChange({ target: { name: 'Contact_person_number', value } })}
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
                <Form.Control
                  type="text"
                  value={selectedCustomerForRep?.Companyname}
                  className="form-control form-control-sm"
                  readOnly
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">CV</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  className="form-control form-control-sm"
                  accept=".pdf,.doc,.docx"
                />
                <small className="text-muted">Accepted formats: PDF, DOC, DOCX (max 5MB)</small>
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

      {/* Edit Representative Modal */}
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
                  name="Contact_person_name"
                  value={editRepresentativeForm.Contact_person_name}
                  onChange={handleEditRepresentativeFormChange}
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
                  value={editRepresentativeForm.title}
                  onChange={handleEditRepresentativeFormChange}
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
                  value={editRepresentativeForm.education}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  maxLength={100}
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
                  value={editRepresentativeForm.qualification}
                  onChange={handleEditRepresentativeFormChange}
                  className="form-control form-control-sm"
                  maxLength={100}
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="Contact_person_email"
                  value={editRepresentativeForm.Contact_person_email}
                  onChange={handleEditRepresentativeFormChange}
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
                  value={editRepresentativeForm.Contact_person_number}
                  onChange={(value) => handleEditRepresentativeFormChange({ target: { name: 'Contact_person_number', value } })}
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
                <Form.Control
                  type="text"
                  value={selectedCustomerForRep?.Companyname}
                  className="form-control form-control-sm"
                  readOnly
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
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

      <style>
        {`
          .rotating {
            animation: rotate 1s linear infinite;
          }
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .badge {
            font-size: 0.8rem;
            padding: 0.35em 0.65em;
          }
          .bg-info-transparent {
            background-color: rgba(13, 202, 240, 0.1);
            color: #0dcaf0;
          }
          .bg-primary-transparent {
            background-color: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
          }
          .bg-success-transparent {
            background-color: rgba(25, 135, 84, 0.1);
            color: #198754;
          }
          .btn-warning {
            background-color: #ffc107;
            border-color: #ffc107;
            color: #000;
          }
          .btn-warning:hover {
            background-color: #ffca2c;
            border-color: #ffc720;
            color: #000;
          }
          .btn-info {
            background-color: #0dcaf0;
            border-color: #0dcaf0;
            color: #000;
          }
          .btn-info:hover {
            background-color: #31d2f2;
            border-color: #25cff2;
            color: #000;
          }
          .position-relative {
            position: relative;
          }
          .position-absolute {
            position: absolute;
            top: 100%;
            left: 0;
            max-height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .list-group-item:hover {
            background-color: #f8f9fa;
          }
        `}
      </style>
    </div>
  );
};

export default CustomerTable; 