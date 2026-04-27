import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const MainLayout = () => {

  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app-layout">
      {/* --- Sidebar Navigation --- */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-brand">CMMS Pro</div>

        {/* --- Current User Display --- */}
        {/* We only render this box if a user is successfully logged in */}
        {user && (
          <div style={{ 
            padding: '1rem', 
            margin: '0 1rem 1rem 1rem', 
            backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle dark background
            borderRadius: '6px' 
          }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>
              {user.full_name}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>
              {user.role}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7, marginTop: '2px', fontStyle: 'italic' }}>
              {user.department}
            </p>
          </div>
        )}

        <nav className="sidebar-nav">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/assets" className="nav-link">Assets</Link>
          <Link to="/maintenance" className="nav-link">Maintenance</Link>
          <Link to="/safety" className="nav-link">Safety & PTW</Link>
        </nav>

        {/* --- Logout Button --- */}
        <button 
          onClick={logout}
          style={{
            marginTop: 'auto',
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
            fontWeight: '600'
          }}
        >
          &larr; Sign Out
        </button>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="main-content">
        {/* The <Outlet /> is where the matched child routes will render */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;