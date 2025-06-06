import React, { useState, useEffect, useRef } from 'react';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';
import { Button } from 'react-bootstrap';
import api from '../../utils/api';

const InvoiceTable = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showSearch, setShowSearch] = useState(false);
    const [invoiceIdSearch, setInvoiceIdSearch] = useState("");
    const [filterFields, setFilterFields] = useState({ number: "", order: "", status: "" });
    const filterFormRef = useRef(null);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchInvoices();
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

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/invoice/list/');
            if (response.data) {
                setInvoices(response.data.results || response.data);
                setFilteredInvoices(response.data.results || response.data);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterIconClick = () => {
        setShowSearch((prev) => !prev);
        if (!showSearch) {
            setFilterFields({ number: "", order: "", status: "" });
            setFilteredInvoices(invoices);
        }
    };

    const handleFilterFieldChange = (e) => {
        const { name, value } = e.target;
        setFilterFields((prev) => ({ ...prev, [name]: value }));
        
        const newFilters = { ...filterFields, [name]: value };
        const matched = invoices.filter((invoice) =>
            (!newFilters.number || (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(newFilters.number.toLowerCase()))) &&
            (!newFilters.order || (invoice.order && invoice.order.toString().includes(newFilters.order))) &&
            (!newFilters.status || (invoice.status && invoice.status.toLowerCase().includes(newFilters.status.toLowerCase())))
        );
        setFilteredInvoices(matched);
    };

    const handleApplySearch = () => {
        const { number, order, status } = filterFields;
        if (!number && !order && !status) {
            setFilteredInvoices(invoices);
        } else {
            const matched = invoices.filter((invoice) =>
                (!number || (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(number.toLowerCase()))) &&
                (!order || (invoice.order && invoice.order.toString().includes(order))) &&
                (!status || (invoice.status && invoice.status.toLowerCase().includes(status.toLowerCase())))
            );
            setFilteredInvoices(matched);
        }
        setShowSearch(false);
    };

    const handleInvoiceIdSearch = (e) => {
        const value = e.target.value;
        setInvoiceIdSearch(value);
        if (value.trim() === "") {
            setFilteredInvoices(invoices);
        } else {
            const matched = invoices.filter((invoice) =>
                invoice.invoice_number && invoice.invoice_number.toString().toLowerCase().includes(value.trim().toLowerCase())
            );
            setFilteredInvoices(matched);
        }
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/invoice/list/');
            if (response.data) {
                setInvoices(response.data.results || response.data);
                setInvoiceIdSearch("");
                setFilterFields({ number: "", order: "", status: "" });
                setFilteredInvoices(response.data.results || response.data);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to refresh invoices');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const currentInvoices = (invoiceIdSearch || showSearch || filteredInvoices.length > 0) ? filteredInvoices : invoices;

    if (loading) {
        return null;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="employee-table-container">
            <h3 className="table-heading">Invoice Management</h3>

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
                        placeholder="Search by Invoice Number..."
                        value={invoiceIdSearch}
                        onChange={handleInvoiceIdSearch}
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
                                name="number"
                                className="form-control search-input"
                                placeholder="Invoice Number"
                                value={filterFields.number}
                                onChange={handleFilterFieldChange}
                            />
                            <input
                                type="text"
                                name="order"
                                className="form-control search-input"
                                placeholder="Order"
                                value={filterFields.order}
                                onChange={handleFilterFieldChange}
                            />
                            <input
                                type="text"
                                name="status"
                                className="form-control search-input"
                                placeholder="Status"
                                value={filterFields.status}
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
                            <th scope="col">Invoice Number</th>
                            <th scope="col">Order</th>
                            <th scope="col">Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No invoices found</td>
                            </tr>
                        ) : (
                            currentInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>{invoice.invoice_number}</td>
                                    <td>Order #{invoice.order}</td>
                                    <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge status-${invoice.status.toLowerCase()}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td>₹{invoice.total_amount}</td>
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
        </div>
    );
};

// Update the styles
const styles = `
    .employee-table-container {
        padding: 20px;
    }

    .table-heading {
        margin-bottom: 20px;
        color: #333;
    }

    .table-header {
        margin-bottom: 20px;
    }

    .search-container {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .search-input {
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 6px 12px;
    }

    .filter-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 1000;
        background-color: #fff;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 1rem;
        margin-top: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-dropdown input {
        margin-bottom: 10px;
    }

    .table-responsive {
        margin-bottom: 1rem;
    }

    .table {
        width: 100%;
        margin-bottom: 1rem;
        background-color: transparent;
        border-collapse: collapse;
    }

    .table th {
        background-color: #f8f9fa;
        border-bottom: 2px solid #dee2e6;
        padding: 12px;
        font-weight: 600;
    }

    .table td {
        padding: 12px;
        vertical-align: middle;
        border-top: 1px solid #dee2e6;
    }

    .status-badge {
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.85em;
        font-weight: 500;
    }

    .status-pending {
        background-color: #fff3cd;
        color: #856404;
    }

    .status-completed {
        background-color: #d4edda;
        color: #155724;
    }

    .status-cancelled {
        background-color: #f8d7da;
        color: #721c24;
    }

    .pagination-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        padding: 10px;
    }

    .pagination {
        display: flex;
        padding-left: 0;
        list-style: none;
        border-radius: 0.25rem;
    }

    .page-item {
        margin: 0 2px;
    }

    .page-link {
        position: relative;
        display: block;
        padding: 0.5rem 0.75rem;
        margin-left: -1px;
        line-height: 1.25;
        color: #007bff;
        background-color: #fff;
        border: 1px solid #dee2e6;
        border-radius: 4px;
    }

    .page-item.active .page-link {
        z-index: 3;
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .page-item.disabled .page-link {
        color: #6c757d;
        pointer-events: none;
        cursor: auto;
        background-color: #fff;
        border-color: #dee2e6;
    }

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

    @media (max-width: 768px) {
        .employee-table-container {
            padding: 10px;
        }

        .table-responsive {
            margin-bottom: 0.5rem;
        }

        .search-container {
            flex-wrap: wrap;
        }

        .search-input {
            width: 100%;
            margin-bottom: 10px;
        }

        .filter-dropdown {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 400px;
        }
    }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default InvoiceTable;