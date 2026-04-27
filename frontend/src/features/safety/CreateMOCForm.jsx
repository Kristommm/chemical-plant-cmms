import React, { useState } from 'react';
import api from '../../utils/api';

export default function CreateMOCForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Mechanical',
    priority: 'Medium',
    requires_pid_update: false,
    requires_dcs_update: false,
    requires_training: false
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      // Axios handles the headers, token injection, and JSON.stringify automatically
      const response = await api.post('/moc/', formData);

      // The parsed JSON payload is immediately available in response.data
      setMessage(`MOC #${response.data.id} initiated successfully!`);
      if (onSuccess) {
         setTimeout(() => onSuccess(), 800);
      }
    } catch (error) {
      // Neatly extract the FastAPI validation error or fallback to a default
      const errorMsg = error.response?.data?.detail || 'Failed to create MOC';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginTop: '0', marginBottom: '1rem' }}>Initiate Management of Change</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>MOC Title</label>
          <input 
            required 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} 
            placeholder="e.g., Upgrade Agitator Motor" 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Description / Justification</label>
          <textarea 
            required 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} 
            rows="3"
          ></textarea>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Instrumentation/DCS">Instrumentation/DCS</option>
              <option value="Process/Chemical">Process/Chemical</option>
              <option value="Procedure">Procedure</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Priority</label>
            <select 
              name="priority" 
              value={formData.priority} 
              onChange={handleChange} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}>
          <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Compliance Requirements (Check all that apply)</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="requires_pid_update" checked={formData.requires_pid_update} onChange={handleChange} style={{ width: '1.2rem', height: '1.2rem' }} /> 
              P&ID Update Required
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="requires_dcs_update" checked={formData.requires_dcs_update} onChange={handleChange} style={{ width: '1.2rem', height: '1.2rem' }} /> 
              DCS / Logic Update Required
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="requires_training" checked={formData.requires_training} onChange={handleChange} style={{ width: '1.2rem', height: '1.2rem' }} /> 
              Operator Training Required
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="btn-primary"
          style={{ width: 'fit-content', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit MOC Request'}
        </button>
      </form>
      
      {message && (
        <p style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          borderRadius: '4px',
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}