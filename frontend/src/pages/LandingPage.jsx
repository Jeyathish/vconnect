import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Animated Counter helper component
function AnimatedCounter({ end, duration = 1500, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function LandingPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    axios.get('/api/track-visit').catch(() => {});

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.08 });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
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
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#why-recruiters" className="nav-link">For Recruiters</a>
            <a href="#preview" className="nav-link">Live Preview</a>
            
            {user ? (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'white', padding: '8px 16px', borderRadius: '50px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary-color)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#111827', fontWeight: 'bold'
                  }}>
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', right: 0, marginTop: '8px', width: '180px',
                    background: '#1F2937', border: '1px solid #374151',
                    borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 1100
                  }}>
                    <Link to="/dashboard" style={{ display: 'block', padding: '12px 20px', color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                    <Link to={`/profile/${user.profile_id}`} style={{ display: 'block', padding: '12px 20px', color: 'white', textDecoration: 'none' }}>View Profile</Link>
                    <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-accent" style={{ padding: '8px 24px', borderRadius: '10px' }}>
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Navigation Drawer */}
          <div className={`nav-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}></div>
          
          <div className={`nav-menu-mobile ${menuOpen ? 'open' : ''}`}>
            <a href="#home" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.2rem', padding: '10px 0' }}>Home</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.2rem', padding: '10px 0' }}>How It Works</a>
            <a href="#why-recruiters" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.2rem', padding: '10px 0' }}>For Recruiters</a>
            <a href="#preview" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.2rem', padding: '10px 0' }}>Live Preview</a>
            <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '15px 0' }} />
            
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Link to="/dashboard" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>Dashboard</Link>
                <Link to={`/profile/${user.profile_id}`} className="btn btn-accent" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>View Profile</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-outline" style={{ justifyContent: 'center', color: '#ff6b6b', borderColor: '#ff6b6b' }}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-accent" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>
                Sign In
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* 1. Hero Section */}
      <section id="home" style={{ padding: 'clamp(40px, 6vh, 80px) 0 clamp(30px, 4vh, 60px)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          
          <div className="animate-on-scroll active" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: 'var(--highlight-color)', padding: '6px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px' }}>
              <i className="fas fa-qrcode"></i> Instantly Share Your Professional Identity
            </div>
            <h1 className="fluid-title" style={{ marginBottom: '20px', color: '#FFFFFF', fontWeight: '800' }}>
              One Scan. <span style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--highlight-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Infinite Connections.</span>
            </h1>
            <p className="fluid-text" style={{ color: 'var(--text-light)', marginBottom: '35px', maxWidth: '750px', margin: '0 auto 35px', lineHeight: '1.6' }}>
              Create your unified professional profile, enter your details, and generate a unique QR code. Recruiters and hiring teams scan to view your professional identity instantly in a single scan.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginBottom: '50px' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 30px', borderRadius: '10px' }}>
                Create Your Profile
              </Link>
              <a href="#how-it-works" className="btn btn-outline" style={{ padding: '14px 30px', borderRadius: '10px', color: 'white', borderColor: '#374151' }}>
                Explore How It Works
              </a>
            </div>
          </div>

          {/* Workflow Diagram above the fold */}
          <div className="animate-on-scroll active" style={{
            background: 'rgba(31, 41, 55, 0.5)', border: '1px solid #374151', borderRadius: '20px',
            padding: '30px 20px', boxShadow: 'var(--shadow-md)'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--highlight-color)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '25px', fontWeight: '700' }}>
              Visual Workflow Diagram
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: '20px' }}>
              
              <div style={{ flex: '1', minWidth: '110px', textAlign: 'center' }}>
                <div style={{ width: '45px', height: '45px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 10px', fontSize: '1.1rem' }}>
                  <i className="fas fa-user-plus"></i>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Create Profile</span>
              </div>
              <i className="fas fa-chevron-right" style={{ color: '#374151', display: 'none', '@media (min-width: 576px)': { display: 'block' } }}></i>
              
              <div style={{ flex: '1', minWidth: '110px', textAlign: 'center' }}>
                <div style={{ width: '45px', height: '45px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 10px', fontSize: '1.1rem' }}>
                  <i className="fas fa-file-invoice"></i>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Add Details</span>
              </div>
              
              <div style={{ flex: '1', minWidth: '110px', textAlign: 'center' }}>
                <div style={{ width: '45px', height: '45px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 10px', fontSize: '1.1rem' }}>
                  <i className="fas fa-qrcode"></i>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Generate QR</span>
              </div>
              
              <div style={{ flex: '1', minWidth: '110px', textAlign: 'center' }}>
                <div style={{ width: '45px', height: '45px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 10px', fontSize: '1.1rem' }}>
                  <i className="fas fa-share-nodes"></i>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Share QR</span>
              </div>
              
              <div style={{ flex: '1', minWidth: '110px', textAlign: 'center' }}>
                <div style={{ width: '45px', height: '45px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 10px', fontSize: '1.1rem' }}>
                  <i className="fas fa-eye"></i>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>View Profile</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. Project Overview Section */}
      <section style={{ padding: '60px 0', background: 'rgba(31, 41, 55, 0.25)', borderTop: '1px solid #1F2937', borderBottom: '1px solid #1F2937' }}>
        <div className="container" style={{ maxWidth: '950px' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '15px' }}>Project Overview</h2>
            <p style={{ fontSize: '1.1rem', color: '#D7D7D7', maxWidth: '850px', margin: '0 auto', lineHeight: '1.6' }}>
              VConnect is a QR-powered professional profile sharing platform that allows users to create a public profile, generate a unique QR code, and instantly share their professional information with recruiters, clients, colleagues, and connections.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '20px', marginTop: '30px' }}>
            {[
              { title: 'Profile Creation', desc: 'Secure web setup of your detailed resume information.', icon: 'fa-user-gear' },
              { title: 'QR Generation', desc: 'Instant creation of high-definition, unique scan codes.', icon: 'fa-qrcode' },
              { title: 'Public Profile Sharing', desc: 'Instant browser access for connections. No app download needed.', icon: 'fa-globe' },
              { title: 'Social Links', desc: 'Centralized Hub linking LinkedIn, GitHub, and portfolios.', icon: 'fa-share-nodes' },
              { title: 'Mobile Accessibility', desc: 'Fluid layout optimized for phones, tablets, and desktops.', icon: 'fa-mobile-screen' }
            ].map((item, idx) => (
              <div key={idx} className="hover-lift" style={{ background: '#1F2937', padding: '20px', borderRadius: '15px', border: '1px solid #374151', textAlign: 'center' }}>
                <i className={`fas ${item.icon}`} style={{ fontSize: '1.5rem', color: 'var(--secondary-color)', marginBottom: '12px' }}></i>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: '#FFFFFF' }}>{item.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.4' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Statistics Section */}
      {/* <section style={{ padding: '70px 0' }}>
        <div className="container" style={{ maxWidth: '950px' }}>
          <div className="animate-on-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '25px', textAlign: 'center' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary-color)', marginBottom: '8px' }}>
                <AnimatedCounter end={1250} suffix="+" />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>Professional Profiles</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--highlight-color)', marginBottom: '8px' }}>
                <AnimatedCounter end={1540} suffix="+" />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>QR Codes Generated</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary-color)', marginBottom: '8px' }}>
                <AnimatedCounter end={10} prefix="v" suffix="+" />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>Social Integrations</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--highlight-color)', marginBottom: '8px' }}>
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>Mobile Optimized</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary-color)', marginBottom: '8px' }}>
                <AnimatedCounter end={256} suffix="-bit" />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>Secure Authentication</div>
            </div>

          </div>
        </div>
      </section> */}

      {/* 4. How It Works Section */}
      <section id="how-it-works" style={{ padding: '80px 0', background: 'rgba(0,0,0,0.15)' }}>
        <div className="container">
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="section-title">How It Works</h2>
            <p style={{ color: 'var(--text-light)', marginTop: '10px' }}>Set up your profile and start sharing in four easy steps</p>
          </div>

          <div className="grid-responsive-cards stagger-container">
            
            <div className="hover-lift animate-on-scroll delay-100" style={{ background: '#1F2937', padding: '30px', borderRadius: '15px', border: '1px solid #374151', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '1.25rem', fontWeight: 'bold' }}>1</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Create Account</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.5' }}>Sign up using your mobile number and set a secure password in just 10 seconds.</p>
            </div>

            <div className="hover-lift animate-on-scroll delay-200" style={{ background: '#1F2937', padding: '30px', borderRadius: '15px', border: '1px solid #374151', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--highlight-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '1.25rem', fontWeight: 'bold' }}>2</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Add Professional Details</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.5' }}>Enter your bio, designation, work details, contact links, LinkedIn, GitHub, and portfolio URLs.</p>
            </div>

            <div className="hover-lift animate-on-scroll delay-300" style={{ background: '#1F2937', padding: '30px', borderRadius: '15px', border: '1px solid #374151', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '1.25rem', fontWeight: 'bold' }}>3</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Generate QR Code</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.5' }}>Get a personalized, high-resolution QR code mapped specifically to your digital profile details.</p>
            </div>

            <div className="hover-lift animate-on-scroll delay-400" style={{ background: '#1F2937', padding: '30px', borderRadius: '15px', border: '1px solid #374151', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--highlight-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '1.25rem', fontWeight: 'bold' }}>4</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Share and Connect</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.5' }}>Anyone can scan your QR code on their mobile to view your profile and save your contact info.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. "Who Is This For?" Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Who Is This For?</h2>
            <p style={{ color: 'var(--text-light)' }}>Dedicated profile sharing features built for professional growth</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Software Developers', desc: 'Centralize your GitHub, portfolio site, tech stack, and LinkedIn. Perfect for sharing your code and experience in one unified hub.', icon: 'fa-code' },
              { title: 'Job Seekers', desc: 'Present your professional summary, resume links, and contact channels to recruiters at events, career fairs, or interviews.', icon: 'fa-briefcase' },
              { title: 'Freelancers', desc: 'Share your work history, email, websites, and service portfolios with prospective clients instantly via a simple scan.', icon: 'fa-laptop-code' },
              { title: 'Business Professionals', desc: 'Network seamlessly at conferences and meetups without keeping track of paper trails. Scan and connect on the spot.', icon: 'fa-user-tie' },
              { title: 'Students', desc: 'Build your initial professional presence. Showcase class projects, academic highlights, and socials to future employers.', icon: 'fa-graduation-cap' }
            ].map((card, idx) => (
              <div key={idx} className="hover-lift animate-on-scroll" style={{ background: '#1F2937', padding: '25px', borderRadius: '15px', border: '1px solid #374151' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--highlight-color)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.1rem' }}>
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{card.title}</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-light)', lineHeight: '1.5' }}>{card.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. "Why Recruiters Like It" Section */}
      <section id="why-recruiters" style={{ padding: '80px 0', background: 'rgba(31, 41, 55, 0.25)', borderTop: '1px solid #1F2937', borderBottom: '1px solid #1F2937' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Why Recruiters & Hiring Teams Use VConnect</h2>
            <p style={{ color: 'var(--text-light)' }}>Accelerating the hiring review and connection workflow</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Faster Candidate Review', desc: 'Scan candidate QR codes during check-in or interviews to review their full credentials in under 10 seconds.', icon: 'fa-bolt' },
              { title: 'One-Click Profile Access', desc: 'No complex URLs or typing errors. Just tap/scan to open their verified public profile on any browser.', icon: 'fa-hand-pointer' },
              { title: 'Portfolio Visibility', desc: 'Immediate links to active code repos (GitHub), design assets, and active websites in a single interface.', icon: 'fa-images' },
              { title: 'Easy Contact Discovery', desc: 'Download contacts directly into your mobile Address Book with the built-in vCard contact exporter.', icon: 'fa-address-book' },
              { title: 'Mobile-Friendly Experience', desc: 'Candidates profiles are optimized for mobile viewports, making remote evaluation fast and seamless.', icon: 'fa-mobile-screen-button' }
            ].map((item, idx) => (
              <div key={idx} className="hover-lift animate-on-scroll" style={{ background: '#1F2937', padding: '25px', borderRadius: '15px', border: '1px solid #374151', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <i className={`fas ${item.icon}`} style={{ fontSize: '1.3rem', color: 'var(--secondary-color)', marginTop: '3px' }}></i>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: '1.4' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Professional Benefits Comparison Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Traditional Profile Sharing vs. VConnect</h2>
            <p style={{ color: 'var(--text-light)' }}>See how VConnect simplifies professional networking</p>
          </div>

          <div className="grid-2 animate-on-scroll" style={{ gap: '30px' }}>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '35px', borderRadius: '20px' }}>
              <h3 style={{ color: '#EF4444', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
                <i className="fas fa-circle-xmark"></i> Traditional Profile Sharing
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                  <i className="fas fa-ban" style={{ color: '#EF4444', marginTop: '3px' }}></i>
                  <span><strong>Multiple links to share:</strong> Sending separate links for LinkedIn, portfolio, and email is frustrating.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                  <i className="fas fa-ban" style={{ color: '#EF4444', marginTop: '3px' }}></i>
                  <span><strong>Information scattered:</strong> Mismatch between print resumes and digital profiles.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                  <i className="fas fa-ban" style={{ color: '#EF4444', marginTop: '3px' }}></i>
                  <span><strong>Hard to update:</strong> Requires printing new documents or emailing updated links to connections.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                  <i className="fas fa-ban" style={{ color: '#EF4444', marginTop: '3px' }}></i>
                  <span><strong>Poor mobile experience:</strong> Opening attachments or complex sites on smartphones crashes layout scales.</span>
                </li>
              </ul>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '35px', borderRadius: '20px' }}>
              <h3 style={{ color: 'var(--secondary-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
                <i className="fas fa-circle-check"></i> VConnect Profile Sharing
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                  <i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginTop: '3px' }}></i>
                  <span><strong>Single QR access:</strong> Scan once to review all links, experience, and contact forms.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                  <i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginTop: '3px' }}></i>
                  <span><strong>Centralized profile:</strong> A single, clean responsive interface representing your global identity.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                  <i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginTop: '3px' }}></i>
                  <span><strong>Instant updates:</strong> Change your details in the dashboard. The QR code stays the same.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                  <i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginTop: '3px' }}></i>
                  <span><strong>Mobile optimized:</strong> Fluid, lightweight design styled specifically for mobile screens.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 8. "Profile Information Supported" Section */}
      <section style={{ padding: '80px 0', background: 'rgba(0,0,0,0.15)' }}>
        <div className="container" style={{ maxWidth: '950px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Profile Information Supported</h2>
            <p style={{ color: 'var(--text-light)' }}>Supported fields you can enter and share instantly</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            <div className="hover-lift animate-on-scroll" style={{ background: '#1F2937', padding: '30px', borderRadius: '15px', border: '1px solid #374151' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--highlight-color)', marginBottom: '15px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>
                <i className="fas fa-user" style={{ marginRight: '8px' }}></i> Personal Information
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Full Name</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Primary Mobile Number</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Email Address</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Location / Office Address</li>
              </ul>
            </div>

            <div className="hover-lift animate-on-scroll" style={{ background: '#1F2937', padding: '30px', borderRadius: '15px', border: '1px solid #374151' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--highlight-color)', marginBottom: '15px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>
                <i className="fas fa-briefcase" style={{ marginRight: '8px' }}></i> Professional Information
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Job Title / Designation</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Company / Organization</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Bio & Skills Summary</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Work Experience Details</li>
              </ul>
            </div>

            <div className="hover-lift animate-on-scroll" style={{ background: '#1F2937', padding: '30px', borderRadius: '15px', border: '1px solid #374151' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--highlight-color)', marginBottom: '15px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>
                <i className="fas fa-share-nodes" style={{ marginRight: '8px' }}></i> Online Presence
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Website / Personal URL</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> Portfolio Link</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> LinkedIn Profile URL</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px', fontSize: '0.75rem' }}></i> GitHub Account Link</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Dashboard Preview Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '950px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Dashboard Preview</h2>
            <p style={{ color: 'var(--text-light)' }}>See the available dashboard features without logging in</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px' }}>
            
            <div className="hover-lift animate-on-scroll" style={{ background: '#1F2937', borderRadius: '15px', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ height: '100px', background: 'linear-gradient(135deg, #1F2937, #111827)', borderBottom: '1px solid #374151', padding: '15px', position: 'relative' }}>
                <span style={{ fontSize: '0.65rem', background: 'var(--secondary-color)', color: '#111827', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>USER VIEW</span>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>Dashboard Home</div>
              </div>
              <div style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>User Dashboard</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: '1.4' }}>Quick access to live link, statistics overview, and file managers.</p>
              </div>
            </div>

            <div className="hover-lift animate-on-scroll" style={{ background: '#1F2937', borderRadius: '15px', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ height: '100px', background: 'linear-gradient(135deg, #1F2937, #111827)', borderBottom: '1px solid #374151', padding: '15px', position: 'relative' }}>
                <span style={{ fontSize: '0.65rem', background: 'var(--secondary-color)', color: '#111827', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>EDITOR</span>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>Profile Form</div>
              </div>
              <div style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Profile Editor</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: '1.4' }}>Form modules to enter bio details, social URLs, avatars, and template theme selections.</p>
              </div>
            </div>

            <div className="hover-lift animate-on-scroll" style={{ background: '#1F2937', borderRadius: '15px', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ height: '100px', background: 'linear-gradient(135deg, #1F2937, #111827)', borderBottom: '1px solid #374151', padding: '15px', position: 'relative' }}>
                <span style={{ fontSize: '0.65rem', background: 'var(--highlight-color)', color: '#111827', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>GENERATOR</span>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>Scan Code</div>
              </div>
              <div style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>QR Generator</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: '1.4' }}>Instant creation and direct PNG downloads of your unique routing code.</p>
              </div>
            </div>

            <div className="hover-lift animate-on-scroll" style={{ background: '#1F2937', borderRadius: '15px', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ height: '100px', background: 'linear-gradient(135deg, #1F2937, #111827)', borderBottom: '1px solid #374151', padding: '15px', position: 'relative' }}>
                <span style={{ fontSize: '0.65rem', background: 'var(--secondary-color)', color: '#111827', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>PUBLIC VIEW</span>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>Visitor Page</div>
              </div>
              <div style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Profile View</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: '1.4' }}>Sleek dark profile output showing experience timeline and direct vCard downloads.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. "Public Profile Preview" Section */}
      <section id="preview" style={{ padding: '80px 0', background: 'rgba(31, 41, 55, 0.25)', borderTop: '1px solid #1F2937', borderBottom: '1px solid #1F2937' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Public Profile Preview</h2>
            <p style={{ color: 'var(--text-light)' }}>This is a live mockup of how your profile displays to recruiters and HRs</p>
          </div>

          <div className="animate-on-scroll" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignItems: 'stretch' }}>
            
            {/* Left: Mockup Public Profile */}
            <div style={{ flex: '1.2', minWidth: '280px', maxWidth: '400px', background: '#1F2937', border: '1px solid #374151', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              
              {/* Cover Banner */}
              <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--secondary-color), var(--highlight-color))', position: 'relative' }}>
                {/* Profile Pic Placement */}
                <div style={{
                  position: 'absolute', bottom: '-35px', left: '50%', transform: 'translateX(-50%)',
                  width: '75px', height: '75px', borderRadius: '50%', border: '3px solid #1F2937',
                  background: '#374151', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  <i className="fas fa-user" style={{ fontSize: '2rem', color: '#9CA3AF' }}></i>
                </div>
              </div>

              {/* Profile Details */}
              <div style={{ padding: '50px 20px 25px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '5px' }}>Alex Morgan</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '15px' }}>
                  Senior Full Stack Developer
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--secondary-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '4px', display: 'inline-block', marginBottom: '20px' }}>
                  VConnect Technologies
                </p>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.5', marginBottom: '20px' }}>
                  Passionate React and Node engineer building scalable SaaS portals. Scans are welcome!
                </p>

                {/* Contact items mockup */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(17, 24, 39, 0.5)', padding: '8px 12px', borderRadius: '8px', border: '1px solid #374151' }}>
                    <i className="fas fa-phone" style={{ color: 'var(--secondary-color)', fontSize: '0.85rem' }}></i>
                    <span style={{ fontSize: '0.8rem' }}>+91 98765 43210</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(17, 24, 39, 0.5)', padding: '8px 12px', borderRadius: '8px', border: '1px solid #374151' }}>
                    <i className="fas fa-envelope" style={{ color: 'var(--secondary-color)', fontSize: '0.85rem' }}></i>
                    <span style={{ fontSize: '0.8rem' }}>alex.morgan@email.com</span>
                  </div>
                </div>

                {/* Social icons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                  <a href="#linkedin" style={{ color: 'var(--secondary-color)', fontSize: '1.25rem' }}><i className="fab fa-linkedin"></i></a>
                  <a href="#github" style={{ color: 'var(--secondary-color)', fontSize: '1.25rem' }}><i className="fab fa-github"></i></a>
                  <a href="#portfolio" style={{ color: 'var(--secondary-color)', fontSize: '1.25rem' }}><i className="fas fa-globe"></i></a>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', padding: '10px', justifyContent: 'center', borderRadius: '8px', fontSize: '0.85rem' }}>
                  Save Contact
                </button>
              </div>

            </div>

            {/* Right: Mockup QR scanner visual */}
            <div style={{ flex: '1', minWidth: '260px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <h4 style={{ color: 'var(--highlight-color)', marginBottom: '15px', fontWeight: '700' }}>Your Profile QR Code</h4>
              <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '20px' }}>
                {/* Visual Placeholder for QR code */}
                <div style={{ width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#111827' }}>
                  <i className="fas fa-qrcode" style={{ fontSize: '8rem' }}></i>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.5' }}>
                This QR code is generated instantly. Recruiters scan it to load your digital credentials on their mobile devices immediately.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 11. Key Project Highlights Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '950px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Key Project Highlights</h2>
            <p style={{ color: 'var(--text-light)' }}>Technical features built to streamline your candidate profile sharing</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Secure Authentication', desc: 'Secure verification setup using password hashing and JWT token access.', icon: 'fa-shield-halved' },
              { title: 'Dynamic Profile Pages', desc: 'Renders dynamic templates based on the chosen design template configurations.', icon: 'fa-user' },
              { title: 'QR Code Generation', desc: 'Deterministic creation mapping to individual candidate URL profiles.', icon: 'fa-qrcode' },
              { title: 'Responsive Design', desc: 'Fluid layout adjustments mapping clean typography at all viewports.', icon: 'fa-mobile-screen' },
              { title: 'Modern UI/UX', desc: 'Sleek dark SaaS design elements implementing emerald accents and custom lifts.', icon: 'fa-wand-magic-sparkles' },
              { title: 'Real-Time Profile Updates', desc: 'Instant edit capabilities ensuring scanned code routing never expires.', icon: 'fa-arrows-rotate' },
              { title: 'Social Media Integration', desc: 'One-tap linking for GitHub, LinkedIn, portfolios, and alternate contacts.', icon: 'fa-share-nodes' }
            ].map((highlight, idx) => (
              <div key={idx} className="hover-lift animate-on-scroll" style={{ background: '#1F2937', padding: '25px', borderRadius: '15px', border: '1px solid #374151' }}>
                <i className={`fas ${highlight.icon}`} style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginBottom: '15px' }}></i>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px' }}>{highlight.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.5' }}>{highlight.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 12. Future Enhancements Section */}
      <section style={{ padding: '80px 0', background: 'rgba(0,0,0,0.15)' }}>
        <div className="container" style={{ maxWidth: '950px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Future Enhancements</h2>
            <p style={{ color: 'var(--text-light)' }}>Planned analytics and personalization dashboard updates</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Analytics Dashboard', desc: 'Detailed dashboard monitoring profile page activity and clicks.', icon: 'fa-chart-line' },
              { title: 'Profile View Tracking', desc: 'Know who scans your QR code and when your portfolio details get viewed.', icon: 'fa-magnifying-glass-chart' },
              { title: 'Visitor Statistics', desc: 'Geo-location and device-type statistics of recruiters scanning your link.', icon: 'fa-globe' },
              { title: 'Custom Profile Themes', desc: 'Additional dark/light layouts, custom fonts, and drag-and-drop styling.', icon: 'fa-palette' },
              { title: 'Advanced Privacy Controls', desc: 'Turn on password protection or hide specific contact details temporarily.', icon: 'fa-user-lock' },
              { title: 'Contact Export Options', desc: 'Excel/CSV exports of visitor leads who left messages on your profile.', icon: 'fa-file-export' }
            ].map((future, idx) => (
              <div key={idx} className="hover-lift animate-on-scroll" style={{ background: '#1F2937', padding: '25px', borderRadius: '15px', border: '1px solid #374151' }}>
                <i className={`fas ${future.icon}`} style={{ fontSize: '1.4rem', color: 'var(--highlight-color)', marginBottom: '15px' }}></i>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px' }}>{future.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.5' }}>{future.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 13. Technology Stack Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Technology Stack</h2>
            <p style={{ color: 'var(--text-light)' }}>The underlying framework and blueprint powering the platform</p>
          </div>

          <div className="grid-2 animate-on-scroll" style={{ gap: '30px' }}>
            
            <div style={{ background: '#1F2937', border: '1px solid #374151', padding: '30px', borderRadius: '15px' }}>
              <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.15rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fab fa-react"></i> Frontend
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px' }}></i> <strong>React.js:</strong> Component architecture for lightning-fast state transitions.</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px' }}></i> <strong>Vite:</strong> Ultra-fast dev server and bundle compilation setup.</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px' }}></i> <strong>CSS3 Styles:</strong> Global styling variables handling dynamic theme palette changes.</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--secondary-color)', marginRight: '6px' }}></i> <strong>Responsive:</strong> Breakpoint variables rendering beautifully on all device viewports.</li>
              </ul>
            </div>

            <div style={{ background: '#1F2937', border: '1px solid #374151', padding: '30px', borderRadius: '15px' }}>
              <h3 style={{ color: 'var(--highlight-color)', fontSize: '1.15rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-server"></i> Backend (Integrated)
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#D7D7D7' }}>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--highlight-color)', marginRight: '6px' }}></i> <strong>Node.js:</strong> Scalable backend runtime environment.</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--highlight-color)', marginRight: '6px' }}></i> <strong>Express.js:</strong> REST API router handling profiles creation, updates, and OTP operations.</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--highlight-color)', marginRight: '6px' }}></i> <strong>MySQL:</strong> Relational database storing user and profile attributes cleanly.</li>
                <li><i className="fas fa-chevron-right" style={{ color: 'var(--highlight-color)', marginRight: '6px' }}></i> <strong>JWT Auth:</strong> Stateless JSON Web Token authentication handling route protection.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 14. Call-To-Action Section Before Footer */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.05) 100%)', borderTop: '1px solid #1F2937' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          
          <div className="animate-on-scroll">
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '15px' }}>Ready to Share Your Professional Identity?</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '35px', lineHeight: '1.5' }}>
              Create your profile link, enter your professional credentials, and download your personalized QR code instantly.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 30px', borderRadius: '10px' }}>
                Create Your Profile
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ padding: '14px 30px', borderRadius: '10px', color: 'white', borderColor: '#374151' }}>
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid #1F2937', textAlign: 'center', color: '#9CA3AF', background: '#111827' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '10px' }}>VConnect</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '20px', color: 'var(--text-light)' }}>
            One Scan. Infinite Connections. Professional QR Profile Sharing Platform.
          </p>
          <p style={{ fontSize: '0.75rem' }}>&copy; 2026 VConnect. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
