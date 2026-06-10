import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdminLogin() {
  const { adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const result = await adminLogin(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="page-transition" style={{
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--gradient-start) 100%)',
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', animation: 'fadeInUp 0.6s ease-out' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#F2C87E', marginBottom: '8px' }}>Admin Portal</h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Log in to access your VConnect admin panel</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(231, 76, 60, 0.1)', borderLeft: '4px solid #e74c3c',
            color: '#c0392b', padding: '12px 16px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.9rem'
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-user-shield" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#203A5F' }}></i>
              <input 
                type="text" 
                id="username" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-lock" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#203A5F' }}></i>
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '10px', borderRadius: '8px' }}
            disabled={loading}
          >
            {loading ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Admin Login'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default AdminLogin;
