import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. We pull the 'user' object from context alongside the token
  const { token, user } = useContext(AuthContext);

  const [workOrder, setWorkOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        const response = await fetch(`http://localhost:8000/work-orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error('Work order not found');
          throw new Error('Failed to fetch work order details');
        }

        const data = await response.json();
        setWorkOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id, token]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    
    try {
      const response = await fetch(`http://localhost:8000/work-orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show the backend error message if the API rejects it
        throw new Error(errorData.detail || 'Failed to update status'); 
      }

      const updatedWO = await response.json();
      setWorkOrder(updatedWO); 
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'Urgent': return { bg: '#fee2e2', text: '#991b1b' };
      case 'High':   return { bg: '#ffedd5', text: '#c2410c' };
      case 'Medium': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Low':    return { bg: '#dcfce7', text: '#166534' };
      default:       return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading work order details...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#991b1b' }}>Error: {error}</div>;
  if (!workOrder || !user) return null;

  const priorityStyle = getPriorityStyle(workOrder.priority);

  // --- 2. Calculate Authorization ---
  // The user can edit if they are in the same department OR if they are a System Admin
  const canEditStatus = user.department === workOrder.creator.department || user.role === 'System Admin';

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/maintenance')} style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>
          &larr; Back to List
        </button>
        <h2 style={{ margin: 0, color: '#0f172a' }}>WO-{workOrder.id}: {workOrder.title}</h2>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>Current Status</span>
            
            {/* --- 3. Conditional Rendering based on Authorization --- */}
            {isUpdating ? (
              <span style={{ fontWeight: '600', color: '#2563eb' }}>Updating...</span>
            ) : canEditStatus ? (
              <select 
                value={workOrder.status} 
                onChange={handleStatusChange}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '600', backgroundColor: 'white', cursor: 'pointer' }}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Suspended">Suspended</option>
                <option value="Closed">Closed</option>
              </select>
            ) : (
              // If they don't have permission, just show the status text
              <div>
                <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#334155', fontWeight: '600', display: 'inline-block' }}>
                  {workOrder.status}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  (Only {workOrder.creator?.department || 'originating department'} can edit)
                </span>
              </div>
            )}
            
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>Priority Level</span>
            <span style={{ padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600', backgroundColor: priorityStyle.bg, color: priorityStyle.text }}>
              {workOrder.priority}
            </span>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Target Asset</h4>
              <p style={{ fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>{workOrder.target_asset}</p>
            </div>
            <div>
              <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Maintenance Type</h4>
              <p style={{ fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>{workOrder.maintenance_type}</p>
            </div>
            <div>
              <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Created At</h4>
              <p style={{ margin: 0, color: '#334155' }}>{formatDate(workOrder.created_at)}</p>
            </div>
            <div>
              <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Created By</h4>
              <p style={{ fontSize: '1.1rem', fontWeight: '500', margin: 0, color: '#0f172a' }}>
                {workOrder.creator?.full_name || 'Unknown User'}
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                {workOrder.creator?.department || ''} - {workOrder.creator?.role || ''}
              </p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2rem 0' }} />

          <div>
            <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Description & Instructions</h4>
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155' }}>
              {workOrder.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetail;