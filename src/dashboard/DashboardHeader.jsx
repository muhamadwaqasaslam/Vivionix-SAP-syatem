import React from 'react';

const DashboardHeader = () => {
  const customerRatings = { stars: 5, count: '14,873' };
  const onlineSales = '563,275';
  const offlineSales = '783,675';

  return (
    <div className="dashboard-header">
      <div className="greeting">
        <h1>Hi, welcome back!</h1>
        <p>Sales monitoring dashboard template.</p>
      </div>
      <div className="sales-summary">
        <div className="summary-item">
          <p>Customer Ratings</p>
          <p>
            <span className="customer-ratings-stars">{'★'.repeat(customerRatings.stars)}</span> ({customerRatings.count})
          </p>
        </div>
        <div className="summary-item">
          <p>Online Sales</p>
          <h3>{onlineSales}</h3>
        </div>
        <div className="summary-item">
          <p>Offline Sales</p>
          <h3>{offlineSales}</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader; 