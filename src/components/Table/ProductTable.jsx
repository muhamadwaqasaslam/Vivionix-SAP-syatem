import React, { useState, useEffect, useRef } from 'react';
import {  Row, Col, Form, Button, Modal, Alert } from 'react-bootstrap';
import api from '../../utils/api';
import './EmployeeTable.css';
import Select from 'react-select';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({
    product_name: "",
    reference_number: "",
    packsize: "",
    packprice: "",
    vendor_id: "",
    remarks: "",
    registered_by_name: "",
    Qualitycertifications: "",
    product_category: [],
    brocure: null,
    ifu: null,
    CE: null,
    USFDA: null,
    MHLW: null,
    NMPA: null,
    IFCC: null,
  });
  const itemsPerPage = 10;
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationVariant, setNotificationVariant] = useState('success');
  const [vendors, setVendors] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterFields, setFilterFields] = useState({
    product_name: "",
    reference_number: "",
    vendor: "",
    category: ""
  });
  const filterFormRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products/list_all/');
        // Process the product_category to ensure it's an array of strings
        const processedProducts = response.data.map(product => {
          let categories = product.product_category;
          if (typeof categories === 'string') {
            // Attempt to parse the string representation of a list
            try {
              // Remove brackets and split by comma, then trim spaces and quotes
              categories = categories.replace(/[[\]']/g, '').split(',').map(cat => cat.trim()).filter(Boolean);
            } catch (e) {
              console.error('Failed to parse product_category string:', categories, e);
              categories = []; // Default to empty array on parse error
            }
          } else if (!Array.isArray(categories)) {
            // If it's neither a string nor an array, default to empty array
            categories = [];
          }
          // Ensure vendor_id is correctly mapped
          return { ...product, product_category: categories, vendor_id: product.vendor_id };
        });
        setProducts(processedProducts);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Fetch vendors for the dropdown
    const fetchVendors = async () => {
      try {
        const response = await api.get('/vendors/list_all/');
        setVendors(response.data);
        console.log('Fetched vendors:', response.data); // Log fetched vendors
      } catch (err) {
        console.error('Error fetching vendors:', err);
      }
    };

    fetchVendors();
  }, []);

  const handleShowNotification = (message, variant) => {
    setNotificationMessage(message);
    setNotificationVariant(variant);
    setShowNotification(true);

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleDelete = async (product_id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Updated API call based on the correct endpoint structure
        const response = await api.delete(`/products/delete/${product_id}/`);
        
        if (response.data.success) {
          // Remove the deleted product from the state
          setProducts(prevProducts => 
            prevProducts.filter(product => product.product_id !== product_id)
          );
          handleShowNotification('Product deleted successfully!', 'success');
        } else {
           // Handle cases where API returns success: false or similar
          handleShowNotification(response.data.detail || 'Failed to delete product.', 'danger');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        handleShowNotification(err.response?.data?.detail || 'Failed to delete product.', 'danger');
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleShowEdit = (product) => {
    setEditingProductId(product.product_id);
    console.log('Editing product vendor_id:', product.vendor_id); // Log product vendor ID
    setEditForm({
      product_name: product.product_name,
      reference_number: product.reference_number,
      packsize: product.packsize,
      packprice: product.packprice,
      vendor_id: product.vendor_id,
      remarks: product.remarks,
      registered_by_name: product.registered_by_name,
      Qualitycertifications: product.Qualitycertifications,
      product_category: Array.isArray(product.product_category) ? product.product_category : [product.product_category].filter(Boolean),
      brocure: product.brocure,
      ifu: product.ifu,
      ce_certificate: product.ce_certificate,
      usfda_certificate: product.usfda_certificate,
      jis_mhlw_certificate: product.jis_mhlw_certificate,
      nmpa_certificate: product.nmpa_certificate,
      ifcc_certificate: product.ifcc_certificate,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProductId(null);
    setEditForm({
      product_name: "",
      reference_number: "",
      packsize: "",
      packprice: "",
      vendor_id: "",
      remarks: "",
      registered_by_name: "",
      Qualitycertifications: "",
      product_category: [],
      brocure: null,
      ifu: null,
      ce_certificate: null,
      usfda_certificate: null,
      jis_mhlw_certificate: null,
      nmpa_certificate: null,
      ifcc_certificate: null,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setEditForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditCategoryChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setEditForm(prev => ({
      ...prev,
      product_category: selectedValues
    }));
  };

  const handleEditFileChange = (e, field) => {
    const file = e.target.files[0];
    setEditForm(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('product_name', editForm.product_name);
      formData.append('reference_number', editForm.reference_number);
      formData.append('packsize', editForm.packsize);
      formData.append('packprice', editForm.packprice);
      formData.append('vendor_id', editForm.vendor_id);
      formData.append('remarks', editForm.remarks);
      formData.append('registered_by_name', editForm.registered_by_name);
      formData.append('Qualitycertifications', editForm.Qualitycertifications);
      
      // Append product categories as individual values
      if (Array.isArray(editForm.product_category)) {
        editForm.product_category.forEach(category => {
          if (category) {
            formData.append('product_category', category);
          }
        });
      } else if (editForm.product_category) {
        formData.append('product_category', editForm.product_category);
      }

      // Append file fields if they exist
      if (editForm.brocure) {
        formData.append('brocure', editForm.brocure);
      }
      if (editForm.ifu) {
        formData.append('ifu', editForm.ifu);
      }
      if (editForm.ce_certificate) {
        formData.append('CE', editForm.ce_certificate);
      }
      if (editForm.usfda_certificate) {
        formData.append('USFDA', editForm.usfda_certificate);
      }
      if (editForm.jis_mhlw_certificate) {
        formData.append('MHLW', editForm.jis_mhlw_certificate);
      }
      if (editForm.nmpa_certificate) {
        formData.append('NMPA', editForm.nmpa_certificate);
      }
      if (editForm.ifcc_certificate) {
        formData.append('IFCC', editForm.ifcc_certificate);
      }

      // Updated API call for product update
      const response = await api.put(`/products/update/${editingProductId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update the products list with the edited product
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.product_id === editingProductId 
            ? response.data
            : product
        )
      );

      handleCloseEditModal();
      handleShowNotification('Product updated successfully!', 'success');

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update product');
      console.error('Error updating product:', err);
      handleShowNotification(err.response?.data?.detail || 'Failed to update product.', 'danger');
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const categories = Array.isArray(product.product_category) 
      ? product.product_category 
      : [product.product_category].filter(Boolean);
    
    return (
      product.product_name?.toLowerCase().includes(searchLower) ||
      product.reference_number?.toLowerCase().includes(searchLower) ||
      product.vendor_display_name?.toLowerCase().includes(searchLower) ||
      categories.some(cat => cat?.toLowerCase().includes(searchLower))
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Add click outside handler
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

  const handleFilterIconClick = () => {
    setShowSearch((prev) => !prev);
    if (!showSearch) {
      setFilterFields({
        product_name: "",
        reference_number: "",
        vendor: "",
        category: ""
      });
      setFilteredProducts(products);
    }
  };

  const handleFilterFieldChange = (e) => {
    const { name, value } = e.target;
    setFilterFields((prev) => ({ ...prev, [name]: value }));
    
    const newFilters = { ...filterFields, [name]: value };
    const matched = products.filter((product) =>
      (!newFilters.product_name || (product.product_name && product.product_name.toLowerCase().includes(newFilters.product_name.toLowerCase()))) &&
      (!newFilters.reference_number || (product.reference_number && product.reference_number.toLowerCase().includes(newFilters.reference_number.toLowerCase()))) &&
      (!newFilters.vendor || (product.vendor_display_name && product.vendor_display_name.toLowerCase().includes(newFilters.vendor.toLowerCase()))) &&
      (!newFilters.category || (product.product_category && 
        (Array.isArray(product.product_category) 
          ? product.product_category.some(cat => cat.toLowerCase().includes(newFilters.category.toLowerCase()))
          : product.product_category.toLowerCase().includes(newFilters.category.toLowerCase())
        )
      ))
    );
    setFilteredProducts(matched);
  };

  const handleApplySearch = () => {
    const { product_name, reference_number, vendor, category } = filterFields;
    if (!product_name && !reference_number && !vendor && !category) {
      setFilteredProducts(products);
    } else {
      const matched = products.filter((product) =>
        (!product_name || (product.product_name && product.product_name.toLowerCase().includes(product_name.toLowerCase()))) &&
        (!reference_number || (product.reference_number && product.reference_number.toLowerCase().includes(reference_number.toLowerCase()))) &&
        (!vendor || (product.vendor_display_name && product.vendor_display_name.toLowerCase().includes(vendor.toLowerCase()))) &&
        (!category || (product.product_category && 
          (Array.isArray(product.product_category) 
            ? product.product_category.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
            : product.product_category.toLowerCase().includes(category.toLowerCase())
          )
        ))
      );
      setFilteredProducts(matched);
    }
    setShowSearch(false);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.get('/products/list_all/');
      const processedProducts = response.data.map(product => {
        let categories = product.product_category;
        if (typeof categories === 'string') {
          try {
            categories = categories.replace(/[[\]']/g, '').split(',').map(cat => cat.trim()).filter(Boolean);
          } catch (e) {
            console.error('Failed to parse product_category string:', categories, e);
            categories = [];
          }
        } else if (!Array.isArray(categories)) {
          categories = [];
        }
        return { ...product, product_category: categories, vendor_id: product.vendor_id };
      });
      setProducts(processedProducts);
      setFilteredProducts(processedProducts);
    } catch (err) {
      console.error('Error refreshing products:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Product Management</h3>
      
      {/* Notification Alert */}
      <Alert 
        show={showNotification} 
        variant={notificationVariant} 
        onClose={() => setShowNotification(false)} 
        dismissible
      >
        {notificationMessage}
      </Alert>

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
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
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
            variant="outline-secondary" 
            onClick={handleRefresh}
            style={{ 
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Refresh Table"
            disabled={isRefreshing}
          >
            <RiRefreshLine 
              size={20} 
              style={{ 
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                transformOrigin: 'center'
              }} 
            />
          </Button>
          {showSearch && (
            <div
              ref={filterFormRef}
              className="filter-dropdown"
            >
              <input
                type="text"
                name="product_name"
                className="form-control search-input"
                placeholder="Product Name"
                value={filterFields.product_name}
                onChange={handleFilterFieldChange}
              />
              <input
                type="text"
                name="reference_number"
                className="form-control search-input"
                placeholder="Reference Number"
                value={filterFields.reference_number}
                onChange={handleFilterFieldChange}
              />
              <input
                type="text"
                name="vendor"
                className="form-control search-input"
                placeholder="Vendor"
                value={filterFields.vendor}
                onChange={handleFilterFieldChange}
              />
              <input
                type="text"
                name="category"
                className="form-control search-input"
                placeholder="Category"
                value={filterFields.category}
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
              <th scope="col">Product ID</th>
              <th scope="col">Name</th>
              <th scope="col">Reference</th>
              <th scope="col">Pack Size</th>
              <th scope="col">Pack Price</th>
              <th scope="col">Registration Date</th>
              <th scope="col">Category</th>
              <th scope="col">Remarks</th>
              <th scope="col">Registered By</th>
              <th scope="col">Quality Certifications</th>
              <th scope="col">Brochure</th>
              <th scope="col">IFU</th>
              <th scope="col">CE Cert</th>
              <th scope="col">USFDA Cert</th>
              <th scope="col">JIS/MHLW Cert</th>
              <th scope="col">NMPA Cert</th>
              <th scope="col">IFCC Cert</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.product_id}>
                <td>{product.product_id}</td>
                <td>
                  <button
                    className="btn btn-link btn-sm p-0"
                  >
                    {product.product_name}
                  </button>
                </td>
                <td>{product.reference_number}</td>
                <td>{product.packsize}</td>
                <td>{product.packprice}</td>
                <td>{new Date(product.reg_date).toLocaleDateString()}</td>
                <td>
                  {Array.isArray(product.product_category) ? (
                    product.product_category.map((category, index) => (
                      <span key={index} className="badge bg-info-transparent me-1">
                        {category}
                      </span>
                    ))
                  ) : (
                    <span className="badge bg-info-transparent">
                      {product.product_category}
                    </span>
                  )}
                </td>
                <td>{product.remarks}</td>
                <td>{product.registered_by_name || "N/A"}</td>
                <td>{product.Qualitycertifications}</td>
                <td>
                  {product.brocure ? (
                    <a href={product.brocure} target="_blank" rel="noopener noreferrer">View Brochure</a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {product.ifu ? (
                    <a href={product.ifu} target="_blank" rel="noopener noreferrer">View IFU</a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {product.ce_certificate ? (
                    <a href={product.ce_certificate} target="_blank" rel="noopener noreferrer">View CE Cert</a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {product.usfda_certificate ? (
                    <a href={product.usfda_certificate} target="_blank" rel="noopener noreferrer">View USFDA Cert</a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {product.jis_mhlw_certificate ? (
                    <a href={product.jis_mhlw_certificate} target="_blank" rel="noopener noreferrer">View JIS/MHLW Cert</a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {product.nmpa_certificate ? (
                    <a href={product.nmpa_certificate} target="_blank" rel="noopener noreferrer">View NMPA Cert</a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {product.ifcc_certificate ? (
                    <a href={product.ifcc_certificate} target="_blank" rel="noopener noreferrer">View IFCC Cert</a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  <div className="hstack gap-2 fs-15">
                    <button 
                      className="btn btn-icon btn-sm btn-primary"
                      title="Edit"
                      onClick={() => handleShowEdit(product)}
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      className="btn btn-icon btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDelete(product.product_id)}
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

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="product_name"
                  value={editForm.product_name}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Reference Number</Form.Label>
                <Form.Control
                  type="text"
                  name="reference_number"
                  value={editForm.reference_number}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Pack Size</Form.Label>
                <Form.Control
                  type="text"
                  name="packsize"
                  value={editForm.packsize}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Pack Price</Form.Label>
                <Form.Control
                  type="text"
                  name="packprice"
                  value={editForm.packprice}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Vendor</Form.Label>
                <Form.Control
                  as="select"
                  name="vendor_id"
                  value={editForm.vendor_id}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.vendor_id} value={vendor.vendor_id}>
                      {vendor.vendorname}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Category</Form.Label>
                <Select
                  isMulti
                  name="product_category"
                  value={editForm.product_category.map(category => ({ value: category, label: category }))}
                  onChange={handleEditCategoryChange}
                  options={[
                    { value: 'Equipment', label: 'Equipment' },
                    { value: 'Chemical', label: 'Chemical' },
                    { value: 'Consumable Device', label: 'Consumable Device' }
                  ]}
                  className="form-control-sm p-0"
                  classNamePrefix="select"
                  placeholder="Select Category(s)"
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      fontSize: '0.875rem',
                      padding: '4px 8px'
                    }),
                    menu: (provided) => ({
                      ...provided,
                      fontSize: '0.875rem'
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      fontSize: '0.875rem'
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      fontSize: '0.875rem',
                      padding: '2px 6px'
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      padding: '2px 6px'
                    }),
                    control: (provided) => ({
                      ...provided,
                      minHeight: '31px',
                      fontSize: '0.875rem'
                    }),
                    valueContainer: (provided) => ({
                      ...provided,
                      padding: '0 8px'
                    })
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Quality Certifications</Form.Label>
                <Form.Control
                  type="text"
                  name="Qualitycertifications"
                  value={editForm.Qualitycertifications}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Registered By</Form.Label>
                <Form.Control
                  type="text"
                  name="registered_by_name"
                  value={editForm.registered_by_name}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label className="form-label small">Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  name="remarks"
                  value={editForm.remarks}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  rows="2"
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-2">
                <Form.Label className="form-label small">Brochure</Form.Label>
                <Form.Control
                  type="file"
                  name="brocure"
                  onChange={(e) => handleEditFileChange(e, 'brocure')}
                  className="form-control form-control-sm"
                />
                {typeof editForm.brocure === 'string' && editForm.brocure && (
                  <small className="text-muted">Current file: <a href={editForm.brocure} target="_blank" rel="noopener noreferrer">{editForm.brocure.split('/').pop()}</a></small>
                )}
              </Col>
              <Col md={4} className="mb-2">
                <Form.Label className="form-label small">IFU</Form.Label>
                <Form.Control
                  type="file"
                  name="ifu"
                  onChange={(e) => handleEditFileChange(e, 'ifu')}
                  className="form-control form-control-sm"
                />
                {typeof editForm.ifu === 'string' && editForm.ifu && (
                  <small className="text-muted">Current file: <a href={editForm.ifu} target="_blank" rel="noopener noreferrer">{editForm.ifu.split('/').pop()}</a></small>
                )}
              </Col>
              <Col md={4} className="mb-2">
                <Form.Label className="form-label small">CE Certificate</Form.Label>
                <Form.Control
                  type="file"
                  name="ce_certificate"
                  onChange={(e) => handleEditFileChange(e, 'ce_certificate')}
                  className="form-control form-control-sm"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {typeof editForm.ce_certificate === 'string' && editForm.ce_certificate && (
                  <small className="text-muted">Current file: <a href={editForm.ce_certificate} target="_blank" rel="noopener noreferrer">{editForm.ce_certificate.split('/').pop()}</a></small>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-2">
                <Form.Label className="form-label small">USFDA Certificate</Form.Label>
                <Form.Control
                  type="file"
                  name="usfda_certificate"
                  onChange={(e) => handleEditFileChange(e, 'usfda_certificate')}
                  className="form-control form-control-sm"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {typeof editForm.usfda_certificate === 'string' && editForm.usfda_certificate && (
                  <small className="text-muted">Current file: <a href={editForm.usfda_certificate} target="_blank" rel="noopener noreferrer">{editForm.usfda_certificate.split('/').pop()}</a></small>
                )}
              </Col>
              <Col md={4} className="mb-2">
                <Form.Label className="form-label small">JIS/MHLW Certificate</Form.Label>
                <Form.Control
                  type="file"
                  name="jis_mhlw_certificate"
                  onChange={(e) => handleEditFileChange(e, 'jis_mhlw_certificate')}
                  className="form-control form-control-sm"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {typeof editForm.jis_mhlw_certificate === 'string' && editForm.jis_mhlw_certificate && (
                  <small className="text-muted">Current file: <a href={editForm.jis_mhlw_certificate} target="_blank" rel="noopener noreferrer">{editForm.jis_mhlw_certificate.split('/').pop()}</a></small>
                )}
              </Col>
              <Col md={4} className="mb-2">
                <Form.Label className="form-label small">NMPA Certificate</Form.Label>
                <Form.Control
                  type="file"
                  name="nmpa_certificate"
                  onChange={(e) => handleEditFileChange(e, 'nmpa_certificate')}
                  className="form-control form-control-sm"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {typeof editForm.nmpa_certificate === 'string' && editForm.nmpa_certificate && (
                  <small className="text-muted">Current file: <a href={editForm.nmpa_certificate} target="_blank" rel="noopener noreferrer">{editForm.nmpa_certificate.split('/').pop()}</a></small>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-2">
                <Form.Label className="form-label small">IFCC Certificate</Form.Label>
                <Form.Control
                  type="file"
                  name="ifcc_certificate"
                  onChange={(e) => handleEditFileChange(e, 'ifcc_certificate')}
                  className="form-control form-control-sm"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {typeof editForm.ifcc_certificate === 'string' && editForm.ifcc_certificate && (
                  <small className="text-muted">Current file: <a href={editForm.ifcc_certificate} target="_blank" rel="noopener noreferrer">{editForm.ifcc_certificate.split('/').pop()}</a></small>
                )}
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

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .filter-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 200px;
          }
          .filter-dropdown input {
            margin-bottom: 0.5rem;
          }
        `}
      </style>
    </div>
  );
};

export default ProductTable; 