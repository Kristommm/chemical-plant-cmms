import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const WorkOrderList = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [filters, setFilters] = useState({
    id: '',
    title: '',
    target_asset: '',
    maintenance_type: '',
    priority: '',
    status: '',
    assigned_department: '' // <-- NEW filter state
  });

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await fetch('http://localhost:8000/work-orders/?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch work orders');

        const data = await response.json();
        const sortedData = data.sort((a, b) => b.id - a.id);
        setWorkOrders(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrders();
  }, [token]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1); 
  };

  const filteredOrders = workOrders.filter(wo => {
    return (
      (filters.id === '' || wo.id.toString() === filters.id) &&
      wo.title.toLowerCase().includes(filters.title.toLowerCase()) &&
      wo.target_asset.toLowerCase().includes(filters.target_asset.toLowerCase()) &&
      (filters.maintenance_type === '' || wo.maintenance_type === filters.maintenance_type) &&
      (filters.priority === '' || wo.priority === filters.priority) &&
      (filters.status === '' || wo.status === filters.status) &&
      // <-- NEW filtering logic
      (filters.assigned_department === '' || wo.assigned_department === filters.assigned_department) 
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const filterInputStyle = { width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' };
  const thStyle = { padding: '1rem' };
  const tdStyle = { padding: '1rem' };

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'Urgent': return { bg: '#fee2e2', text: '#991b1b' };
      case 'High':   return { bg: '#ffedd5', text: '#c2410c' };
      case 'Medium': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Low':    return { bg: '#dcfce7', text: '#166534' };
      default:       return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading work orders...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#991b1b' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Maintenance Work Orders</h2>
        <Link to="/maintenance/new" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', background: '#2563eb', color: 'white', borderRadius: '6px', fontWeight: '500' }}>
          + New Work Order
        </Link>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Asset</th>
              <th style={thStyle}>Assigned Dept</th> {/* <-- NEW Header */}
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Priority</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
            
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '0.5rem 1rem' }}><input name="id" placeholder="Exact ID..." onChange={handleFilterChange} style={filterInputStyle} /></th>
              <th style={{ padding: '0.5rem 1rem' }}><input name="title" placeholder="Search title..." onChange={handleFilterChange} style={filterInputStyle} /></th>
              <th style={{ padding: '0.5rem 1rem' }}><input name="target_asset" placeholder="Search asset..." onChange={handleFilterChange} style={filterInputStyle} /></th>
              
              {/* <-- NEW Filter Dropdown */}
              <th style={{ padding: '0.5rem 1rem' }}>
                <select name="assigned_department" onChange={handleFilterChange} style={filterInputStyle}>
                  <option value="">All Depts</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Instrumentation">Instrumentation</option>
                  <option value="Civil">Civil</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Production">Production</option>
                </select>
              </th>

              <th style={{ padding: '0.5rem 1rem' }}>
                <select name="maintenance_type" onChange={handleFilterChange} style={filterInputStyle}>
                  <option value="">All Types</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Modification">Modification</option>
                </select>
              </th>
              <th style={{ padding: '0.5rem 1rem' }}>
                <select name="priority" onChange={handleFilterChange} style={filterInputStyle}>
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </th>
              <th style={{ padding: '0.5rem 1rem' }}>
                <select name="status" onChange={handleFilterChange} style={filterInputStyle}>
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Approval">Pending</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Closed">Closed</option>
                </select>
              </th>
              <th style={{ padding: '0.5rem 1rem' }}></th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((wo) => {
              const priorityStyle = getPriorityStyle(wo.priority);
              return (
                <tr key={wo.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={tdStyle}>WO-{wo.id}</td>
                  <td style={{ ...tdStyle, fontWeight: '500' }}>{wo.title}</td>
                  <td style={{ ...tdStyle, color: '#64748b' }}>{wo.target_asset}</td>
                  
                  {/* <-- NEW Data Cell */}
                  <td style={{ ...tdStyle, color: wo.assigned_department ? '#0f172a' : '#94a3b8', fontStyle: wo.assigned_department ? 'normal' : 'italic' }}>
                    {wo.assigned_department || 'Unassigned'}
                  </td>

                  <td style={tdStyle}>{wo.maintenance_type}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '500', backgroundColor: priorityStyle.bg, color: priorityStyle.text }}>
                      {wo.priority}
                    </span>
                  </td>
                  <td style={tdStyle}>{wo.status}</td>
                  <td style={tdStyle}>
                    <Link to={`/maintenance/${wo.id}`} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f1f5f9', color: '#0f172a', textDecoration: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500', border: '1px solid #cbd5e1' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No work orders match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid #e2e8f0', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Showing {filteredOrders.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#0f172a', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '500' }}>Previous</button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: currentPage === totalPages || totalPages === 0 ? '#f8fafc' : 'white', color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#0f172a', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', fontWeight: '500' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderList;