import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProfileCard() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrGenerating, setQrGenerating] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/profiles/${id}`);
      if (res.data) {
        setProfile(res.data.profile);
        setIsOwner(res.data.isOwner);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Profile not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleGenerateQR = async () => {
    setQrGenerating(true);
    try {
      const res = await axios.post(`/api/profiles/${id}/qr`);
      if (res.data && res.data.success) {
        setProfile(prev => ({
          ...prev,
          qr_image: res.data.qr_image,
          qr_status: 1
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate QR Code.');
    } finally {
      setQrGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (!profile || !profile.qr_image) return;
    const link = document.createElement('a');
    link.href = `/${profile.qr_image}`;
    link.download = `qr_code_${profile.profile_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToContacts = () => {
    if (!profile) return;
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.first_name} ${profile.last_name || ''}
ORG:${profile.company_name || ''}
TITLE:${profile.designation || ''}
TEL;TYPE=CELL:${profile.mobile}
TEL;TYPE=WORK,VOICE:${profile.land_line || ''}
EMAIL;TYPE=PREF,INTERNET:${profile.email}
URL:${profile.website || ''}
ADR;TYPE=WORK:;;${profile.address || ''};;;;
NOTE:${profile.description || ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.first_name}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #203A5F 0%, #152642 100%)',
        minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', padding: '20px'
      }}>
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '3.5rem', color: '#F2C87E', marginBottom: '20px' }}></i>
          <h3>Profile Not Found</h3>
          <p style={{ color: '#D7D7D7', marginTop: '10px' }}>The requested digital profile card does not exist.</p>
          <Link to="/" className="btn btn-accent" style={{ marginTop: '30px', width: '100%', justifyContent: 'center' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--gradient-start) 100%)',
      minHeight: '100vh', padding: 'clamp(20px, 6vw, 60px) clamp(10px, 3vw, 20px)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden'
    }}>
      
      {/* Profile Card Container */}
      <div className={`theme-${profile.template}`} style={{
        background: 'white', borderRadius: '25px', overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)', color: 'var(--theme-primary, #333)',
        width: '100%', maxWidth: '450px', animation: 'fadeInUp 0.6s ease-out'
      }}>
        
        {/* Banner with background image */}
        <div style={{ height: 'clamp(130px, 28vw, 180px)', position: 'relative' }}>
          <img 
            src={`/${profile.background}`} 
            alt="background" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} 
          />
          
          {/* Avatar placement */}
          <div style={{
            position: 'absolute', bottom: 'calc(-1 * clamp(45px, 10vw, 55px))', left: '50%', transform: 'translateX(-50%)',
            width: 'clamp(90px, 20vw, 110px)', height: 'clamp(90px, 20vw, 110px)', borderRadius: '50%', border: '4px solid white',
            overflow: 'hidden', background: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <img 
              src={`/${profile.profile_img}`} 
              alt="avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>

        {/* Profile Details Content */}
        <div style={{ padding: 'calc(clamp(45px, 10vw, 55px) + 20px) clamp(15px, 5vw, 30px) 30px', textAlign: 'center' }}>
          
          <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.75rem)', color: 'var(--theme-primary)', fontWeight: '700', marginBottom: '8px' }}>
            {profile.first_name} {profile.last_name || ''}
          </h2>
          
          <p style={{
            fontSize: 'clamp(0.9rem, 3vw, 1.05rem)', color: 'var(--theme-secondary)', fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px'
          }}>
            {profile.designation || 'Smart User'}
          </p>

          {profile.company_name && (
            <p style={{
              fontSize: '0.9rem', color: '#666', background: 'var(--theme-accent)',
              padding: '8px 16px', borderRadius: '8px', display: 'inline-block', marginBottom: '25px'
            }}>
              <i className="fas fa-building" style={{ marginRight: '8px', color: 'var(--theme-secondary)' }}></i>
              {profile.company_name}
            </p>
          )}

          {profile.description && (
            <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.6', marginBottom: '30px', padding: '0 5px' }}>
              {profile.description}
            </p>
          )}

          {/* Contact Details List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', marginBottom: '35px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fcfcfc', padding: '10px 15px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
              <i className="fas fa-phone-alt" style={{ fontSize: '1.1rem', color: 'var(--theme-secondary)', width: '20px' }}></i>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', display: 'block' }}>Mobile</span>
                <a href={`tel:${profile.mobile}`} style={{ color: 'var(--theme-primary)', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>{profile.mobile}</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fcfcfc', padding: '10px 15px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
              <i className="fas fa-envelope" style={{ fontSize: '1.1rem', color: 'var(--theme-secondary)', width: '20px' }}></i>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', display: 'block' }}>Email</span>
                <a href={`mailto:${profile.email}`} style={{ color: 'var(--theme-primary)', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>{profile.email}</a>
              </div>
            </div>

            {profile.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fcfcfc', padding: '10px 15px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                <i className="fas fa-globe" style={{ fontSize: '1.1rem', color: 'var(--theme-secondary)', width: '20px' }}></i>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#888', display: 'block' }}>Website</span>
                  <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: 'var(--theme-primary)', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>{profile.website}</a>
                </div>
              </div>
            )}

            {profile.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fcfcfc', padding: '10px 15px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                <i className="fas fa-map-marker-alt" style={{ fontSize: '1.1rem', color: 'var(--theme-secondary)', width: '20px' }}></i>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#888', display: 'block' }}>Office Address</span>
                  <span style={{ color: 'var(--theme-primary)', fontWeight: '500', fontSize: '0.9rem' }}>{profile.address}</span>
                </div>
              </div>
            )}

          </div>

          {/* Action Button */}
          <button 
            onClick={handleAddToContacts}
            className="btn" 
            style={{
              width: '100%', padding: '15px', justifyContent: 'center', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
              color: 'white', fontWeight: 'bold'
            }}
          >
            <i className="fas fa-user-plus"></i> Save Contact Card
          </button>

        </div>
      </div>

      {/* Owner controls panel */}
      {isOwner && (
        <div style={{
          marginTop: '30px', width: '100%', maxWidth: '450px', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', padding: '25px', borderRadius: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.2rem', color: '#F2C87E', marginBottom: '20px' }}>Owner Controls</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {profile.qr_status === 1 && profile.qr_image ? (
              <div style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'inline-block', margin: '0 auto 10px', width: '100%', maxWidth: '210px' }}>
                <img src={`/${profile.qr_image}`} alt="QR" style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
                <button 
                  onClick={handleDownloadQR}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '8px 10px', fontSize: '0.85rem' }}
                >
                  <i className="fas fa-download"></i> Download QR
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGenerateQR}
                className="btn btn-accent" 
                style={{ justifyContent: 'center' }}
                disabled={qrGenerating}
              >
                {qrGenerating ? 'Generating...' : 'Generate Profile QR Code'}
              </button>
            )}

            <Link to="/dashboard" className="btn btn-outline" style={{ justifyContent: 'center', color: 'white', borderColor: 'white' }}>
              <i className="fas fa-edit"></i> Edit Profile Fields
            </Link>

          </div>
        </div>
      )}

    </div>
  );
}

export default ProfileCard;
