import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const WorkOrderDetail = () => {
  const { id } = useParams(); // Grabs the ID from the URL (e.g., 'WO-1042')
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching the specific work order details
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // In reality, this would be: await axios.get(`/api/v1/work-orders/${id}`)
      setWorkOrder({
        id: id,
        title: id === 'WO-1042' ? 'Replace seal on Agitator' : 'General Maintenance',
        description: 'The primary mechanical seal on the agitator shaft is weeping fluid. Requires immediate lockout/tagout, draining of the vessel, and seal replacement. Ensure compatible perfluoroelastomer O-rings are used.',
        assetId: 'Reactor B',
        assetLocation: 'Polymerization Unit 1',
        priority: 'High',
        status: 'In Progress',
        type: 'Corrective',
        assignedTo: 'Maintenance Tech - Team Alpha',
        dateCreated: '2026-04-14',
        lastUpdated: '2026-04-14 10:30 AM',
        tasks: [
          { step: 1, desc: 'Secure Permit to Work and apply LOTO', completed: true },
          { step: 2, desc: 'Drain vessel and flush', completed: false },
          { step: 3, desc: 'Remove agitator motor and gearbox', completed: false },
          { step: 4, desc: 'Replace mechanical seal', completed: false },
        ]
      });
      setIsLoading(false);
    }, 400);
  }, [id]);

  if (isLoading) {
    return <div className="dashboard-container"><p>Loading Work Order {id}...</p></div>;
  }

  if (!workOrder) {
    return <div className="dashboard-container"><p>Work Order not found.</p></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <button className="btn-secondary" onClick={() => navigate('/maintenance')}>&larr; Back</button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ margin: 0 }}>{workOrder.id}: {workOrder.title}</h1>
            <span className={`badge ${workOrder.priority.toLowerCase()}`}>{workOrder.priority}</span>
          </div>
          <p className="date-display">Created on {workOrder.dateCreated} • Last updated {workOrder.lastUpdated}</p>
        </div>
      </header>

      <div className="asset-layout"> {/* Reusing the split layout from Assets */}
        
        {/* Left Column: Core Details */}
        <div className="asset-details-panel action-panel">
          <h3>Job Overview</h3>
          <div className="details-grid" style={{ marginTop: '1rem' }}>
            <div className="detail-item">
              <label>Status</label>
              <p><span className={`badge ${workOrder.status === 'Closed' ? 'permit' : 'work'}`}>{workOrder.status}</span></p>
            </div>
            <div className="detail-item">
              <label>Maintenance Type</label>
              <p>{workOrder.type}</p>
            </div>
            <div className="detail-item">
              <label>Target Asset</label>
              <p><strong>{workOrder.assetId}</strong> ({workOrder.assetLocation})</p>
            </div>
            <div className="detail-item">
              <label>Assigned To</label>
              <p>{workOrder.assignedTo}</p>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Description</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{workOrder.description}</p>
        </div>

        {/* Right Column: Execution Checklist */}
        <div className="asset-tree-panel action-panel">
          <h3>Execution Checklist</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {workOrder.tasks.map(task => (
              <li key={task.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  readOnly 
                  style={{ marginTop: '4px', transform: 'scale(1.2)' }}
                />
                <span style={{ color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.desc}
                </span>
              </li>
            ))}
          </ul>
          
          <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-primary">Update Status</button>
            <button className="btn-secondary" style={{ borderColor: 'var(--warning-red)', color: 'var(--warning-red)' }}>Link PTW / LOTO</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetail;