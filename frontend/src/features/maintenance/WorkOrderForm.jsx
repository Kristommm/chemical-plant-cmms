import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkOrderForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assetId: '',
    priority: 'Medium',
    type: 'Corrective',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send data to FastAPI -> await axios.post('/api/v1/work-orders', formData)
    console.log('Submitting Work Order:', formData);
    
    // After submission, route the user back to the list
    navigate('/maintenance');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Generate Work Order</h1>
        <p className="date-display">Create a new maintenance task for the floor.</p>
      </header>

      <div className="action-panel" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} className="custom-form">
          
          <div className="form-group">
            <label>Work Order Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g., Replace bearing on main conveyor"
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Asset</label>
              <select name="assetId" value={formData.assetId} onChange={handleChange} required>
                <option value="">-- Select an Asset --</option>
                <option value="reactor-b">Reactor B</option>
                <option value="pump-101">Pump P-101</option>
                <option value="conveyor-2">Conveyor Belt 2</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority Level</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent (Safety Critical)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Maintenance Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Corrective">Corrective (Breakdown)</option>
                <option value="Preventive">Preventive (Scheduled)</option>
                <option value="Modification">Modification / Upgrade</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Detailed Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="5" 
              placeholder="Describe the issue, required tools, and known safety hazards..."
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/maintenance')}>Cancel</button>
            <button type="submit" className="btn-primary">Generate Work Order</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkOrderForm;