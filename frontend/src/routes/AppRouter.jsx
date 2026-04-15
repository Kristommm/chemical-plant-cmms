import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from '../context/AuthContext';

// Import your components
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../features/analytics/Dashboard';
import WorkOrderList from '../features/maintenance/WorkOrderList';
import WorkOrderForm from '../features/maintenance/WorkOrderForm';
import WorkOrderDetail from '../features/maintenance/WorkOrderDetail';
import AssetHierarchy from '../features/assets/AssetHierarchy';
import SafetyDashboard from '../features/safety/SafetyDashboard';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useContext(AuthContext);
  
  if (isLoading) return <div style={{ padding: '2rem' }}>Loading session...</div>;
  if (!token) return <Navigate to="/login" replace />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Wrap the MainLayout in the ProtectedRoute */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="maintenance">
          <Route index element={<WorkOrderList />} />
          <Route path="new" element={<WorkOrderForm />} />
          <Route path=":id" element={<WorkOrderDetail />} />
        </Route>
        <Route path="assets" element={<AssetHierarchy />} />
        <Route path="safety" element={<SafetyDashboard />} />
      </Route>
    </Routes>
  );
};

// Wrap the router with the AuthProvider so the context is available globally
const AppRouter = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default AppRouter;