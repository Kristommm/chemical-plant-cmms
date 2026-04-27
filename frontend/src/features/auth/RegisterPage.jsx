import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api'; // Import your Axios instance!

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'Technician',
    department: 'Mechanical' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Axios handles the JSON.stringify and the headers automatically!
      await api.post('/users/', formData);

      // Show success message briefly, then redirect to login
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // Axios stores backend HTTP exception details neatly in response.data
      const errorMsg = err.response?.data?.detail || 'Registration failed';
      setError(errorMsg);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
      <div className="action-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Register for CMMS Pro access.
        </p>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>Registration successful! Redirecting to login...</div>}

        <form onSubmit={handleSubmit} className="custom-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleChange} 
              placeholder="e.g. Juan Dela Cruz"
              required 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="name@company.com"
              required 
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="System Admin">System Admin</option>
              <option value="Plant Manager">Plant Manager</option>
              <option value="Reliability Engineer">Reliability Engineer</option>
              <option value="Technician">Technician</option>
              <option value="Operator">Operator</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Department</label>
            <select name="department" value={formData.department} onChange={handleChange}>
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

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={success}>
            {success ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;