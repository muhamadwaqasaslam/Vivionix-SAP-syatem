import React, { useState } from 'react';
import { Table, Form, Row, Col, InputGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const StockLedger = () => {
  // Mock data for demonstration
  const mockTransactions = [
    {
      id: 1,
      date: '2025-03-01',
      dcNo: 'DC240501',
      dcDate: '2024-03-01',
      invNo: 'INV001',
      invDate: '2024-03-02',
      customerName: 'Customer 1',
      productName: 'Product A',
      lotNo: 'LOT001',
      expiry: '2024-12-31',
      qtyIn: 50,
      qtyOut: 0,
      comments: ' stock in'
    },
    {
      id: 2,
      date: '2024-03-15',
      dcNo: 'DC240502',
      dcDate: '2024-03-15',
      invNo: 'INV002',
      invDate: '2024-03-16',
      customerName: 'Customer 2',
      productName: 'Product A',
      lotNo: 'LOT001',
      expiry: '2024-12-31',
      qtyIn: 0,
      qtyOut: 20,
      comments: 'Regular delivery'
    },
    {
      id: 3,
      date: '2023-03-20',
      dcNo: 'DC240503',
      dcDate: '2024-03-20',
      invNo: '',
      invDate: '',
      customerName: 'Customer 3',
      productName: 'Product B',
      lotNo: 'LOT002',
      expiry: '2024-06-30',
      qtyIn: 30,
      qtyOut: 0,
      comments: 'Stock replenishment'
    },
    {
      id: 4,
      date: '2026-03-25',
      dcNo: 'DC240504',
      dcDate: '2024-03-25',
      invNo: 'INV003',
      invDate: '2024-03-26',
      customerName: 'Customer 1',
      productName: 'Product B',
      lotNo: 'LOT002',
      expiry: '2024-06-30',
      qtyIn: 0,
      qtyOut: 15,
      comments: 'Urgent delivery'
    }
  ];

  const [transactions, setTransactions] = useState(mockTransactions);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter transactions based on date range and search
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const isInDateRange = (!startDate || transactionDate >= startDate) && 
                         (!endDate || transactionDate <= endDate);
    
    const matchesSearch = 
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.productName.toLowerCase().includes(searchTerm.toLowerCase());

    return isInDateRange && matchesSearch;
  });

  return (
    <div className="stock-ledger-container">
      <h3 className="table-heading">Stock Ledger</h3>

      {/* Date Filters and Search */}
      <div className="filters-section mb-3">
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group>
            <Form.Label className="fw-bold">Start Date: </Form.Label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                className="form-control form-control-sm"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
                isClearable
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
            <Form.Label className="fw-bold">End Date: </Form.Label>
            <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                className="form-control form-control-sm"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
                minDate={startDate}
                isClearable
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex justify-content-end">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search by Customer Name or Product Name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: 320 }}
            />
          </Col>
        </Row>
      </div>

      {/* Transactions Table display*/}
      <div className="table-responsive">
        <Table className="table text-nowrap">
          <thead>
            <tr>
              <th>Date</th>
              <th>DC No</th>
              <th>DC Date</th>
              <th>Invoice No</th>
              <th>Invoice Date</th>
              <th>Customer Name</th>
              <th>Product Name</th>
              <th>Lot No</th>
              <th>Expiry</th>
              <th>Qty In</th>
              <th>Qty Out</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center text-muted">No transactions found for the selected period.</td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.dcNo}</td>
                  <td>{transaction.dcDate}</td>
                  <td>{transaction.invNo || '-'}</td>
                  <td>{transaction.invDate || '-'}</td>
                  <td>{transaction.customerName}</td>
                  <td>{transaction.productName}</td>
                  <td>{transaction.lotNo}</td>
                  <td>{transaction.expiry}</td>
                  <td className={transaction.qtyIn > 0 ? 'text-success' : ''}>
                    {transaction.qtyIn > 0 ? transaction.qtyIn : '-'}
                  </td>
                  <td className={transaction.qtyOut > 0 ? 'text-danger' : ''}>
                    {transaction.qtyOut > 0 ? transaction.qtyOut : '-'}
                  </td>
                  <td>{transaction.comments}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default StockLedger; 