import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function SignUp() {
  const navigate = useNavigate();
  
  // Wizard steps: 1 = Details, 2 = OTP Verification
  const [step, setStep] = useState(1);
  
  // Form values
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    password: '',
    confirm_password: ''
  });

  // OTP values (6 digits)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { first_name, last_name, mobile, password, confirm_password } = formData;

    if (!first_name || !mobile || !password || !confirm_password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^[A-Za-z\s]{2,}$/.test(first_name)) {
      setError('First name should contain only letters (minimum 2 characters)');
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm_password) {
      setError('Password and Confirm Password do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/send-otp', {
        first_name,
        last_name,
        mobile,
        password,
        confirm_password
      });

      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // OTP inputs handling
  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    // Auto-focus next field
    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace focus previous
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 2: Verify OTP & Redirect
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter a complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        mobile: formData.mobile,
        otp,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password
      });

      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        // Redirect to Profile creation page
        setTimeout(() => {
          navigate('/create-profile');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--gradient-start) 100%)',
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '540px', animation: 'fadeInUp 0.6s ease-out' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#F2C87E', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            {step === 1 ? 'Step 1: Set up login details' : 'Step 2: Verify WhatsApp OTP'}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #D4A047, #F2C87E)',
            width: step === 1 ? '50%' : '100%',
            transition: 'width 0.4s ease'
          }}></div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            background: 'rgba(231, 76, 60, 0.1)', borderLeft: '4px solid #e74c3c',
            color: '#c0392b', padding: '12px 16px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.9rem'
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(39, 174, 96, 0.1)', borderLeft: '4px solid #27ae60',
            color: '#27ae60', padding: '12px 16px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.9rem'
          }}>
            <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
            {success}
          </div>
        )}

        {/* Step 1: Input details */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="first_name">First Name *</label>
                <input 
                  type="text" 
                  id="first_name" 
                  className="form-input" 
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="last_name">Last Name</label>
                <input 
                  type="text" 
                  id="last_name" 
                  className="form-input" 
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number *</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-mobile-alt" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#203A5F' }}></i>
                <input 
                  type="text" 
                  id="mobile" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirm Password *</label>
              <input 
                type="password" 
                id="confirm_password" 
                className="form-input" 
                placeholder="Confirm password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-accent" 
              style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '10px', borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '0.95rem' }}>
              We've sent a 6-digit OTP code to your WhatsApp number: <strong style={{ color: '#203A5F' }}>{formData.mobile}</strong>. Please enter it below.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '30px 0' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '50px', height: '60px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold',
                    border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', background: 'white',
                    color: '#203A5F'
                  }}
                  required
                />
              ))}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', justifyContent: 'center', borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Verify OTP & Proceed'}
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)}
              style={{
                background: 'none', border: 'none', color: '#203A5F', cursor: 'pointer',
                display: 'block', margin: '20px auto 0', fontWeight: '600', fontSize: '0.9rem'
              }}
            >
              <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i>
              Change Registration Details
            </button>
          </form>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px', fontSize: '0.9rem' }}>
            <span style={{ color: '#666' }}>Already have an account?</span>
            <Link to="/login" style={{ color: '#D4A047', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default SignUp;
