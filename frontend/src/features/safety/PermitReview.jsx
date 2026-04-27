import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function PermitReview() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [permit, setPermit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPermit = async () => {
      try {
        // Axios handles the token injection and the URL formatting
        const response = await api.get(`/ptw/${id}`);
        setPermit(response.data);
      } catch (error) {
        // Easily catch 404s vs general network errors
        if (error.response && error.response.status === 404) {
          setMessage('Permit not found.');
        } else {
          setMessage('Network error fetching permit details.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPermit();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setMessage(''); // Clear old messages
    try {
      // Pass the route and the payload; Axios handles headers and stringification
      const response = await api.patch(`/ptw/${id}/status`, { status: newStatus });

      // Update the state with the freshly parsed JSON response
      setPermit(response.data);
      setMessage(`Permit successfully moved to ${newStatus}.`);
    } catch (error) {
      // Cleanly extract the FastAPI validation error
      if (error.response) {
        const errorMsg = error.response.data?.detail || 'Failed to update status.';
        setMessage(`Error: ${errorMsg}`);
      } else {
        setMessage('Network error while updating status.');
      }
    }
  };

  // --- Helper 1: Dynamic Status Colors ---
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Draft': return { bg: '#e2e8f0', text: '#475569' }; // Gray
      case 'Requested': return { bg: '#fff3cd', text: '#856404' }; // Yellow
      case 'Approved': return { bg: '#cce5ff', text: '#004085' }; // Blue
      case 'Active': return { bg: '#d4edda', text: '#155724' }; // Green
      case 'Suspended': return { bg: '#f8d7da', text: '#721c24' }; // Red
      case 'Closed': return { bg: '#333333', text: '#ffffff' }; // Black/Dark
      default: return { bg: '#f1f5f9', text: '#0f172a' };
    }
  };

  // --- Helper 2: Contextual Action Buttons ---
  const renderActionButtons = () => {
    const btnStyle = (bg, hover) => ({
      padding: '0.75rem 1.5rem',
      backgroundColor: bg,
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'opacity 0.2s'
    });

    switch (permit.status) {

      case 'Draft':
        return (
            <button 
            onClick={() => handleStatusChange('Requested')} 
            style={btnStyle('#17a2b8')} // A nice teal/info color for submitting
            >
            Submit for Review (Change to Requested)
            </button>
        );
      case 'Requested':
        return (
          <>
            <button onClick={() => handleStatusChange('Approved')} style={btnStyle('#007bff')}>Approve (Safety Review)</button>
            <button onClick={() => handleStatusChange('Draft')} style={btnStyle('#6c757d')}>Return to Draft</button>
          </>
        );
      case 'Approved':
        return (
          <>
            <button onClick={() => handleStatusChange('Active')} style={btnStyle('#28a745')}>Issue Permit (Set Active)</button>
            <button onClick={() => handleStatusChange('Suspended')} style={btnStyle('#dc3545')}>Hold / Suspend</button>
          </>
        );
      case 'Active':
        return (
          <>
            <button onClick={() => handleStatusChange('Closed')} style={btnStyle('#343a40')}>Close Permit (Work Complete)</button>
            <button onClick={() => handleStatusChange('Suspended')} style={btnStyle('#dc3545')}>Suspend Operations</button>
          </>
        );
      case 'Suspended':
        return (
          <>
            <button onClick={() => handleStatusChange('Active')} style={btnStyle('#28a745')}>Reactivate Permit</button>
            <button onClick={() => handleStatusChange('Closed')} style={btnStyle('#343a40')}>Close Permit (Aborted)</button>
          </>
        );
      case 'Closed':
        return <p style={{ color: '#666', fontStyle: 'italic' }}>This permit is closed and archived. No further actions can be taken.</p>;
      default:
        return <p style={{ color: '#666', fontStyle: 'italic' }}>No workflow actions available for this state.</p>;
    }
  };

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading permit details...</div>;
  if (!permit) return <div style={{ padding: '2rem', color: 'red' }}>{message}</div>;

  const statusStyle = getStatusStyles(permit.status);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {/* Header with Dynamic Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, color: '#1e293b' }}>Permit to Work: PTW-{permit.id}</h1>
          <span style={{ 
            padding: '8px 16px', 
            borderRadius: '6px', 
            fontWeight: 'bold',
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.85rem'
          }}>
            {permit.status}
          </span>
        </div>

        {/* Permit Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', fontSize: '1.05rem' }}>
          <p><strong>Work Order:</strong> WO-{permit.work_order_id}</p>
          <p><strong>Type:</strong> {permit.permit_type}</p>
          <p><strong>Requester:</strong> {permit.requested_by?.full_name || 'Unknown'}</p>
          <p><strong>LOTO Required:</strong> {permit.requires_loto ? '🔴 Yes' : '⚪ No'}</p>
        </div>

        {message && (
          <p style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderLeft: '4px solid #007bff', borderRadius: '4px', fontWeight: '500' }}>
            {message}
          </p>
        )}

        {/* Action Panel */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#475569' }}>Workflow Actions</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {renderActionButtons()}
          </div>
        </div>

      </div>
    </div>
  );
}