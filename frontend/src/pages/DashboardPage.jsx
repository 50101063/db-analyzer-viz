import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const DashboardPage = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Database Analyzer & Visualization Tool!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Connect to your databases, explore schemas, and create interactive data visualizations with ease.
      </p>
      <div className="space-x-4">
        <Link to="/connections">
          <Button variant="primary">Manage Connections</Button>
        </Link>
        <Link to="/visualize">
          <Button variant="secondary">Start Visualizing</Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
