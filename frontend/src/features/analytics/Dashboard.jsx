import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  // 1. State for our dashboard metrics
  const [metrics, setMetrics] = useState({
    pendingWorkOrders: 0,
    criticalDeadlines: 0,
    activePermits: 0,
    pendingMOCs: 0,
  });

  const [urgentTasks, setUrgentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Simulate data fetching from the FastAPI backend
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      // TODO: Replace with actual API call: await fetch('/api/v1/analytics/dashboard')
      
      // Simulating network delay
      setTimeout(() => {
        setMetrics({
          pendingWorkOrders: 42,
          criticalDeadlines: 7,
          activePermits: 12,
          pendingMOCs: 3,
        });

        setUrgentTasks([
          { id: 'WO-1042', type: 'Work Order', desc: 'Replace seal on Reactor B Agitator', due: 'Today, 14:00' },
          { id: 'PTW-899', type: 'Permit', desc: 'Hot Work Permit - Line 4 Welding', due: 'Awaiting Approval' },
          { id: 'PM-401', type: 'Calibration', desc: 'Flow Transmitter FT-201', due: 'Tomorrow, 08:00' },
        ]);
        
        setIsLoading(false);
      }, 800);
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <div className="loading-state">Loading plant data...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Plant Operations Dashboard</h1>
        <p className="date-display">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* --- Key Performance Indicators (KPIs) --- */}
      <section className="kpi-grid">
        <div className="kpi-card warning">
          <h3>Critical Deadlines</h3>
          <span className="kpi-value">{metrics.criticalDeadlines}</span>
          <p>PMs due within 48 hrs</p>
        </div>

        <div className="kpi-card standard">
          <h3>Pending Work Orders</h3>
          <span className="kpi-value">{metrics.pendingWorkOrders}</span>
          <p>Awaiting assignment/execution</p>
        </div>

        <div className="kpi-card safety">
          <h3>Active Permits (PTW)</h3>
          <span className="kpi-value">{metrics.activePermits}</span>
          <p>Currently active on the floor</p>
        </div>

        <div className="kpi-card compliance">
          <h3>Pending MOCs</h3>
          <span className="kpi-value">{metrics.pendingMOCs}</span>
          <p>Awaiting engineering review</p>
        </div>
      </section>

      {/* --- Actionable Lists --- */}
      <section className="action-section">
        <div className="action-panel">
          <h2>Urgent Action Items</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Status / Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {urgentTasks.map((task) => (
                <tr key={task.id}>
                  <td><strong>{task.id}</strong></td>
                  <td><span className={`badge ${task.type.toLowerCase()}`}>{task.type}</span></td>
                  <td>{task.desc}</td>
                  <td>{task.due}</td>
                  <td><button className="btn-small">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;