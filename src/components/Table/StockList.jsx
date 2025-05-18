import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Badge, InputGroup, Row, Col } from 'react-bootstrap';
import { FaHistory, FaExclamationTriangle } from 'react-icons/fa';

const StockList = () => {
  // Mock data for demonstration
  const mockProducts = [
    {
      id: 1,
      productCode: 'P001',
      productName: 'Product A',
      brandName: 'Brand X',
      packSize: '10kg',
      lotNo: 'LOT001',
      expiry: '2024-12-31',
      quantity: 100,
      minStockThreshold: 20,
      expiryThreshold: 90, // days
      history: [
        { date: '2024-03-01', type: 'Stock In', quantity: 50, reference: 'SI001' },
        { date: '2024-03-15', type: 'Stock Out', quantity: -20, reference: 'SO001' }
      ]
    },
    {
      id: 2,
      productCode: 'P002',
      productName: 'Product B',
      brandName: 'Brand Y',
      packSize: '5kg',
      lotNo: 'LOT002',
      expiry: '2024-06-30',
      quantity: 15,
      minStockThreshold: 25,
      expiryThreshold: 90,
      history: [
        { date: '2024-03-05', type: 'Stock In', quantity: 30, reference: 'SI002' },
        { date: '2024-03-20', type: 'Stock Out', quantity: -15, reference: 'SO002' }
      ]
    },
    {
      id: 3,
      productCode: 'P003',
      productName: 'Product C',
      brandName: 'Brand Z',
      packSize: '2kg',
      lotNo: 'LOT003',
      expiry: '2026-08-15',
      quantity: 45,
      minStockThreshold: 30,
      expiryThreshold: 90,
      history: [
        { date: '2024-03-10', type: 'Stock In', quantity: 60, reference: 'SI003' },
        { date: '2024-03-25', type: 'Stock Out', quantity: -15, reference: 'SO003' }
      ]
    },
    {
      id: 4,
      productCode: 'P004',
      productName: 'Product D',
      brandName: 'Brand W',
      packSize: '1kg',
      lotNo: 'LOT004',
      expiry: '2027-05-30',
      quantity: 8,
      minStockThreshold: 15,
      expiryThreshold: 90,
      history: [
        { date: '2024-03-12', type: 'Stock In', quantity: 20, reference: 'SI004' },
        { date: '2024-03-28', type: 'Stock Out', quantity: -12, reference: 'SO004' }
      ]
    },
    {
      id: 5,
      productCode: 'P005',
      productName: 'Product E',
      brandName: 'Brand V',
      packSize: '500g',
      lotNo: 'LOT005',
      expiry: '2024-07-20',
      quantity: 35,
      minStockThreshold: 20,
      expiryThreshold: 90,
      history: [
        { date: '2024-03-15', type: 'Stock In', quantity: 40, reference: 'SI005' },
        { date: '2024-03-30', type: 'Stock Out', quantity: -5, reference: 'SO005' }
      ]
    },
    {
      id: 6,
      productCode: 'P006',
      productName: 'Product F',
      brandName: 'Brand U',
      packSize: '250g',
      lotNo: 'LOT006',
      expiry: '2024-09-10',
      quantity: 12,
      minStockThreshold: 25,
      expiryThreshold: 90,
      history: [
        { date: '2024-03-18', type: 'Stock In', quantity: 30, reference: 'SI006' },
        { date: '2024-04-01', type: 'Stock Out', quantity: -18, reference: 'SO006' }
      ]
    },
    {
      id: 7,
      productCode: 'P007',
      productName: 'Product G',
      brandName: 'Brand T',
      packSize: '100g',
      lotNo: 'LOT007',
      expiry: '2024-10-15',
      quantity: 50,
      minStockThreshold: 15,
      expiryThreshold: 90,
      history: [
        { date: '2024-03-20', type: 'Stock In', quantity: 55, reference: 'SI007' },
        { date: '2024-04-05', type: 'Stock Out', quantity: -5, reference: 'SO007' }
      ]
    }
  ];

  const [products, setProducts] = useState(mockProducts);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpiry, setFilterExpiry] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Check if product needs attention
  const needsAttention = (product) => {
    const daysUntilExpiry = getDaysUntilExpiry(product.expiry);
    return product.quantity <= product.minStockThreshold || daysUntilExpiry <= product.expiryThreshold;
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.lotNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesExpiry = !filterExpiry || getDaysUntilExpiry(product.expiry) <= product.expiryThreshold;
    const matchesLowStock = !filterLowStock || product.quantity <= product.minStockThreshold;

    return matchesSearch && matchesExpiry && matchesLowStock;
  });

  // Handlers
  const handleShowHistory = (product) => {
    setSelectedProduct(product);
    setShowHistoryModal(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="stock-list-container">
      <h3 className="table-heading">Stock List</h3>
      
      {/* Filters and Search */}
      <div className="filters-section mb-3">
        <Row>
          <Col md={8}>
            <div className="d-flex gap-2">
              <Form.Check
                type="switch"
                id="expiry-filter"
                label="Show Expiring Soon"
                checked={filterExpiry}
                onChange={(e) => setFilterExpiry(e.target.checked)}
              />
              <Form.Check
                type="switch"
                id="low-stock-filter"
                label="Show Low Stock"
                checked={filterLowStock}
                onChange={(e) => setFilterLowStock(e.target.checked)}
              />
            </div>
          </Col>
          <Col md={4} className="d-flex justify-content-end">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search by Product Name or Code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: 320 }}
            />
          </Col>
        </Row>
      </div>

      {/* Stock List Table */}
      <div className="table-responsive">
        <Table className="table text-nowrap">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Brand Name</th>
              <th>Pack Size</th>
              <th>Lot No</th>
              <th>Expiry</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const daysUntilExpiry = getDaysUntilExpiry(product.expiry);
              const isLowStock = product.quantity <= product.minStockThreshold;
              const isExpiringSoon = daysUntilExpiry <= product.expiryThreshold;

              return (
                <tr key={product.id} className={needsAttention(product) ? 'table-warning' : ''}>
                  <td>{product.productCode}</td>
                  <td>{product.productName}</td>
                  <td>{product.brandName}</td>
                  <td>{product.packSize}</td>
                  <td>{product.lotNo}</td>
                  <td>
                    {product.expiry}
                    {isExpiringSoon && (
                      <Badge bg="danger" className="ms-2">
                        {daysUntilExpiry} days left
                      </Badge>
                    )}
                  </td>
                  <td>
                    {product.quantity}
                    {isLowStock && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        Low Stock
                      </Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleShowHistory(product)}
                    >
                      <FaHistory /> History
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* History Modal */}
      <Modal show={showHistoryModal} onHide={handleCloseHistory} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Stock History - {selectedProduct?.productName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <div className="mb-3">
                <strong>Product Details:</strong>
                <p>Code: {selectedProduct.productCode} | Brand: {selectedProduct.brandName} | Pack Size: {selectedProduct.packSize}</p>
              </div>
              <Table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProduct.history.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.date}</td>
                      <td>{entry.type}</td>
                      <td className={entry.quantity > 0 ? 'text-success' : 'text-danger'}>
                        {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                      </td>
                      <td>{entry.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StockList; 