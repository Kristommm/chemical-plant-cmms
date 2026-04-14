import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SafetyDashboard = () => {
  const [permits, setPermits] = useState([]);
  const [mocs, setMocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate fetching safety data from the FastAPI backend
  useEffect(() => {
    setTimeout(() => {
      setPermits([
        { id: 'PTW-899', type: 'Hot Work', location: 'Reactor B Area', applicant: 'J. Dela Cruz', status: 'Active', validUntil: 'Today, 17:00', loto: 'LOTO-102' },
        { id: 'PTW-902', type: 'Confined Space', location: 'Storage Tank T-40', applicant: 'M. Santos', status: 'Pending Approval', validUntil: 'N/A', loto: 'Required' },
        { id: 'PTW-895', type: 'Line Breaking', location: 'Pump P-101 Discharge', applicant: 'R. Garcia', status: 'Suspended', validUntil: 'Expired', loto: 'LOTO-098' },
      ]);

      setMocs([
        { id: 'MOC-204', title: 'Temporary Piping Bypass on Chiller', stage: 'Engineering Review', priority: 'High', date: '2026-04-12' },
        { id: 'MOC-205', title: 'Upgrade Agitator Motor to 480V', stage: 'Draft', priority: 'Medium', date: '2026-04-14' },
      ]);
      
      setIsLoading(false);
    }, 600);
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <p>Loading safety protocols and permits...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Safety & Compliance</h1>
          <p className="date-display">Manage hazardous work permits, LOTO, and plant modifications.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => console.log('Initiate MOC')}>+ Initiate MOC</button>
          <button className="btn-primary" onClick={() => console.log('Create PTW')}>+ Issue Permit</button>
        </div>
      </header>

      {/* --- Safety KPIs --- */}
      <section className="kpi-grid">
        <div className="kpi-card safety">
          <h3>Active PTWs</h3>
          <span className="kpi-value">{permits.filter(p => p.status === 'Active').length}</span>
          <p>Permits live on the floor</p>
        </div>
        <div className="kpi-card warning">
          <h3>Active LOTO</h3>
          <span className="kpi-value">14</span>
          <p>Equipment isolation locks applied</p>
        </div>
        <div className="kpi-card compliance">
          <h3>Pending MOCs</h3>
          <span className="kpi-value">{mocs.length}</span>
          <p>Awaiting cross-functional review</p>
        </div>
      </section>

      {/* --- Permit to Work (PTW) Table --- */}
      <section className="action-panel" style={{ marginBottom: '2rem' }}>
        <h2>Permit to Work (PTW) Control</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Permit ID</th>
              <th>Type</th>
              <th>Location</th>
              <th>Applicant</th>
              <th>Status</th>
              <th>LOTO Link</th>
              <th>Valid Until</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {permits.map((permit) => (
              <tr key={permit.id}>
                <td><strong>{permit.id}</strong></td>
                <td><span className={`badge ${permit.type === 'Hot Work' ? 'urgent' : 'permit'}`}>{permit.type}</span></td>
                <td>{permit.location}</td>
                <td>{permit.applicant}</td>
                <td>
                  <span className={`badge ${permit.status === 'Active' ? 'permit' : permit.status === 'Suspended' ? 'warning' : 'work'}`}>
                    {permit.status}
                  </span>
                </td>
                <td>{permit.loto}</td>
                <td>{permit.validUntil}</td>
                <td><button className="btn-small">Review</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* --- Management of Change (MOC) Table --- */}
      <section className="action-panel">
        <h2>Management of Change (MOC)</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>MOC ID</th>
              <th>Title</th>
              <th>Review Stage</th>
              <th>Priority</th>
              <th>Date Initiated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mocs.map((moc) => (
              <tr key={moc.id}>
                <td><strong>{moc.id}</strong></td>
                <td>{moc.title}</td>
                <td>{moc.stage}</td>
                <td>
                  <span className={`badge ${moc.priority === 'High' ? 'urgent' : 'medium'}`}>
                    {moc.priority}
                  </span>
                </td>
                <td>{moc.date}</td>
                <td><button className="btn-small">Audit Trail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SafetyDashboard;