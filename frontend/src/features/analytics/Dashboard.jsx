import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

// Quick helper to read the User ID directly from your JWT payload
const getUserIdFromToken = () => {
  const token = localStorage.getItem('cmms_token');
  if (!token) return null;
  try {
    // Splits the JWT and decodes the base64 payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // Our backend sets "sub" as the user_id
  } catch (e) {
    return null;
  }
};

const getStatusBadgeStyle = (status) => {
  if (!status) return { bg: '#e2e8f0', text: '#475569' }; // Default Gray

  switch (status.toLowerCase().trim()) {
    case 'open':
      return { bg: '#dbeafe', text: '#1e40af' }; // Blue
    case 'in progress':
      return { bg: '#fef3c7', text: '#b45309' }; // Amber/Orange
    case 'pending approval':
      return { bg: '#f3e8ff', text: '#6b21a8' }; // Purple
    case 'approved':
    case 'active':
    case 'implemented':
      return { bg: '#dcfce3', text: '#15803d' }; // Green
    case 'requested':
    case 'engineering review':
    case 'safety review':
      return { bg: '#fee2e2', text: '#b91c1c' }; // Red
    default:
      return { bg: '#e2e8f0', text: '#475569' }; // Default Gray
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ activeWorkOrders: 0, pendingPermits: 0, openMOCs: 0 });
  
  // New state arrays for our feeds
  const [departmentTasks, setDepartmentTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentUserId = getUserIdFromToken();

        const [woRes, permitRes, mocRes, userRes] = await Promise.all([
          api.get('/work-orders/', { params: { limit: 1000 } }), 
          api.get('/ptw/', { params: { limit: 1000 } }), 
          api.get('/moc/', { params: { limit: 1000 } }),
          api.get(`/users/${currentUserId}`)
        ]);

        const userDepartment = userRes.data.department;

        setDepartmentTasks(departmentTasks);

        // --- 1. Filter Active Work Orders ---
        const activeWOs = woRes.data.filter(wo => 
          wo.status && ['open', 'in progress', 'pending approval'].includes(wo.status.toLowerCase().trim())
        );

        // --- 2. Filter Active Permits ---
        const activePermits = permitRes.data.filter(permit => 
          permit.status && ['requested', 'approved', 'active'].includes(permit.status.toLowerCase().trim())
        );

        // --- 3. Filter Active MOCs ---
        const activeMOCs = mocRes.data.filter(moc => 
          moc.stage && ['engineering review', 'safety review', 'approved', 'implemented'].includes(moc.stage.toLowerCase().trim())
        );

        const deptTasks = activeWOs.filter(wo => {
          if (!wo.department || !userDepartment) return false;
          // Use our defensive lowercase trick to ensure they match perfectly
          return wo.department.toLowerCase().trim() === userDepartment.toLowerCase().trim();
        });

        // --- SET METRICS ---
        setMetrics({
          activeWorkOrders: activeWOs.length, 
          pendingPermits: activePermits.length, 
          openMOCs: activeMOCs.length 
        });


        // --- BUILD: My Assigned Tasks ---
        // Assuming your backend uses 'assigned_to' (Update this property name if needed!)
        const userTasks = activeWOs.filter(wo => String(wo.assigned_department) === String(userDepartment));

        setDepartmentTasks(userTasks);
        
        // --- BUILD: Unified Recent Activity ---
        // We map them to a standard shape: { id, type, title, date, status }
        const normalizedWOs = activeWOs.map(wo => ({
          id: wo.id, type: 'Work Order', title: wo.title || wo.description, date: wo.created_at, status: wo.status
        }));
        
        const normalizedPermits = activePermits.map(p => ({
          id: p.id, type: 'Permit', title: p.description || `Permit #${p.id}`, date: p.created_at, status: p.status
        }));
        
        const normalizedMOCs = activeMOCs.map(m => ({
          id: m.id, type: 'MOC', title: m.title || `MOC #${m.id}`, date: m.created_at, status: m.stage
        }));

        // Combine them, sort by newest first, and slice the top 5
        const combinedFeed = [...normalizedWOs, ...normalizedPermits, ...normalizedMOCs]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
          
        console.log(normalizedPermits);

        setRecentActivities(combinedFeed);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

    return (
    <div style={{ padding: '2rem', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      
      {/* 1. NEW HEADER LAYOUT: Title on left, Action Bar on right */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>Plant Overview</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Welcome back. Here is the current status of the facility.</p>
        </div>
        
        {/* Horizontal Quick Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/maintenance/new-wo')} 
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--accent-blue)', color: '#fff', cursor: 'pointer', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            + Create Work Order
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/safety')} 
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#1e293b', cursor: 'pointer', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Request PTW
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/safety')} 
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#1e293b', cursor: 'pointer', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Initiate MOC
          </button>
        </div>
      </header>

      {/* 2. KPI Metric Cards (Unchanged) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="action-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Active Work Orders</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>{loading ? '-' : metrics.activeWorkOrders}</p>
        </div>
        <div className="action-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Pending Permits</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>{loading ? '-' : metrics.pendingPermits}</p>
        </div>
        <div className="action-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Open MOCs</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>{loading ? '-' : metrics.openMOCs}</p>
        </div>
      </div>

      {/* 3. Full-Width Data Feeds Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Department Tasks (Full Width) */}
        <div className="action-panel" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Department Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p> : departmentTasks.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>There are no open tasks for your department.</p>
            ) : (
              departmentTasks.map(task => {
                // Call the helper function for each task
                const badgeStyle = getStatusBadgeStyle(task.status);
                
                return (
                  <div key={task.id} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>WO #{task.id}: {task.title || task.description}</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: badgeStyle.bg,   // Inject Dynamic Background
                      color: badgeStyle.text,           // Inject Dynamic Text Color
                      borderRadius: '9999px', 
                      fontWeight: '600',                // Bumped up weight slightly for readability
                      textTransform: 'capitalize'       // Ensures 'in progress' renders as 'In Progress'
                    }}>
                      {task.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Plant Activity Feed (Full Width) */}
        <div className="action-panel" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Plant Activity Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading activity...</p> : recentActivities.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No recent activity to display.</p>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={`${activity.type}-${activity.id}`} style={{ padding: '1rem', borderBottom: index !== recentActivities.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      backgroundColor: activity.type === 'MOC' ? '#eff6ff' : activity.type === 'Permit' ? '#fef3c7' : '#fef2f2',
                      color: activity.type === 'MOC' ? '#1d4ed8' : activity.type === 'Permit' ? '#b45309' : '#b91c1c'
                    }}>
                      {activity.type}
                    </span>
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>{activity.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ textTransform: 'capitalize' }}>{activity.status}</span>
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;