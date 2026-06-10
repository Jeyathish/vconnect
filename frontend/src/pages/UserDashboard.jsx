import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function UserDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Edit fields state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    designation: '',
    company_name: '',
    alter_mobile: '',
    land_line: '',
    email: '',
    alter_email: '',
    website: '',
    address: '',
    notes: '',
    description: '',
    template: '1'
  });

  const [profileImg, setProfileImg] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [profileImgPreview, setProfileImgPreview] = useState(null);
  const [backgroundImgPreview, setBackgroundImgPreview] = useState(null);

  // Mobile Change verification states
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/profiles/${user.profile_id}`);
      if (res.data && res.data.profile) {
        const p = res.data.profile;
        setProfile(p);
        setFormData({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          mobile: p.mobile || '',
          designation: p.designation || '',
          company_name: p.company_name || '',
          alter_mobile: p.alter_mobile || '',
          land_line: p.land_line || '',
          email: p.email || '',
          alter_email: p.alter_email || '',
          website: p.website || '',
          address: p.address || '',
          notes: p.notes || '',
          description: p.description || '',
          template: p.template || '1'
        });
        setProfileImgPreview(`/${p.profile_img}`);
        setBackgroundImgPreview(`/${p.background}`);
      }
    } catch (err) {
      setError('Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') {
        setProfileImg(file);
        setProfileImgPreview(reader.result);
      } else {
        setBackgroundImg(file);
        setBackgroundImgPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e, forceOtp = '') => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    const updatePayload = new FormData();
    if (profileImg) updatePayload.append('profile_img_input', profileImg);
    if (backgroundImg) updatePayload.append('background_img_input', backgroundImg);

    Object.keys(formData).forEach(key => {
      updatePayload.append(key, formData[key]);
    });

    if (forceOtp) {
      updatePayload.append('otp', forceOtp);
    }

    try {
      const res = await axios.put(`/api/profiles/${user.profile_id}`, updatePayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data) {
        if (res.data.requireOtp) {
          setOtpRequired(true);
          setSuccess(res.data.message);
        } else if (res.data.success) {
          setSuccess('Profile updated successfully!');
          setOtpRequired(false);
          setOtpCode('');
          setProfileImg(null);
          setBackgroundImg(null);
          fetchProfile();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError('Please enter verification OTP code.');
      return;
    }
    handleUpdate(null, otpCode);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--gradient-start) 100%)', color: 'white', minHeight: '100vh', paddingBottom: '60px', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="nav-logo">VConnect</Link>
          
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          {/* Desktop navbar options */}
          <div className="nav-menu-desktop" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to={`/profile/${user.profile_id}`} style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>View My Card</Link>
            <button onClick={handleLogout} className="btn btn-outline" style={{ color: '#ff6b6b', borderColor: '#ff6b6b', padding: '6px 16px' }}>Logout</button>
          </div>

          {/* Mobile Navigation Drawer */}
          <div className={`nav-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}></div>
          
          <div className={`nav-menu-mobile ${menuOpen ? 'open' : ''}`}>
            <span style={{ fontWeight: 'bold', color: '#F2C87E', fontSize: '1.2rem', marginBottom: '10px' }}>Menu</span>
            <Link to={`/profile/${user.profile_id}`} onClick={() => setMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontWeight: '500', padding: '10px 0' }}>View My Card</Link>
            <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }} />
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-outline" style={{ justifyContent: 'center', color: '#ff6b6b', borderColor: '#ff6b6b', width: '100%' }}>Logout</button>
          </div>

        </div>
      </nav>

      <div className="container" style={{ maxWidth: '800px', padding: '0 15px', marginTop: '30px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>Profile Dashboard</h1>
          <Link to={`/profile/${user.profile_id}`} className="btn btn-accent">
            <i className="fas fa-eye"></i> View Live Card
          </Link>
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

        {success && (
          <div style={{
            background: 'rgba(39, 174, 96, 0.1)', borderLeft: '4px solid #27ae60',
            color: '#27ae60', padding: '12px 16px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.9rem'
          }}>
            <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
            {success}
          </div>
        )}

        {/* Mobile change verification sub-card */}
        {otpRequired && (
          <div className="glass-card" style={{ marginBottom: '30px', borderColor: '#f39c12', background: 'rgba(243, 156, 18, 0.05)', padding: '25px' }}>
            <h3 style={{ color: '#F2C87E', marginBottom: '15px' }}>Verify Mobile Number Change</h3>
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label htmlFor="otpCode">Enter 6-digit WhatsApp OTP sent to {formData.mobile}</label>
                <input 
                  type="text" 
                  id="otpCode" 
                  className="form-input" 
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                <button type="submit" className="btn btn-accent" disabled={updating}>
                  {updating ? 'Verifying...' : 'Verify & Update'}
                </button>
                <button type="button" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }} onClick={() => { setOtpRequired(false); setOtpCode(''); }}>
                  Cancel Change
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
          <form onSubmit={(e) => handleUpdate(e)}>
            
            {/* Template select */}
            <div className="form-group">
              <label>Pick Theme Template</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginTop: '10px' }}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div 
                    key={num}
                    onClick={() => setFormData({ ...formData, template: num.toString() })}
                    className={`theme-${num}`}
                    style={{
                      height: '55px', borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold',
                      border: formData.template === num.toString() ? '3px solid white' : '3px solid transparent',
                      background: 'var(--theme-gradient)', color: 'white', fontSize: '0.85rem'
                    }}
                  >
                    Theme {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Images previews layout */}
            <div className="form-row-2" style={{ marginBottom: '25px' }}>
              <div className="form-group">
                <label>Change Profile Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} style={{ width: '100%', overflow: 'hidden' }} />
                {profileImgPreview && <img src={profileImgPreview} alt="prev" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px', border: '2px solid white' }} />}
              </div>
              <div className="form-group">
                <label>Change Background Banner</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'background')} style={{ width: '100%', overflow: 'hidden' }} />
                {backgroundImgPreview && <img src={backgroundImgPreview} alt="prev" style={{ width: '120px', height: '70px', borderRadius: '6px', objectFit: 'cover', marginTop: '10px', border: '2px solid white' }} />}
              </div>
            </div>

            {/* General Fields */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input type="text" id="first_name" className="form-input" value={formData.first_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input type="text" id="last_name" className="form-input" value={formData.last_name} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number (Requires Verification OTP if changed)</label>
              <input type="text" id="mobile" className="form-input" maxLength={10} value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })} required />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <input type="text" id="designation" className="form-input" value={formData.designation} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="company_name">Company Name</label>
                <input type="text" id="company_name" className="form-input" value={formData.company_name} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" className="form-input" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="alter_email">Alternative Email</label>
                <input type="email" id="alter_email" className="form-input" value={formData.alter_email} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="alter_mobile">Alternative Mobile</label>
                <input type="text" id="alter_mobile" className="form-input" maxLength={10} value={formData.alter_mobile} onChange={(e) => setFormData({ ...formData, alter_mobile: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div className="form-group">
                <label htmlFor="land_line">Land Line</label>
                <input type="text" id="land_line" className="form-input" value={formData.land_line} onChange={(e) => setFormData({ ...formData, land_line: e.target.value.replace(/\D/g, '') })} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="website">Website Link</label>
              <input type="url" id="website" className="form-input" value={formData.website} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label htmlFor="address">Office Address</label>
              <textarea id="address" className="form-input" value={formData.address} onChange={handleInputChange} style={{ minHeight: '80px' }}></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="description">Short Bio / Description</label>
              <textarea id="description" className="form-input" value={formData.description} onChange={handleInputChange} style={{ minHeight: '80px' }}></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-accent" 
              style={{ width: '100%', padding: '14px', justifyContent: 'center', borderRadius: '8px' }}
              disabled={updating}
            >
              {updating ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Save Profile Changes'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default UserDashboard;
