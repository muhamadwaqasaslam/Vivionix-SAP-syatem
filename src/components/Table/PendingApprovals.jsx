import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Modal, Table, Alert } from 'react-bootstrap';

const PendingApprovals = () => {
  // Mock data for pending DCs
  const initialDCs = [
    {
      id: 1,
      dcDate: '2024-05-14',
      dcNo: 'DC240501',
      orderNo: 'ORD001',
      orderDate: '2024-05-10',
      customerName: 'Customer 1',
    },
    {
      id: 2,
      dcDate: '2024-05-13',
      dcNo: 'DC240502',
      orderNo: 'ORD002',
      orderDate: '2024-05-09',
      customerName: 'Customer 2',
    },
    {
      id: 3,
      dcDate: '2024-05-12',
      dcNo: 'DC240503',
      orderNo: 'ORD003',
      orderDate: '2024-05-08',
      customerName: 'Customer 3',
    },
  ];

  const [pendingDCs, setPendingDCs] = useState(initialDCs);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedDC, setSelectedDC] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered DCs based on search
  const filteredDCs = pendingDCs.filter(dc =>
    dc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dc.dcNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleShowEdit = (dc) => {
    setSelectedDC(dc);
    setEditForm({ ...dc });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDC(null);
    setEditForm({});
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setPendingDCs((prev) =>
      prev.map((dc) => (dc.id === selectedDC.id ? { ...dc, ...editForm } : dc))
    );
    setAlert({ type: 'success', message: 'DC updated successfully!' });
    handleCloseEditModal();
  };
  const handleApprove = (id) => {
    setPendingDCs((prev) => prev.filter((dc) => dc.id !== id));
    setAlert({ type: 'success', message: 'DC approved!' });
  };
  const handleDelete = (id) => {
    setPendingDCs((prev) => prev.filter((dc) => dc.id !== id));
    setAlert({ type: 'danger', message: 'DC deleted.' });
  };
  const handleUpdate = (dc) => {
    handleShowEdit(dc);
  };

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">Pending Delivery Challans for Approval</h3>
      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}
      <div className="table-header mb-2">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search by Customer Name or DC No..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>
      <div className="table-responsive">
        <Table className="table text-nowrap">
          <thead>
            <tr>
              <th>DC Date</th>
              <th>DC No</th>
              <th>Order No</th>
              <th>Order Date</th>
              <th>Customer Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDCs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted">No pending DCs.</td>
              </tr>
            ) : (
              filteredDCs.map((dc) => (
                <tr key={dc.id}>
                  <td>{dc.dcDate}</td>
                  <td>{dc.dcNo}</td>
                  <td>{dc.orderNo}</td>
                  <td>{dc.orderDate}</td>
                  <td>{dc.customerName}</td>
                  <td>
                    <div className="hstack gap-2 fs-15">
                      <Button variant="primary" size="sm" onClick={() => handleShowEdit(dc)} title="Edit">
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(dc.id)} title="Delete">
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                      <Button variant="success" size="sm" onClick={() => handleApprove(dc.id)} title="Approve">
                        <i className="ri-check-line"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      {/* Edit/Update Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit/Update DC</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label>DC Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dcDate"
                  value={editForm.dcDate || ''}
                  onChange={handleEditFormChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>DC No</Form.Label>
                <Form.Control
                  type="text"
                  name="dcNo"
                  value={editForm.dcNo || ''}
                  onChange={handleEditFormChange}
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label>Order No</Form.Label>
                <Form.Control
                  type="text"
                  name="orderNo"
                  value={editForm.orderNo || ''}
                  onChange={handleEditFormChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Order Date</Form.Label>
                <Form.Control
                  type="date"
                  name="orderDate"
                  value={editForm.orderDate || ''}
                  onChange={handleEditFormChange}
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col md={12} className="mb-2">
                <Form.Label>Customer Name</Form.Label>
                <Form.Control
                  type="text"
                  name="customerName"
                  value={editForm.customerName || ''}
                  onChange={handleEditFormChange}
                  required
                />
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

export default PendingApprovals; 