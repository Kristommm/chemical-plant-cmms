import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const WorkOrderForm = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_asset: '',
    priority: 'Medium',
    maintenance_type: 'Corrective',
    assigned_department: 'Mechanical' // <-- NEW: Default assignment
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Axios handles the URL, the headers, the token, and stringifies the formData automatically
      await api.post('/work-orders/', formData);

      // If it succeeds, redirect straight back to the maintenance dashboard
      navigate('/maintenance');
    } catch (err) {
      // Extract the FastAPI 400/422 validation error perfectly
      const errorMsg = err.response?.data?.detail || 'Failed to create work order';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/maintenance')} style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&larr;</button>
        <h2 style={{ margin: 0 }}>Create Work Order</h2>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Work Order Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="e.g. Replace seal on cooling pump"
            />
          </div>

          {/* --- Grid 1: Asset & Department --- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Asset</label>
              <input 
                type="text" 
                name="target_asset" 
                value={formData.target_asset} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                placeholder="e.g. Pump P-205A"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Assigned Department</label>
              <select 
                name="assigned_department" 
                value={formData.assigned_department} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              >
                <option value="Fatty Acid Plant">Fatty Acid Plant</option>
                <option value="Fatty Alcohol Plant">Fatty Alcohol Plant</option>
                <option value="Refinery Plant">Refinery Plant</option>
                <option value="Production">Production</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Utilities">Utilities</option>
                <option value="Instrumentation">Instrumentation</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Logistics">Logistics</option>
                <option value="Civil">Civil</option>
                <option value="Human Resources and Admin">Human Resources and Admin</option>
                <option value="Health, Safety, Security and Environment">Health, Safety, Security and Environment</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Accounting">Accounting</option>
                <option value="Legal">Legal</option>
                <option value="IT">IT</option>
              </select>
            </div>
          </div>

          {/* --- Grid 2: Type & Priority --- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Maintenance Type</label>
              <select 
                name="maintenance_type" 
                value={formData.maintenance_type} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              >
                <option value="Corrective">Corrective</option>
                <option value="Preventive">Preventive</option>
                <option value="Modification">Modification</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Priority</label>
              <select 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description & Instructions</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              rows="5"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical' }}
              placeholder="Provide detailed instructions, symptoms, or safety precautions..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => navigate('/maintenance')}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', marginRight: '1rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Creating...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkOrderForm;