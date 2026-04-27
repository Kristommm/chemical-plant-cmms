import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function MOCAuditTrail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [moc, setMoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMoc = async () => {
      try {
        const response = await api.get(`/moc/${id}`);
        setMoc(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setMessage('MOC not found.');
        } else {
          setMessage('Network error fetching MOC details.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMoc();
  }, [id]);

  const handleStageChange = async (newStage) => {
    setMessage(''); 
    try {
      // Axios handles the URL, payload stringification, and headers in one clean line
      const response = await api.patch(`/moc/${id}/stage`, { stage: newStage });

      // Update the UI with the freshly parsed JSON response
      setMoc(response.data);
      setMessage(`MOC successfully advanced to ${newStage}.`);
    } catch (error) {
      // Extract the FastAPI validation error explicitly
      if (error.response) {
        const errorMsg = error.response.data?.detail || 'Failed to update stage.';
        setMessage(`Error: ${errorMsg}`);
      } else {
        setMessage('Network error while updating stage.');
      }
    }
  };

  // --- Dynamic Stage Colors ---
  const getStageStyles = (stage) => {
    switch (stage) {
      case 'Draft': return { bg: '#e2e8f0', text: '#475569' };
      case 'Engineering Review': return { bg: '#cce5ff', text: '#004085' };
      case 'Safety Review': return { bg: '#fff3cd', text: '#856404' };
      case 'Approved': return { bg: '#d4edda', text: '#155724' };
      case 'Implemented': return { bg: '#d1ecf1', text: '#0c5460' };
      case 'Closed': return { bg: '#333333', text: '#ffffff' };
      default: return { bg: '#f1f5f9', text: '#0f172a' };
    }
  };

  // --- Linear Workflow Buttons ---
  const renderActionButtons = () => {
    const btnStyle = (bg) => ({
      padding: '0.75rem 1.5rem',
      backgroundColor: bg,
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'opacity 0.2s'
    });

    switch (moc.stage) {
      case 'Draft':
        return <button onClick={() => handleStageChange('Engineering Review')} style={btnStyle('#007bff')}>Submit for Engineering Review</button>;
      case 'Engineering Review':
        return (
          <>
            <button onClick={() => handleStageChange('Safety Review')} style={btnStyle('#17a2b8')}>Approve Engineering & Send to Safety</button>
            <button onClick={() => handleStageChange('Draft')} style={btnStyle('#dc3545')}>Reject (Return to Draft)</button>
          </>
        );
      case 'Safety Review':
        return (
          <>
            <button onClick={() => handleStageChange('Approved')} style={btnStyle('#28a745')}>Approve MOC (Ready for Work)</button>
            <button onClick={() => handleStageChange('Engineering Review')} style={btnStyle('#dc3545')}>Reject (Return to Engineering)</button>
          </>
        );
      case 'Approved':
        return <button onClick={() => handleStageChange('Implemented')} style={btnStyle('#17a2b8')}>Mark as Implemented</button>;
      case 'Implemented':
        return <button onClick={() => handleStageChange('Closed')} style={btnStyle('#343a40')}>Close MOC</button>;
      case 'Closed':
        return <p style={{ color: '#666', fontStyle: 'italic' }}>This MOC is permanently closed.</p>;
      default:
        return null;
    }
  };

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading MOC details...</div>;
  if (!moc) return <div style={{ padding: '2rem', color: 'red' }}>{message}</div>;

  const stageStyle = getStageStyles(moc.stage);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, color: '#1e293b' }}>MOC-{moc.id}: {moc.title}</h1>
          <span style={{ 
            padding: '8px 16px', 
            borderRadius: '6px', 
            fontWeight: 'bold',
            backgroundColor: stageStyle.bg,
            color: stageStyle.text,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.85rem'
          }}>
            {moc.stage}
          </span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, color: '#475569' }}>Description / Justification</h3>
          <p style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{moc.description}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', fontSize: '1.05rem' }}>
          <p><strong>Category:</strong> {moc.category}</p>
          <p><strong>Priority:</strong> {moc.priority}</p>
          <p><strong>Initiator ID:</strong> {moc.initiator_id}</p>
          <p><strong>Initiated On:</strong> {new Date(moc.created_at).toLocaleDateString()}</p>
        </div>

        {/* Compliance Requirements Block */}
        <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b' }}>Compliance Requirements</h3>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <p style={{ margin: 0 }}><strong>P&ID Update:</strong> {moc.requires_pid_update ? '🔴 Required' : '⚪ N/A'}</p>
            <p style={{ margin: 0 }}><strong>DCS Logic Update:</strong> {moc.requires_dcs_update ? '🔴 Required' : '⚪ N/A'}</p>
            <p style={{ margin: 0 }}><strong>Operator Training:</strong> {moc.requires_training ? '🔴 Required' : '⚪ N/A'}</p>
          </div>
        </div>

        {message && (
          <p style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderLeft: '4px solid #007bff', borderRadius: '4px', fontWeight: '500' }}>
            {message}
          </p>
        )}

        {/* Action Panel */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#475569' }}>Review Workflow</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {renderActionButtons()}
          </div>
        </div>

      </div>
    </div>
  );
}