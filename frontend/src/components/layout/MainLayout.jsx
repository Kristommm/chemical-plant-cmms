import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="app-layout">
      {/* --- Sidebar Navigation --- */}
      <aside className="sidebar">
        <div className="sidebar-brand">CMMS Pro</div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/assets" className="nav-link">Assets</Link>
          <Link to="/maintenance" className="nav-link">Maintenance</Link>
          <Link to="/safety" className="nav-link">Safety & PTW</Link>
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="main-content">
        {/* The <Outlet /> is where the matched child routes (like your Dashboard) will render */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;