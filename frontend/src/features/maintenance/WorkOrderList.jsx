import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkOrderList = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate fetching data from your FastAPI backend
  useEffect(() => {
    setTimeout(() => {
      setWorkOrders([
        { id: 'WO-1042', title: 'Replace seal on Agitator', asset: 'Reactor B', priority: 'High', status: 'In Progress', date: '2026-04-14' },
        { id: 'WO-1041', title: 'Monthly Pump Lubrication', asset: 'Pump P-101', priority: 'Medium', status: 'Open', date: '2026-04-13' },
        { id: 'WO-1040', title: 'Fix leaking valve', asset: 'Valve V-305', priority: 'Urgent', status: 'Closed', date: '2026-04-10' },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Work Orders</h1>
          <p className="date-display">Manage and track all plant maintenance activities.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/maintenance/new')}
        >
          + Create Work Order
        </button>
      </header>

      <section className="action-panel">
        {isLoading ? (
          <p>Loading work orders...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>WO Number</th>
                <th>Title</th>
                <th>Target Asset</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => (
                <tr key={wo.id}>
                  <td><strong>{wo.id}</strong></td>
                  <td>{wo.title}</td>
                  <td>{wo.asset}</td>
                  <td>
                    <span className={`badge ${wo.priority.toLowerCase()}`}>{wo.priority}</span>
                  </td>
                  <td>{wo.status}</td>
                  <td>{wo.date}</td>
                  <td>
                    <button className="btn-small"
                    onClick={() => navigate(`/maintenance/${wo.id}`)}
                  >View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default WorkOrderList;