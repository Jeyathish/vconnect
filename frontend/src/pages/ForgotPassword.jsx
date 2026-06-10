import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const navigate = useNavigate();
  
  // Wizard steps: 1 = Mobile Input, 2 = OTP Input, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState(1);
  
  // Form states
  const [mobile, setMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mobile) {
      setError('Please enter your mobile number');
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password/send-otp', { mobile });
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification code.');
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

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password/verify-otp', {
        mobile,
        otp
      });
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password/reset', {
        mobile,
        password,
        confirm_password: confirmPassword
      });
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setStep(4);
        setTimeout(() => {
          navigate('/login');
        }, 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--gradient-start) 100%)',
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '500px', animation: 'fadeInUp 0.6s ease-out', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary-color)', marginBottom: '8px' }}>Reset Password</h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            {step === 1 && 'Step 1: Enter your registered mobile'}
            {step === 2 && 'Step 2: Verify WhatsApp OTP'}
            {step === 3 && 'Step 3: Choose your new password'}
            {step === 4 && 'Reset Complete! Redirecting...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #10B981, #34D399)',
            width: `${(step / 4) * 100}%`,
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

        {success && step !== 4 && (
          <div style={{
            background: 'rgba(39, 174, 96, 0.1)', borderLeft: '4px solid #27ae60',
            color: '#27ae60', padding: '12px 16px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.9rem'
          }}>
            <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
            {success}
          </div>
        )}

        {/* Step 1: Input Mobile */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-mobile-alt" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#203A5F' }}></i>
                <input 
                  type="text" 
                  id="mobile" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>We'll send a 6-digit verification code to your WhatsApp</small>
            </div>

            <button 
              type="submit" 
              className="btn btn-accent" 
              style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '10px', borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Request Reset Link'}
            </button>

            <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: '#203A5F', textDecoration: 'none', fontWeight: '600' }}>
              <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> Back to Login
            </Link>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
              Enter the 6-digit OTP code sent to your WhatsApp number <strong style={{ color: '#203A5F' }}>{mobile}</strong>:
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
                    width: '45px', height: '55px', textAlign: 'center', fontSize: '22px', fontWeight: 'bold',
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
              {loading ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Verify OTP'}
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)}
              style={{
                background: 'none', border: 'none', color: '#203A5F', cursor: 'pointer',
                display: 'block', margin: '20px auto 0', fontWeight: '600', fontSize: '0.9rem'
              }}
            >
              <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i> Change Mobile Number
            </button>
          </form>
        )}

        {/* Step 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                className="form-input" 
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', justifyContent: 'center', borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Step 4: Success Message */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#10B981',
              display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white',
              fontSize: '2.5rem', margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
            }}>
              <i className="fas fa-check"></i>
            </div>
            <h3 style={{ color: '#10B981', marginBottom: '15px' }}>Password Reset Successful!</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Your password has been updated. You will be redirected to the login page shortly, or click below.
            </p>
            <Link to="/login" className="btn btn-accent" style={{ display: 'inline-flex', marginTop: '25px', padding: '10px 25px', borderRadius: '8px' }}>
              Go to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;
