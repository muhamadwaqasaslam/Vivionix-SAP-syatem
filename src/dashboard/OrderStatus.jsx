import React from 'react';
import { Dropdown } from 'react-bootstrap'; // Assuming react-bootstrap for Dropdown
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OrderStatus = () => {
  const statusData = [
    { count: '120,750', status: 'success', colorClass: 'bg-primary' }, // Using class names now
    { count: '56,108', status: 'Pending', colorClass: 'bg-danger' },
    { count: '32,895', status: 'Failed', colorClass: 'bg-warning' }
  ];

  // Sample monthly data for the bar chart, based on the image
  const monthlyData = [
    { name: 'Jan', success: 70, pending: 45, failed: 25 },
    { name: 'Feb', success: 85, pending: 35, failed: 35 },
    { name: 'Mar', success: 55, pending: 100, failed: 40 },
    { name: 'Apr', success: 60, pending: 90, failed: 75 },
    { name: 'May', success: 75, pending: 50, failed: 30 },
    { name: 'Jun', success: 40, pending: 60, failed: 65 },
    { name: 'Jul', success: 75, pending: 40, failed: 45 },
    { name: 'Aug', success: 100, pending: 60, failed: 30 },
    { name: 'Sep', success: 50, pending: 65, failed: 40 },
    { name: 'Oct', success: 75, pending: 55, failed: 70 },
    { name: 'Nov', success: 55, pending: 80, failed: 50 },
    { name: 'Dec', success: 35, pending: 55, failed: 65 },
    { name: 'Jan', success: 30, pending: 55, failed: 70 }, // Sample data for the next January
  ];

  return (
    <div className="col-xl-7 col-lg-12 col-md-12">
      <div className="card">
        <div className="pb-0 card-header">
          <div className="d-flex justify-content-between">
            <h4 className="mb-0 card-title">Order status</h4>
            <div className="dropdown">
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="no-caret btn btn-icon btn-sm btn-light bg-transparent rounded-pill">
                  <i className="mdi mdi-dots-horizontal text-gray"></i>
                </Dropdown.Toggle>
                {/* Add Dropdown.Menu and Dropdown.Items if needed */}
              </Dropdown>
            </div>
          </div>
          <p className="fs-12 text-muted mb-0">Order Status and Tracking. Track your order from ship date to arrival. To begin, enter your order number.</p>
        </div>
        <div className="b-p-apex card-body">
          <div className="total-revenue">
            {statusData.map((item, index) => (
              <div key={index}>
                <h4>{item.count}</h4>
                <label><span className={item.colorClass}></span>{item.status}</label>
              </div>
            ))}
          </div>
          {/* Bar chart visualization */}
          <div className="sales-bar mt-4" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#4A90E2" />
                <Bar dataKey="pending" fill="#F56B6B" />
                <Bar dataKey="failed" fill="#F8A646" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus; 