import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../features/analytics/Dashboard';
import WorkOrderList from '../features/maintenance/WorkOrderList';
import WorkOrderForm from '../features/maintenance/WorkOrderForm';
import AssetHierarchy from '../features/assets/AssetHierarchy';
import SafetyDashboard from '../features/safety/SafetyDashboard';
import WorkOrderDetail from '../features/maintenance/WorkOrderDetail';

const AppRouter = () => {
  return (
    <Routes>
      {/* The parent Route uses the MainLayout. 
        Any child routes inside it will be rendered inside the MainLayout's <Outlet />.
      */}
      <Route path="/" element={<MainLayout />}>
        
        {/* The 'index' route loads automatically when visiting the parent path ('/') */}
        <Route index element={<Dashboard />} />

        {/* Maintenance Routes */}
        <Route path="maintenance">
          <Route index element={<WorkOrderList />} />
          <Route path="new" element={<WorkOrderForm />} />
          <Route path=":id" element={<WorkOrderDetail />} />
        </Route>
        
        {/* Placeholders for future routes */}
        <Route path="assets" element={<AssetHierarchy />} />

        <Route path="safety" element={<SafetyDashboard />} />
        
        
        {/* A catch-all for 404 Not Found pages */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default AppRouter;