import React from 'react';
import DashboardHeader from './DashboardHeader';
import MetricCards from './MetricCards';
import OrderStatus from './OrderStatus';
import SalesMap from './SalesMap';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <MetricCards />
      <div className="dashboard-bottom-row">
        <OrderStatus />
        <SalesMap />
      </div>
    </div>
  );
};

export default Dashboard; 