import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CompleteProfile() {
  const navigate = useNavigate();
  
  // Fields
  const [profileData, setProfileData] = useState({
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

  // Previews
  const [profileImgPreview, setProfileImgPreview] = useState(null);
  const [backgroundImgPreview, setBackgroundImgPreview] = useState(null);

  // States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.id]: e.target.value
    });
  };

  const handleTemplateSelect = (val) => {
    setProfileData({
      ...profileData,
      template: val
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Images must be JPG, PNG, or GIF format');
      return;
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!profileImg) {
      setError('Profile image is required');
      return;
    }
    if (!backgroundImg) {
      setError('Background image is required');
      return;
    }

    if (!profileData.email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.com$/.test(profileData.email)) {
      setError('Email must be valid and end with @email.com');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('profile_img_input', profileImg);
    formData.append('background_img_input', backgroundImg);
    
    Object.keys(profileData).forEach(key => {
      formData.append(key, profileData[key]);
    });

    try {
      const res = await axios.post('/api/profiles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete profile. Check fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--gradient-start) 100%)',
      minHeight: '100vh', padding: 'clamp(20px, 6vw, 60px) clamp(10px, 3vw, 20px)', color: 'white', overflowX: 'hidden'
    }}>
      <div className="container" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Dynamic preview */}
        <div style={{ flex: '1', minWidth: '280px', position: 'sticky', top: '40px', height: 'fit-content', width: '100%' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', color: '#F2C87E', marginBottom: '20px', textAlign: 'center' }}>Realtime Preview</h2>
          
          <div className={`theme-${profileData.template}`} style={{
            background: 'white', borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', color: 'var(--theme-primary, #333)',
            width: '100%', maxWidth: '380px', margin: '0 auto'
          }}>
            {/* Header Banner */}
            <div style={{ height: 'clamp(100px, 20vw, 130px)', position: 'relative', background: backgroundImgPreview ? 'none' : 'var(--theme-gradient)' }}>
              {backgroundImgPreview && <img src={backgroundImgPreview} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              
              {/* Profile Avatar */}
              <div style={{
                position: 'absolute', bottom: 'calc(-1 * clamp(35px, 8vw, 45px))', left: '50%', transform: 'translateX(-50%)',
                width: 'clamp(70px, 16vw, 90px)', height: 'clamp(70px, 16vw, 90px)', borderRadius: '50%', border: '3px solid white',
                overflow: 'hidden', background: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                {profileImgPreview ? (
                  <img src={profileImgPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="fas fa-user" style={{ fontSize: '2rem', color: '#888' }}></i>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div style={{ padding: 'calc(clamp(35px, 8vw, 45px) + 15px) 15px 25px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--theme-primary)', marginBottom: '5px' }}>Your Name</h3>
              <p style={{ color: 'var(--theme-secondary)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '15px' }}>
                {profileData.designation || 'DESIGNATION'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#666', background: 'var(--theme-accent)', padding: '5px 10px', borderRadius: '6px', display: 'inline-block' }}>
                {profileData.company_name || 'Company Name'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{ flex: '1.5', minWidth: '280px', width: '100%' }}>
          <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
            
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: '#F2C87E', marginBottom: '8px' }}>Complete Profile</h1>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Fill in the details for your smart business card</p>
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
              
              {/* Template Selection */}
              <div className="form-group">
                <label>Select Card Theme Template *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <div 
                      key={num}
                      onClick={() => handleTemplateSelect(num.toString())}
                      className={`theme-${num}`}
                      style={{
                        height: '55px', borderRadius: '8px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold',
                        border: profileData.template === num.toString() ? '3px solid white' : '3px solid transparent',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)', background: 'var(--theme-gradient)', color: 'white', fontSize: '0.85rem'
                      }}
                    >
                      Theme {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploads */}
              <div className="form-row-2" style={{ marginBottom: '25px' }}>
                <div className="form-group">
                  <label htmlFor="profile_img_input">Profile Image *</label>
                  <input 
                    type="file" 
                    id="profile_img_input" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profile')}
                    style={{ width: '100%', overflow: 'hidden' }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="background_img_input">Background Image *</label>
                  <input 
                    type="file" 
                    id="background_img_input" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'background')}
                    style={{ width: '100%', overflow: 'hidden' }}
                    required
                  />
                </div>
              </div>

              {/* Professional Fields */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="designation">Designation</label>
                  <input type="text" id="designation" className="form-input" placeholder="e.g. Sales Director" value={profileData.designation} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="company_name">Company Name</label>
                  <input type="text" id="company_name" className="form-input" placeholder="e.g. Acme Corp" value={profileData.company_name} onChange={handleInputChange} />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" className="form-input" placeholder="john@email.com" value={profileData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="alter_email">Alternative Email</label>
                  <input type="email" id="alter_email" className="form-input" placeholder="john.alt@email.com" value={profileData.alter_email} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="alter_mobile">Alternative Mobile</label>
                  <input type="text" id="alter_mobile" className="form-input" placeholder="10-digit number" maxLength={10} value={profileData.alter_mobile} onChange={(e) => setProfileData({ ...profileData, alter_mobile: e.target.value.replace(/\D/g, '') })} />
                </div>
                <div className="form-group">
                  <label htmlFor="land_line">Land Line</label>
                  <input type="text" id="land_line" className="form-input" placeholder="e.g. 044123456" value={profileData.land_line} onChange={(e) => setProfileData({ ...profileData, land_line: e.target.value.replace(/\D/g, '') })} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="website">Website Link</label>
                <input type="url" id="website" className="form-input" placeholder="https://website.com" value={profileData.website} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label htmlFor="address">Office Address</label>
                <textarea id="address" className="form-input" placeholder="Enter your full address" value={profileData.address} onChange={handleInputChange} style={{ minHeight: '80px' }}></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="description">Short Bio / Description</label>
                <textarea id="description" className="form-input" placeholder="Tell visitors about yourself" value={profileData.description} onChange={handleInputChange} style={{ minHeight: '80px' }}></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-accent" 
                style={{ width: '100%', padding: '15px', justifyContent: 'center', borderRadius: '12px' }}
                disabled={loading}
              >
                {loading ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Save & Generate NFC Profile'}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CompleteProfile;
