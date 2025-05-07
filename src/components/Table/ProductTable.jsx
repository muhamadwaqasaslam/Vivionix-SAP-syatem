import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Modal, Table, Alert } from 'react-bootstrap';
import './EmployeeTable.css';

const ProductTable = () => {
  // Dummy data for testing
  const dummyProducts = [
    {
      product_id: "PRD001",
      product_name: "Digital Thermometer",
      reference_number: "REF001",
      packsize: "10 units",
      packprice: "$50.00",
      price_date: "2024-03-15",
      vendor_display_name: "MediTech Solutions",
      is_available: true,
      Qualitycertifications: "ISO 13485",
      product_category: "Equipment",
      brocure: "https://example.com/brochure1.pdf",
      ifu: "https://example.com/ifu1.pdf",
      certificates: "https://example.com/cert1.pdf"
    },
    {
      product_id: "PRD002",
      product_name: "Disposable Gloves",
      reference_number: "REF002",
      packsize: "100 pairs",
      packprice: "$25.00",
      price_date: "2024-03-10",
      vendor_display_name: "Safety First Medical",
      is_available: true,
      Qualitycertifications: "CE Certified",
      product_category: "Consumable Device",
      brocure: null,
      ifu: "https://example.com/ifu2.pdf",
      certificates: "https://example.com/cert2.pdf"
    },
    {
      product_id: "PRD003",
      product_name: "Antiseptic Solution",
      reference_number: "REF003",
      packsize: "500ml",
      packprice: "$15.00",
      price_date: "2024-03-05",
      vendor_display_name: "CleanCare Pharma",
      is_available: false,
      Qualitycertifications: "FDA Approved",
      product_category: "Chemical",
      brocure: "https://example.com/brochure3.pdf",
      ifu: null,
      certificates: "https://example.com/cert3.pdf"
    },
    {
      product_id: "PRD004",
      product_name: "Blood Pressure Monitor",
      reference_number: "REF004",
      packsize: "1 unit",
      packprice: "$120.00",
      price_date: "2024-03-20",
      vendor_display_name: "HealthTech Devices",
      is_available: true,
      Qualitycertifications: "ISO 13485, CE",
      product_category: "Equipment",
      brocure: "https://example.com/brochure4.pdf",
      ifu: "https://example.com/ifu4.pdf",
      certificates: null
    },
    {
      product_id: "PRD005",
      product_name: "Surgical Masks",
      reference_number: "REF005",
      packsize: "50 units",
      packprice: "$30.00",
      price_date: "2024-03-18",
      vendor_display_name: "ProtectPlus Medical",
      is_available: true,
      Qualitycertifications: "ASTM Level 3",
      product_category: "Consumable Device",
      brocure: null,
      ifu: "https://example.com/ifu5.pdf",
      certificates: "https://example.com/cert5.pdf"
    },
    {
      product_id: "PRD006",
      product_name: "Stethoscope",
      reference_number: "REF006",
      packsize: "1 unit",
      packprice: "$45.00",
      price_date: "2024-03-22",
      vendor_display_name: "MediTech Solutions",
      is_available: true,
      Qualitycertifications: "ISO 13485",
      product_category: "Equipment",
      brocure: "https://example.com/brochure6.pdf",
      ifu: "https://example.com/ifu6.pdf",
      certificates: "https://example.com/cert6.pdf"
    },
    {
      product_id: "PRD007",
      product_name: "Bandages",
      reference_number: "REF007",
      packsize: "100 units",
      packprice: "$20.00",
      price_date: "2024-03-19",
      vendor_display_name: "Safety First Medical",
      is_available: true,
      Qualitycertifications: "CE Certified",
      product_category: "Consumable Device",
      brocure: null,
      ifu: "https://example.com/ifu7.pdf",
      certificates: "https://example.com/cert7.pdf"
    },
    {
      product_id: "PRD008",
      product_name: "Disinfectant Wipes",
      reference_number: "REF008",
      packsize: "200 wipes",
      packprice: "$35.00",
      price_date: "2024-03-17",
      vendor_display_name: "CleanCare Pharma",
      is_available: false,
      Qualitycertifications: "FDA Approved",
      product_category: "Chemical",
      brocure: "https://example.com/brochure8.pdf",
      ifu: null,
      certificates: "https://example.com/cert8.pdf"
    },
    {
      product_id: "PRD009",
      product_name: "Pulse Oximeter",
      reference_number: "REF009",
      packsize: "1 unit",
      packprice: "$80.00",
      price_date: "2024-03-21",
      vendor_display_name: "HealthTech Devices",
      is_available: true,
      Qualitycertifications: "ISO 13485, CE",
      product_category: "Equipment",
      brocure: "https://example.com/brochure9.pdf",
      ifu: "https://example.com/ifu9.pdf",
      certificates: null
    },
    {
      product_id: "PRD010",
      product_name: "Face Shields",
      reference_number: "REF010",
      packsize: "25 units",
      packprice: "$40.00",
      price_date: "2024-03-16",
      vendor_display_name: "ProtectPlus Medical",
      is_available: true,
      Qualitycertifications: "ASTM Level 3",
      product_category: "Consumable Device",
      brocure: null,
      ifu: "https://example.com/ifu10.pdf",
      certificates: "https://example.com/cert10.pdf"
    },
    {
      product_id: "PRD011",
      product_name: "Digital Scale",
      reference_number: "REF011",
      packsize: "1 unit",
      packprice: "$90.00",
      price_date: "2024-03-23",
      vendor_display_name: "MediTech Solutions",
      is_available: true,
      Qualitycertifications: "ISO 13485",
      product_category: "Equipment",
      brocure: "https://example.com/brochure11.pdf",
      ifu: "https://example.com/ifu11.pdf",
      certificates: "https://example.com/cert11.pdf"
    },
    {
      product_id: "PRD012",
      product_name: "Cotton Swabs",
      reference_number: "REF012",
      packsize: "500 units",
      packprice: "$15.00",
      price_date: "2024-03-14",
      vendor_display_name: "Safety First Medical",
      is_available: true,
      Qualitycertifications: "CE Certified",
      product_category: "Consumable Device",
      brocure: null,
      ifu: "https://example.com/ifu12.pdf",
      certificates: "https://example.com/cert12.pdf"
    }
  ];

  const [products, setProducts] = useState(dummyProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    product_name: "",
    reference_number: "",
    packsize: "",
    packprice: "",
    price_date: "",
    vendor_display_name: "",
    is_available: true,
    Qualitycertifications: "",
    product_category: "",
    brocure: null,
    ifu: null,
    certificates: null
  });
  const itemsPerPage = 10;

  // Comment out the API call for now
  /*
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://my.vivionix.com/products/list_all/');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  */

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleShowDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  const handleShowEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({
      product_name: product.product_name,
      reference_number: product.reference_number,
      packsize: product.packsize,
      packprice: product.packprice,
      price_date: product.price_date,
      vendor_display_name: product.vendor_display_name,
      is_available: product.is_available,
      Qualitycertifications: product.Qualitycertifications,
      product_category: product.product_category,
      brocure: product.brocure,
      ifu: product.ifu,
      certificates: product.certificates
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    setEditForm({
      product_name: "",
      reference_number: "",
      packsize: "",
      packprice: "",
      price_date: "",
      vendor_display_name: "",
      is_available: true,
      Qualitycertifications: "",
      product_category: "",
      brocure: null,
      ifu: null,
      certificates: null
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.product_id === selectedProduct.product_id 
            ? { ...product, ...editForm }
            : product
        )
      );
      handleCloseEditModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.product_name.toLowerCase().includes(searchLower) ||
      product.reference_number.toLowerCase().includes(searchLower) ||
      product.vendor_display_name?.toLowerCase().includes(searchLower) ||
      product.product_category?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
      <h3 className="table-heading">Product Management</h3>
      
      <div className="table-header">
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
          />
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
              <th scope="col">Price Date</th>
              <th scope="col">Vendor</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
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
                    onClick={() => handleShowDetails(product)}
                  >
                    {product.product_name}
                  </button>
                </td>
                <td>{product.reference_number}</td>
                <td>{product.packsize}</td>
                <td>{product.packprice}</td>
                <td>{new Date(product.price_date).toLocaleDateString()}</td>
                <td>{product.vendor_display_name}</td>
                <td>
                  <span className="badge bg-info-transparent">
                    {product.product_category}
                  </span>
                </td>
                <td>
                  <span className={`badge ${product.is_available ? 'bg-success-transparent' : 'bg-danger-transparent'}`}>
                    {product.is_available ? 'Available' : 'Not Available'}
                  </span>
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

      {/* Product Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <Row>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProduct.product_name}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Reference Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProduct.reference_number}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Pack Size</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProduct.packsize}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Pack Price</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProduct.packprice}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Price Date</Form.Label>
                  <Form.Control
                    type="text"
                    value={new Date(selectedProduct.price_date).toLocaleDateString()}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Vendor</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProduct.vendor_display_name}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Product Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProduct.product_category}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
                <Col md={6} className="mb-2">
                  <Form.Label className="form-label small">Quality Certifications</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProduct.Qualitycertifications}
                    className="form-control form-control-sm"
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Col md={4} className="mb-2">
                  <Form.Label className="form-label small">Brochure</Form.Label>
                  {selectedProduct.brocure ? (
                    <a 
                      href={selectedProduct.brocure}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link btn-sm p-0"
                    >
                      View Brochure
                    </a>
                  ) : (
                    <span className="text-muted">No brochure available</span>
                  )}
                </Col>
                <Col md={4} className="mb-2">
                  <Form.Label className="form-label small">IFU</Form.Label>
                  {selectedProduct.ifu ? (
                    <a 
                      href={selectedProduct.ifu}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link btn-sm p-0"
                    >
                      View IFU
                    </a>
                  ) : (
                    <span className="text-muted">No IFU available</span>
                  )}
                </Col>
                <Col md={4} className="mb-2">
                  <Form.Label className="form-label small">Certificates</Form.Label>
                  {selectedProduct.certificates ? (
                    <a 
                      href={selectedProduct.certificates}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link btn-sm p-0"
                    >
                      View Certificates
                    </a>
                  ) : (
                    <span className="text-muted">No certificates available</span>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
                <Form.Label className="form-label small">Price Date</Form.Label>
                <Form.Control
                  type="date"
                  name="price_date"
                  value={editForm.price_date}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Vendor</Form.Label>
                <Form.Control
                  type="text"
                  name="vendor_display_name"
                  value={editForm.vendor_display_name}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Product Category</Form.Label>
                <Form.Select
                  name="product_category"
                  value={editForm.product_category}
                  onChange={handleEditFormChange}
                  className="form-control form-control-sm"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Consumable Device">Consumable Device</option>
                </Form.Select>
              </Col>
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
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label className="form-label small">Availability</Form.Label>
                <Form.Check
                  type="switch"
                  name="is_available"
                  checked={editForm.is_available}
                  onChange={handleEditFormChange}
                  label={editForm.is_available ? "Available" : "Not Available"}
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
                {editForm.brocure && (
                  <small className="text-muted">Current file: {editForm.brocure}</small>
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
                {editForm.ifu && (
                  <small className="text-muted">Current file: {editForm.ifu}</small>
                )}
              </Col>
              <Col md={4} className="mb-2">
                <Form.Label className="form-label small">Certificates</Form.Label>
                <Form.Control
                  type="file"
                  name="certificates"
                  onChange={(e) => handleEditFileChange(e, 'certificates')}
                  className="form-control form-control-sm"
                />
                {editForm.certificates && (
                  <small className="text-muted">Current file: {editForm.certificates}</small>
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
    </div>
  );
};

export default ProductTable; 