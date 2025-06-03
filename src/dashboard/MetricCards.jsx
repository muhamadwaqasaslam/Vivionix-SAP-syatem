import React from 'react';
import RecentCustomers from './RecentCustomers';

const MetricCards = () => {
  const metrics = [
    {
      title: 'TODAY ORDERS',
      value: '$5,74.12',
      comparison: 'Compared to last week',
      change: '+427',
      color: '#4A90E2'
    },
    {
      title: 'TODAY EARNINGS',
      value: '$1,230.17',
      comparison: 'Compared to last week',
      change: '-23.09%',
      color: '#F56B6B'
    },
    {
      title: 'TOTAL EARNINGS',
      value: '$7,125.70',
      comparison: 'Compared to last week',
      change: '+52.09%',
      color: '#50E3C2'
    },
    {
      title: 'PRODUCT SOLD',
      value: '$4,820.50',
      comparison: 'Compared to last week',
      change: '-152.3',
      color: '#F8A646'
    }
  ];

  return (
    <div className="row">
      <div className="col-xl-6 col-lg-12 col-md-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Order Status</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {metrics.map((metric, index) => (
                <div key={index} className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                  <div className="metric-card" style={{ backgroundColor: metric.color }}>
                    <div className="px-3 pt-3 pb-2 pt-0">
                      <div className="">
                        <h6 className="mb-3 fs-12 text-fixed-white">{metric.title}</h6>
                      </div>
                      <div className="pb-0 mt-0">
                        <div className="d-flex">
                          <div className="">
                            <h4 className="fs-20 fw-bold mb-1 text-fixed-white">{metric.value}</h4>
                            <p className="mb-0 fs-12 text-fixed-white op-7">{metric.comparison}</p>
                          </div>
                          <span className="float-end my-auto ms-auto">
                            {/* Using ri-icons assuming Remix Icon is available, adjust if needed */}
                            {metric.change.startsWith('+') ? (
                              <i className="ri-arrow-up-circle-line text-fixed-white"></i>
                            ) : (
                              <i className="ri-arrow-down-circle-line text-fixed-white"></i>
                            )}
                            <span className="text-fixed-white op-7"> {metric.change}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-6 col-lg-12 col-md-12">
        <RecentCustomers />
      </div>
    </div>
  );
};

export default MetricCards; 