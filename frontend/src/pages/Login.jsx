import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mobile || !password) {
      setError('Please enter both mobile number and password');
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    const result = await login(mobile, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="page-transition" style={{
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--gradient-start) 100%)',
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '480px', animation: 'fadeInUp 0.6s ease-out' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--secondary-color)', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>Sign in to access your VConnect dashboard</p>
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
            <label htmlFor="mobile">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-mobile-alt" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-color)' }}></i>
              <input 
                type="text" 
                id="mobile" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="Enter your mobile number"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-lock" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-color)' }}></i>
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Link to="/forgot-password" style={{ color: 'var(--highlight-color)', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '10px', borderRadius: '8px' }}
            disabled={loading}
          >
            {loading ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Login'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-light)' }}>Don't have an account?</span>
          <Link to="/signup" style={{ color: 'var(--secondary-color)', fontWeight: 'bold', textDecoration: 'none' }}>Create Account</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
