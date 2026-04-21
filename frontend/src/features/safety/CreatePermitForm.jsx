import React, { useState } from 'react';

export default function CreatePermitForm({ workOrderId, onSuccess }) {
  const [permitType, setPermitType] = useState('General');
  const [requiresLoto, setRequiresLoto] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    // ... (Keep all your exact fetch logic here, don't change the Javascript!)
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('cmms_token');

    try {
      const response = await fetch('http://localhost:8000/ptw/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          work_order_id: workOrderId,
          permit_type: permitType,
          requires_loto: requiresLoto,
          requires_gas_testing: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Permit #${data.id} requested successfully!`);
        if (onSuccess) {
           setTimeout(() => { onSuccess(); }, 800);
        }
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail || 'Failed to create permit'}`);
      }
    } catch (error) {
      setMessage('Network error occurred. Is the FastAPI server running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginTop: '0', marginBottom: '1rem' }}>Request Permit to Work (WO-{workOrderId})</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Permit Type</label>
          <select 
            value={permitType} 
            onChange={(e) => setPermitType(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="General">General</option>
            <option value="Hot Work">Hot Work</option>
            <option value="Lockout/Tagout">Lockout/Tagout</option>
            <option value="Confined Space">Confined Space</option>
            <option value="Line Breaking">Line Breaking</option>
            <option value="Working at Heights">Working at Heights</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            checked={requiresLoto} 
            onChange={(e) => setRequiresLoto(e.target.checked)} 
            style={{ width: '1.2rem', height: '1.2rem' }}
          />
          <label style={{ fontWeight: '500' }}>Requires LOTO (Lockout/Tagout)</label>
        </div>

        {/* Using YOUR custom button class here! */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary"
          style={{ width: 'fit-content', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
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