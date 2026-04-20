import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePermitForm from './CreatePermitForm';

const SafetyDashboard = () => {
  const [permits, setPermits] = useState([]);
  const [mocs, setMocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermitForm, setShowPermitForm] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Function to fetch permits from FastAPI
  const fetchPermits = async () => {
    const token = localStorage.getItem('cmms_token'); // Get the saved JWT
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

  useEffect(() => {
    // 1. Fetch real permits from the backend
    fetchPermits();

    // 2. Keep the dummy MOC data until we build the MOC backend!
    setMocs([
      { id: 'MOC-204', title: 'Temporary Piping Bypass on Chiller', stage: 'Engineering Review', priority: 'High', date: '2026-04-12' },
      { id: 'MOC-205', title: 'Upgrade Agitator Motor to 480V', stage: 'Draft', priority: 'Medium', date: '2026-04-14' },
    ]);
    
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
          <button className="btn-secondary px-4 py-2 bg-gray-200 rounded" onClick={() => console.log('Initiate MOC')}>
            + Initiate MOC
          </button>
          
          {/* Toggles our Create Permit Form */}
          <button 
            className="btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
            onClick={() => setShowPermitForm(!showPermitForm)}
          >
            {showPermitForm ? 'Cancel Permit' : '+ Issue Permit'}
          </button>
        </div>
      </header>

      {/* Conditionally render the creation form */}
      {showPermitForm && (
        <div className="mb-8 p-4 border-2 border-blue-200 rounded bg-blue-50">
          <CreatePermitForm 
             // Defaulting to WO 1 for testing. Later, users will select this.
            workOrderId={1} 
            // Pass the fetch function so the form can refresh the table after submitting
            onSuccess={() => {
              setShowPermitForm(false);
              fetchPermits(); 
            }} 
          />
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
                <tr key={permit.id} className="border-b">
                  <td className="p-2"><strong>PTW-{permit.id}</strong></td>
                  <td className="p-2">WO-{permit.work_order_id}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-sm ${permit.permit_type === 'Hot Work' ? 'bg-red-200 text-red-800' : 'bg-gray-200'}`}>
                      {permit.permit_type}
                    </span>
                  </td>
                  <td className="p-2">User {permit.requested_by_id}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-sm ${permit.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {permit.status}
                    </span>
                  </td>
                  <td className="p-2">{permit.requires_loto ? '🔴 Yes' : '⚪ No'}</td>
                  <td className="p-2"><button className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Review</button></td>
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
          {/* MOC Table logic remains unchanged for now */}
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
            {mocs.map((moc) => (
              <tr key={moc.id} className="border-b">
                <td className="p-2"><strong>{moc.id}</strong></td>
                <td className="p-2">{moc.title}</td>
                <td className="p-2">{moc.stage}</td>
                <td className="p-2">{moc.priority}</td>
                <td className="p-2">{moc.date}</td>
                <td className="p-2"><button className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Audit Trail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SafetyDashboard;