import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function LandingPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Track page visit on load
  useEffect(() => {
    axios.get('/api/track-visit').catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="page-transition" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--gradient-start) 100%)', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span className="nav-logo">VConnect</span>
          </Link>

          {/* Nav Toggle Hamburger */}
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          {/* Desktop Nav Links */}
          <div className="nav-menu-desktop" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <a href="#home" className="nav-link">Home</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            
            {user ? (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    background: 'rgba(212, 160, 71, 0.1)', border: '1px solid rgba(212, 160, 71, 0.3)',
                    color: 'white', padding: '8px 16px', borderRadius: '50px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: '#D4A047',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#203A5F', fontWeight: 'bold'
                  }}>
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', right: 0, marginTop: '8px', width: '180px',
                    background: '#203A5F', border: '1px solid rgba(212, 160, 71, 0.3)',
                    borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                  }}>
                    <Link to="/dashboard" style={{ display: 'block', padding: '12px 20px', color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                    <Link to={`/profile/${user.profile_id}`} style={{ display: 'block', padding: '12px 20px', color: 'white', textDecoration: 'none' }}>View Card</Link>
                    <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-accent" style={{ padding: '8px 24px', borderRadius: '8px' }}>
                Login
              </Link>
            )}
          </div>

          {/* Mobile Navigation Drawer */}
          <div className={`nav-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}></div>
          
          <div className={`nav-menu-mobile ${menuOpen ? 'open' : ''}`}>
            <a href="#home" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.2rem', padding: '10px 0' }}>Home</a>
            <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.2rem', padding: '10px 0' }}>About</a>
            <a href="#pricing" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.2rem', padding: '10px 0' }}>Pricing</a>
            <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '15px 0' }} />
            
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Link to="/dashboard" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>Dashboard</Link>
                <Link to={`/profile/${user.profile_id}`} className="btn btn-accent" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>View Card</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-outline" style={{ justifyContent: 'center', color: '#ff6b6b', borderColor: '#ff6b6b' }}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-accent" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>
                Login
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={{ padding: 'clamp(50px, 8vh, 100px) 0 clamp(40px, 6vh, 80px)' }}>
        <div className="container flex-responsive flex-responsive-row" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '30px' }}>
          
          <div style={{ flex: '1', minWidth: '280px' }}>
            <h1 className="fluid-title" style={{ marginBottom: '20px', color: '#F2C87E' }}>
              One Tap. Infinite Connections.
            </h1>
            <p className="fluid-text" style={{ color: '#D7D7D7', marginBottom: '40px' }}>
              Your digital business identity is just a tap away. Share contact info, portfolios, social media, and more with our custom NFC smart cards.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              <Link to="/signup" className="btn btn-accent" style={{ padding: '14px 30px', borderRadius: '10px' }}>
                Create Smart QR
              </Link>
              <a href="#pricing" className="btn btn-outline" style={{ padding: '14px 30px', borderRadius: '10px', color: 'white', borderColor: 'white' }}>
                View Plans
              </a>
            </div>
          </div>

          {/* 3D NFC Card Showcase */}
          <div style={{ flex: '1', minWidth: '280px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{
              width: '100%', maxWidth: '350px', aspectRatio: '1.6 / 1',
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              borderRadius: '16px', padding: '6%', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', boxShadow: '0 20px 45px rgba(0,0,0,0.4)',
              animation: 'float 4s ease-in-out infinite', transform: 'rotate(-4deg) rotateX(8deg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '32px', background: 'linear-gradient(45deg, #c9c9c9, #f0f0f0)', borderRadius: '6px' }}></div>
                <span style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 'bold', color: '#111827' }}>VConnect</span>
              </div>
              <div style={{ fontSize: 'clamp(1.1rem, 3.2vw, 1.4rem)', fontFamily: 'monospace', letterSpacing: '3px', color: '#111827', textAlign: 'center' }}>
                **** **** **** 8888
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#111827', fontWeight: '600', fontSize: 'clamp(0.7rem, 2vw, 0.85rem)' }}>
                <span>VCONNECT.COM</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ padding: '80px 0', background: 'rgba(0,0,0,0.15)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 className="section-title" style={{ marginBottom: '20px' }}>About VConnect</h2>
          <p className="fluid-text" style={{ color: '#D7D7D7' }}>
            Traditional business cards are outdated, easily lost, and hard to update. VConnect digital business cards put all your professional details on a single tap. Using NFC technology, anyone can scan or tap your card to view your custom landing page, download contact cards, view portfolio links, and save your number instantly. No app required!
          </p>
        </div>
      </section>

      {/* Showcase Templates */}
      <section id="templates" style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>Choose Premium Layouts</h2>
          <div className="grid-responsive-cards">
            
            <div style={{ background: '#1A365D', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '15px' }}>Executive Blue</h3>
              <p style={{ color: '#D7D7D7', fontSize: '0.95rem', lineHeight: '1.5' }}>Professional and elegant style suited for corporate users.</p>
            </div>

            <div style={{ background: '#065F46', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '15px' }}>Corporate Emerald</h3>
              <p style={{ color: '#D7D7D7', fontSize: '0.95rem', lineHeight: '1.5' }}>Fresh and organic emerald style for modern teams.</p>
            </div>

            <div style={{ background: '#7B4B11', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '15px' }}>Luxury Gold</h3>
              <p style={{ color: '#D7D7D7', fontSize: '0.95rem', lineHeight: '1.5' }}>Premium gold details for premium customer networking.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 0', background: 'rgba(0,0,0,0.15)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>Flexible Smart Plans</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', width: '100%' }}>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)', padding: '40px 30px', borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: '340px', textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Classic</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34D399', margin: '20px 0' }}>₹999 <span style={{ fontSize: '1rem', color: '#D7D7D7' }}>/ One-time</span></div>
              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '30px', color: '#D7D7D7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><i className="fas fa-check" style={{ color: '#27ae60', marginRight: '8px' }}></i> 1 Matte Finish Smart Card</li>
                <li><i className="fas fa-check" style={{ color: '#27ae60', marginRight: '8px' }}></i> 1 Custom Digital Profile</li>
                <li><i className="fas fa-check" style={{ color: '#27ae60', marginRight: '8px' }}></i> Unlimited Taps & Edits</li>
                <li><i className="fas fa-check" style={{ color: '#27ae60', marginRight: '8px' }}></i> QR Code Integration</li>
              </ul>
              <Link to="/signup" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)', padding: '40px 30px', borderRadius: '20px',
              border: '2px solid #10B981', width: '100%', maxWidth: '340px', textAlign: 'center'
            }}>
              <div style={{ background: '#10B981', color: '#111827', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Premium Wooden</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34D399', margin: '20px 0' }}>₹1,499 <span style={{ fontSize: '1rem', color: '#D7D7D7' }}>/ One-time</span></div>
              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '30px', color: '#D7D7D7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><i className="fas fa-check" style={{ color: '#27ae60', marginRight: '8px' }}></i> 1 Organic Bamboo Smart Card</li>
                <li><i className="fas fa-check" style={{ color: '#27ae60', marginRight: '8px' }}></i> Custom Logo Engraving</li>
                <li><i className="fas fa-check" style={{ color: '#27ae60', marginRight: '8px' }}></i> Dedicated Portfolio Link</li>
                <li><i className="fas fa-check" style={{ color: '#27ae60', marginRight: '8px' }}></i> 24/7 Priority Support</li>
              </ul>
              <Link to="/signup" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>Order Wooden Card</Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', color: '#D7D7D7' }}>
        <p>&copy; 2026 VConnect. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default LandingPage;
