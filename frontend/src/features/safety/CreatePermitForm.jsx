import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function CreatePermitForm({ onSuccess }) {
  const [workOrderId, setWorkOrderId] = useState('');
  const [workOrders, setWorkOrders] = useState([]); // NEW: State to hold the list of WOs
  const [permitType, setPermitType] = useState('General');
  const [requiresLoto, setRequiresLoto] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: Fetch active Work Orders when the form loads
  useEffect(() => {
    const fetchWorkOrders = async () => {
      const token = localStorage.getItem('cmms_token');
      try {
        // NOTE: Make sure this URL matches your actual Work Order endpoint!
        const response = await fetch('http://localhost:8000/work-orders/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setWorkOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch work orders for dropdown", error);
      }
    };

    fetchWorkOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      // Axios natively takes your object and formats it as a JSON payload
      const response = await api.post('/ptw/', {
        work_order_id: parseInt(workOrderId, 10), // Ensures it submits as a number
        permit_type: permitType,
        requires_loto: requiresLoto,
        requires_gas_testing: false
      });

      // response.data holds the instantly parsed JSON from FastAPI
      setMessage(`Permit #${response.data.id} requested successfully!`);
      if (onSuccess) {
         setTimeout(() => { onSuccess(); }, 800);
      }
    } catch (error) {
      // Differentiate between a FastAPI validation error (4xx/5xx) and a server crash/network failure
      if (error.response) {
        const errorMsg = error.response.data?.detail || 'Failed to create permit';
        setMessage(`Error: ${errorMsg}`);
      } else {
        setMessage('Network error occurred. Is the FastAPI server running?');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginTop: '0', marginBottom: '1rem' }}>Request Permit to Work</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* UPDATED: Combo Input + Datalist */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Work Order ID</label>
          <input 
            required 
            type="text" // Changed to text so searching feels more natural
            list="work-orders-list" // Connects the input to the datalist below
            value={workOrderId} 
            onChange={(e) => setWorkOrderId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Type ID or search list..."
            autoComplete="off" // Prevents browser autofill from covering the datalist
          />
          
          {/* The hidden datalist that populates the dropdown */}
          <datalist id="work-orders-list">
            {workOrders.map((wo) => (
              // The 'value' is what gets inserted into the input. 
              // The text inside the tag is shown alongside it in the dropdown.
              <option key={wo.id} value={wo.id}>
                {wo.title || 'Work Order'} 
              </option>
            ))}
          </datalist>
        </div>

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