import React, { useState } from 'react';
import { Table, Button, Modal, Form, Alert} from 'react-bootstrap';
import './EmployeeTable.css';

const ListOfDC = () => {
  // Mock data for DCs
  const initialDCs = [
    {
      id: 1,
      dcDate: '2024-05-14',
      dcNo: 'DC240501',
      customerOrderDate: '2024-05-10',
      customerOrderNo: 'ORD001',
      customerName: 'Customer 1',
      scheduledDeliveryDate: '2024-05-16',
      status: 'created',
      receiving: null,
    },
    {
      id: 2,
      dcDate: '2024-05-13',
      dcNo: 'DC240502',
      customerOrderDate: '2024-05-09',
      customerOrderNo: 'ORD002',
      customerName: 'Customer 2',
      scheduledDeliveryDate: '2024-05-15',
      status: 'completed',
      receiving: 'receiving2.pdf',
    },
    {
      id: 3,
      dcDate: '2024-05-12',
      dcNo: 'DC240503',
      customerOrderDate: '2024-05-08',
      customerOrderNo: 'ORD003',
      customerName: 'Customer 3',
      scheduledDeliveryDate: '2024-05-14',
      status: 'created',
      receiving: null,
    },
    // Added mock data for 'partially delivered' status
    {
      id: 4,
      dcDate: '2024-05-11',
      dcNo: 'DC240504',
      customerOrderDate: '2024-05-07',
      customerOrderNo: 'ORD004',
      customerName: 'Customer 4',
      scheduledDeliveryDate: '2024-05-13',
      status: 'partially delivered',
      receiving: null,
    },
    {
      id: 5,
      dcDate: '2024-05-10',
      dcNo: 'DC240505',
      customerOrderDate: '2024-05-06',
      customerOrderNo: 'ORD005',
      customerName: 'Customer 5',
      scheduledDeliveryDate: '2024-05-12',
      status: 'completed',
      receiving: 'receiving5.pdf',
    },
  ];

  const [dcs, setDCs] = useState(initialDCs);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDC, setSelectedDC] = useState(null);
  const [receivingFile, setReceivingFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All'); // State for status filter

  // Filtered DCs based on search and status filter
  const filteredDCs = dcs.filter(dc => {
    const matchesSearch = dc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dc.dcNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || dc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleShowUpload = (dc) => {
    setSelectedDC(dc);
    setShowUploadModal(true);
    setIsReplacing(false);
  };

  const handleShowReplace = (dc) => {
    setSelectedDC(dc);
    setShowUploadModal(true);
    setIsReplacing(true);
  };

  const handleCloseUpload = () => {
    setShowUploadModal(false);
    setSelectedDC(null);
    setReceivingFile(null);
    setIsReplacing(false);
  };

  const handleShowView = (dc) => {
    setSelectedDC(dc);
    setShowViewModal(true);
  };
  const handleCloseView = () => {
    setShowViewModal(false);
    setSelectedDC(null);
  };
  const handleReceivingFileChange = (e) => {
    setReceivingFile(e.target.files[0]);
  };
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!receivingFile) return;
    setDCs((prev) =>
      prev.map((dc) =>
        dc.id === selectedDC.id
          ? { ...dc, status: 'completed', receiving: receivingFile.name }
          : dc
      )
    );
    setAlert({ 
      type: 'success', 
      message: isReplacing ? 'Receiving document replaced successfully.' : 'Receiving uploaded and status set to completed.' 
    });
    handleCloseUpload();
  };

  return (
    <div className="employee-table-container">
      <h3 className="table-heading">List of Delivery Challans</h3>
      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}
      <div className="table-header mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div className="d-flex align-items-center">
            <span className="me-2">Filter by Status:</span>
            <Button
              variant={statusFilter === 'All' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setStatusFilter('All')}
              className="me-2"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'created' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setStatusFilter('created')}
              className="me-2"
            >
              Created
            </Button>
            <Button
              variant={statusFilter === 'partially delivered' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setStatusFilter('partially delivered')}
              className="me-2"
            >
              Partially Delivered
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
         </div>
        <div style={{ maxWidth: 320 }}>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by Customer Name or DC No..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <Table className="table text-nowrap">
          <thead>
            <tr>
              <th>DC Date</th>
              <th>DC No</th>
              <th>Customer Order Date</th>
              <th>Customer Order No</th>
              <th>Customer Name</th>
              <th>Scheduled Delivery Date</th>
              <th>Delivery Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDCs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted">No DCs found.</td>
              </tr>
            ) : (
              filteredDCs.map((dc) => (
                <tr key={dc.id}>
                  <td>{dc.dcDate}</td>
                  <td>{dc.dcNo}</td>
                  <td>{dc.customerOrderDate}</td>
                  <td>{dc.customerOrderNo}</td>
                  <td>{dc.customerName}</td>
                  <td>{dc.scheduledDeliveryDate}</td>
                  <td>
                    <span className={`badge ${dc.status === 'completed' ? 'bg-success' : dc.status === 'partially delivered' ? 'bg-warning text-dark' : 'bg-secondary text-light'}`}>{dc.status.charAt(0).toUpperCase() + dc.status.slice(1)}</span>
                  </td>
                  <td>
                    {dc.status === 'created' || dc.status === 'partially delivered' ? (
                      <Button variant="info" size="sm" onClick={() => handleShowUpload(dc)}>
                        Upload Receiving
                      </Button>
                    ) : (
                      <Button variant="success" size="sm" onClick={() => handleShowView(dc)}>
                        View Receiving
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      {/* Upload Receiving Modal */}
      <Modal show={showUploadModal} onHide={handleCloseUpload} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isReplacing ? 'Replace Receiving' : 'Upload Receiving'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUploadSubmit}>
            <Form.Group controlId="receivingFile">
              <Form.Label>{isReplacing ? 'Select New Receiving File' : 'Select Receiving File'}</Form.Label>
              <Form.Control type="file" onChange={handleReceivingFileChange} required />
            </Form.Group>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseUpload} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={!receivingFile}>
                {isReplacing ? 'Replace' : 'Upload'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* View Receiving Modal */}
      <Modal show={showViewModal} onHide={handleCloseView} centered>
        <Modal.Header closeButton>
          <Modal.Title>View Receiving</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDC && selectedDC.receiving ? (
            <div>
              <p><strong>Receiving File:</strong> {selectedDC.receiving}</p>
              <div className="d-flex gap-2">
                <Button variant="primary" href={`#`} target="_blank">
                  Download/View
                </Button>
                <Button variant="warning" onClick={() => {
                  handleCloseView();
                  handleShowReplace(selectedDC);
                }}>
                  Replace Document
                </Button>
              </div>
            </div>
          ) : (
            <p>No receiving file available.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListOfDC; 