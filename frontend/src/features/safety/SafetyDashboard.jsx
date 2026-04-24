import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePermitForm from './CreatePermitForm';
import CreateMOCForm from './CreateMOCForm';

const SafetyDashboard = () => {
  const [permits, setPermits] = useState([]);
  const [mocs, setMocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermitForm, setShowPermitForm] = useState(false);
  const [error, setError] = useState(null);
  const [showMocForm, setShowMocForm] = useState(false);
  
  const navigate = useNavigate();


  const fetchPermits = async () => {
    const token = localStorage.getItem('cmms_token');
    console.log("Token being sent:", token);
    
    try {
      const response = await fetch('http://localhost:8000/ptw/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // The Security Bouncer
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPermits(data);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        setError("Failed to load permits.");
      }
    } catch (err) {
      setError("Network error. Is the FastAPI server running?");
    }
  };

  const fetchMocs = async () => {
    const token = localStorage.getItem('cmms_token'); 
    
    try {
      const response = await fetch('http://localhost:8000/moc/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMocs(data);
      } else {
        console.error("Failed to load MOCs");
      }
    } catch (err) {
      console.error("Network error fetching MOCs", err);
    }
  };

  useEffect(() => {
    fetchPermits();
    fetchMocs();
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="dashboard-container p-8">
        <p>Loading safety protocols and permits...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container p-6">
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      <header className="dashboard-header mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold">Safety & Compliance</h1>
          <p className="text-gray-600">Manage hazardous work permits, LOTO, and plant modifications.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary px-4 py-2 bg-gray-200 rounded" 
            onClick={() => {
              setShowMocForm(!showMocForm);
              setShowPermitForm(false);
            }}
          >
            {showMocForm ? 'Cancel MOC' : '+ Initiate MOC'}
          </button>
          
          <button 
            className="btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
            onClick={() => {
              setShowPermitForm(!showPermitForm);
              setShowMocForm(false); // Forces the MOC form to close
            }}
          >
            {showPermitForm ? 'Cancel Permit' : '+ Issue Permit'}
          </button>
        </div>
      </header>

      
      {/* --- Dynamic Form Area --- */}
      {(showPermitForm || showMocForm) && (
        <div className="shadow-sm" style={{ 
          padding: '2rem',         /* <-- Increased padding here! */
          marginBottom: '2rem',    /* <-- Added margin below the form */
          borderRadius: '8px',     /* <-- Softened the corners */
          backgroundColor: showPermitForm ? '#f0f8ff' : '#fdf8ff',
          border: `2px solid ${showPermitForm ? '#cce5ff' : '#e6ccff'}` 
        }}>
          
          {showPermitForm && (
            <CreatePermitForm 
              onSuccess={() => {
                setShowPermitForm(false);
                fetchPermits(); 
              }} 
            />
          )}

          {showMocForm && (
            <CreateMOCForm 
              onSuccess={() => {
                setShowMocForm(false);
                fetchMocs(); 
              }} 
            />
          )}

        </div>
      )}

      {/* --- Safety KPIs --- */}
      <section className="kpi-grid grid grid-cols-3 gap-4 mb-8">
        <div className="kpi-card safety p-4 bg-green-100 rounded">
          <h3 className="font-semibold">Active PTWs</h3>
          <span className="text-2xl font-bold block">{permits.filter(p => p.status === 'Active').length}</span>
          <p className="text-sm text-gray-600">Permits live on the floor</p>
        </div>
        <div className="kpi-card warning p-4 bg-red-100 rounded">
          <h3 className="font-semibold">Active LOTO</h3>
          {/* Counting permits where requires_loto is true */}
          <span className="text-2xl font-bold block">{permits.filter(p => p.requires_loto).length}</span>
          <p className="text-sm text-gray-600">Equipment isolation required</p>
        </div>
        <div className="kpi-card compliance p-4 bg-yellow-100 rounded">
          <h3 className="font-semibold">Pending MOCs</h3>
          <span className="text-2xl font-bold block">{mocs.length}</span>
          <p className="text-sm text-gray-600">Awaiting cross-functional review</p>
        </div>
      </section>

      {/* --- Permit to Work (PTW) Table --- */}
      <section className="action-panel mb-8">
        <h2 className="text-xl font-bold mb-4">Permit to Work (PTW) Control</h2>
        <table className="data-table w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2">
              <th className="p-2">PTW ID</th>
              <th className="p-2">Work Order</th>
              <th className="p-2">Type</th>
              <th className="p-2">Requester ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">LOTO Req.</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {permits.length === 0 ? (
              <tr><td colSpan="7" className="p-4 text-center text-gray-500">No permits found.</td></tr>
            ) : (
              permits.map((permit) => (
                <tr key={permit.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}><strong>PTW-{permit.id}</strong></td>
                  <td style={{ padding: '0.75rem' }}>WO-{permit.work_order_id}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.875rem',
                      backgroundColor: permit.permit_type === 'Hot Work' ? '#f8d7da' : '#e2e3e5',
                      color: permit.permit_type === 'Hot Work' ? '#721c24' : '#383d41'
                    }}>
                      {permit.permit_type}
                    </span>
                  </td>
                  
                  <td style={{ padding: '0.75rem' }}>{permit.requested_by?.full_name}</td>
                  
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.875rem',
                      backgroundColor: permit.status === 'Active' ? '#d4edda' : '#fff3cd',
                      color: permit.status === 'Active' ? '#155724' : '#856404'
                    }}>
                      {permit.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{permit.requires_loto ? '🔴 Yes' : '⚪ No'}</td>
                  
                  {/* UPDATE: The Modernized Review Button */}
                  <td style={{ padding: '0.75rem' }}>
                    <button
                    onClick={() => navigate(`/permit/${permit.id}`)} 
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#e2e8f0'; e.target.style.borderColor = '#94a3b8'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = '#f1f5f9'; e.target.style.borderColor = '#cbd5e1'; }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* --- Management of Change (MOC) Table --- */}
      <section className="action-panel">
        <h2 className="text-xl font-bold mb-4">Management of Change (MOC)</h2>
        <table className="data-table w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2">
              <th className="p-2">MOC ID</th>
              <th className="p-2">Title</th>
              <th className="p-2">Review Stage</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Date Initiated</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {mocs.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No active MOCs found.</td></tr>
            ) : (
              mocs.map((moc) => (
                <tr key={moc.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}><strong>MOC-{moc.id}</strong></td>
                  <td style={{ padding: '0.75rem' }}>{moc.title}</td>
                  
                  {/* Stage Badge */}
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.875rem',
                      backgroundColor: '#e2e8f0', // Clean gray for the stage
                      color: '#334155'
                    }}>
                      {moc.stage}
                    </span>
                  </td>
                  
                  {/* Priority Badge - Color Coded */}
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.875rem',
                      backgroundColor: moc.priority === 'Emergency' ? '#f8d7da' : 
                                       moc.priority === 'High' ? '#fff3cd' : 
                                       moc.priority === 'Medium' ? '#d1ecf1' : '#e2e3e5',
                      color: moc.priority === 'Emergency' ? '#721c24' : 
                             moc.priority === 'High' ? '#856404' : 
                             moc.priority === 'Medium' ? '#0c5460' : '#383d41'
                    }}>
                      {moc.priority}
                    </span>
                  </td>
                  
                  <td style={{ padding: '0.75rem' }}>{new Date(moc.created_at).toLocaleDateString()}</td>
                  
                  {/* The Modernized Audit Trail Button */}
                  <td style={{ padding: '0.75rem' }}>
                    <button 
                    onClick={() => navigate(`/moc/${moc.id}`)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#e2e8f0'; e.target.style.borderColor = '#94a3b8'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = '#f1f5f9'; e.target.style.borderColor = '#cbd5e1'; }}
                    >
                      Audit Trail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SafetyDashboard;