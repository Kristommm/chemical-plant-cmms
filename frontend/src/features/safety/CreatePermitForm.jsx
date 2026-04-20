import React, { useState } from 'react';

export default function CreatePermitForm({ workOrderId, onSuccess }) {
  const [permitType, setPermitType] = useState('General');
  const [requiresLoto, setRequiresLoto] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    // Retrieve the token from wherever you saved it during login
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/ptw/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // The Auth Bouncer
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
        
        // If the dashboard passed down an onSuccess function, run it!
        if (onSuccess) {
           // We add a tiny delay so the user can actually read the success message
           setTimeout(() => {
             onSuccess(); 
           }, 800);
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
    <div className="w-full">
      <h3 className="text-lg font-bold mb-4 text-blue-900">Request Permit to Work (WO-{workOrderId})</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className="mb-1 font-semibold text-gray-700">Permit Type</span>
          <select 
            value={permitType} 
            onChange={(e) => setPermitType(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-white"
          >
            <option value="General">General</option>
            <option value="Hot Work">Hot Work</option>
            <option value="Lockout/Tagout">Lockout/Tagout</option>
            <option value="Confined Space">Confined Space</option>
            <option value="Line Breaking">Line Breaking</option>
            <option value="Working at Heights">Working at Heights</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-gray-800 font-medium">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
            checked={requiresLoto} 
            onChange={(e) => setRequiresLoto(e.target.checked)} 
          />
          Requires LOTO (Lockout/Tagout)
        </label>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`py-2 px-4 rounded text-white font-bold transition-colors ${
            isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
      
      {message && (
        <p className={`mt-4 text-sm font-medium p-2 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}