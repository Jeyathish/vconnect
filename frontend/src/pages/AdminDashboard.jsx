import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminDashboard() {
  const { admin, adminLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  // Overview Stats
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState(null);

  // Profiles State
  const [profiles, setProfiles] = useState([]);
  const [profileSearch, setProfileSearch] = useState('');
  const [profilePage, setProfilePage] = useState(1);
  const [profileTotalPages, setProfileTotalPages] = useState(1);

  // Visitor Logs State
  const [logs, setLogs] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [logDevice, setLogDevice] = useState('');
  const [logCountry, setLogCountry] = useState('');
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logFilterOptions, setLogFilterOptions] = useState({ countries: [], devices: [] });

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editAdminData, setEditAdminData] = useState({ username: '', password: '', status: 'active' });

  // Settings Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile Add/Edit State
  const [editingProfile, setEditingProfile] = useState(null); // null, 'new', or profileId
  const [profileFormData, setProfileFormData] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    password: '',
    designation: '',
    company_name: '',
    alter_mobile: '',
    land_line: '',
    email: '',
    alter_email: '',
    website: '',
    address: '',
    description: '',
    template: '1'
  });
  const [profileImg, setProfileImg] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [profileImgPreview, setProfileImgPreview] = useState('');
  const [backgroundImgPreview, setBackgroundImgPreview] = useState('');
  const [profileFormSaving, setProfileFormSaving] = useState(false);

  // Fetch Overview Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/dashboard');
      if (res.data) {
        setStats(res.data.stats);
        
        const trafficData = res.data.charts.traffic;
        const topPages = res.data.charts.topPages;
        const locations = res.data.charts.locations;

        setChartData({
          traffic: {
            labels: trafficData.map(d => d.date),
            datasets: [{
              label: 'Visitors',
              data: trafficData.map(d => d.count),
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor: '#10B981',
              borderWidth: 1,
              borderRadius: 5
            }]
          },
          topPages: {
            labels: topPages.map(p => p.page_visited),
            datasets: [{
              label: 'Views',
              data: topPages.map(p => p.count),
              backgroundColor: 'rgba(52, 211, 153, 0.7)',
              borderColor: '#34D399',
              borderWidth: 1,
              borderRadius: 5
            }]
          },
          locations: {
            labels: locations.map(l => l.country),
            datasets: [{
              data: locations.map(l => l.count),
              backgroundColor: [
                '#10B981', '#34D399', '#059669', '#047857', '#065F46',
                '#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF'
              ]
            }]
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Profiles
  const fetchProfiles = async () => {
    try {
      const res = await axios.get(`/api/admin/profiles?search=${profileSearch}&page=${profilePage}&limit=10`);
      if (res.data) {
        setProfiles(res.data.profiles);
        setProfileTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Logs
  const fetchLogs = async () => {
    try {
      const query = `/api/admin/visitor-logs?search=${logSearch}&device=${logDevice}&country=${logCountry}&startDate=${logStartDate}&endDate=${logEndDate}&page=${logPage}&limit=15`;
      const res = await axios.get(query);
      if (res.data) {
        setLogs(res.data.logs);
        setLogTotalPages(res.data.pagination.totalPages);
        setLogFilterOptions(res.data.filterOptions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Admin Users
  const fetchAdminUsers = async () => {
    try {
      const res = await axios.get(`/api/admin/users?search=${adminUserSearch}`);
      if (res.data) {
        setAdminUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProfileClick = (p) => {
    setEditingProfile(p.profile_id);
    setProfileFormData({
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      mobile: p.mobile || '',
      password: p.password || '',
      designation: p.designation || '',
      company_name: p.company_name || '',
      alter_mobile: p.alter_mobile || '',
      land_line: p.land_line || '',
      email: p.email || '',
      alter_email: p.alter_email || '',
      website: p.website || '',
      address: p.address || '',
      description: p.description || '',
      template: p.template || '1'
    });
    setProfileImg(null);
    setBackgroundImg(null);
    setProfileImgPreview(p.profile_img ? `/${p.profile_img}` : '');
    setBackgroundImgPreview(p.background ? `/${p.background}` : '');
    setError('');
    setSuccess('');
    setAdminMenuOpen(false);
  };

  const handleAddProfileClick = () => {
    setEditingProfile('new');
    setProfileFormData({
      first_name: '',
      last_name: '',
      mobile: '',
      password: '',
      designation: '',
      company_name: '',
      alter_mobile: '',
      land_line: '',
      email: '',
      alter_email: '',
      website: '',
      address: '',
      description: '',
      template: '1'
    });
    setProfileImg(null);
    setBackgroundImg(null);
    setProfileImgPreview('');
    setBackgroundImgPreview('');
    setError('');
    setSuccess('');
    setAdminMenuOpen(false);
  };

  const handleProfileFileChange = (e, type) => {
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

  const handleProfileFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProfileFormSaving(true);

    const formData = new FormData();
    if (profileImg) formData.append('profile_img_input', profileImg);
    if (backgroundImg) formData.append('background_img_input', backgroundImg);

    Object.keys(profileFormData).forEach(key => {
      formData.append(key, profileFormData[key]);
    });

    try {
      if (editingProfile === 'new') {
        const res = await axios.post('/api/profiles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data && res.data.success) {
          alert('Profile created successfully!');
          setEditingProfile(null);
          fetchProfiles();
        }
      } else {
        const res = await axios.put(`/api/profiles/${editingProfile}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data && res.data.success) {
          alert('Profile updated successfully!');
          setEditingProfile(null);
          fetchProfiles();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setProfileFormSaving(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    setSuccess('');
    setEditingProfile(null);
    setAdminMenuOpen(false);
    
    const loadData = async () => {
      if (activeTab === 'overview') await fetchStats();
      else if (activeTab === 'profiles') await fetchProfiles();
      else if (activeTab === 'logs') await fetchLogs();
      else if (activeTab === 'users') await fetchAdminUsers();
      setLoading(false);
    };
    loadData();
  }, [activeTab, profilePage, logPage]);

  // Handle Searches
  const handleProfileSearchSubmit = (e) => {
    e.preventDefault();
    setProfilePage(1);
    fetchProfiles();
  };

  const handleLogSearchSubmit = (e) => {
    e.preventDefault();
    setLogPage(1);
    fetchLogs();
  };

  const handleAdminSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminUsers();
  };

  // Profile Delete
  const handleDeleteProfile = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete profile for: "${name}"?`)) {
      try {
        const res = await axios.delete(`/api/admin/profiles/${id}`);
        if (res.data && res.data.success) {
          alert(res.data.message);
          fetchProfiles();
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete profile.');
      }
    }
  };

  // Toggle User Status
  const handleToggleAdminStatus = async (id) => {
    try {
      const res = await axios.post(`/api/admin/users/${id}/toggle-status`);
      if (res.data && res.data.success) {
        fetchAdminUsers();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    }
  };

  // Admin CRUD Operations
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/admin/users', newAdmin);
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setNewAdmin({ username: '', password: '' });
        fetchAdminUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin.');
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.put(`/api/admin/users/${editingAdminId}`, editAdminData);
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setEditingAdminId(null);
        fetchAdminUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update admin.');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const res = await axios.delete(`/api/admin/users/${id}`);
        if (res.data && res.data.success) {
          fetchAdminUsers();
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete.');
      }
    }
  };

  // Password Update
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post('/api/admin/change-password', passwordForm);
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    window.open(`/api/admin/profiles/export?search=${profileSearch}`, '_blank');
  };

  const handleLogout = async () => {
    await adminLogout();
    navigate('/');
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setAdminMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#F2C87E' }}>VConnect Admin Panel</span>
          <button className="admin-menu-toggle" onClick={() => setAdminMenuOpen(!adminMenuOpen)}>
            <i className={`fas ${adminMenuOpen ? 'fa-times' : 'fa-bars'}`}></i> Menu
          </button>
        </div>
        
        <ul className={`admin-sidebar-nav ${adminMenuOpen ? 'open' : ''}`} style={{ listStyle: 'none', padding: '20px 0', gap: '5px' }}>
          <li>
            <button 
              onClick={() => handleTabSelect('overview')}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 25px', background: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'none',
                border: 'none', borderLeft: activeTab === 'overview' ? '3px solid #F2C87E' : '3px solid transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px'
              }}
            >
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleTabSelect('profiles')}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 25px', background: activeTab === 'profiles' ? 'rgba(255,255,255,0.1)' : 'none',
                border: 'none', borderLeft: activeTab === 'profiles' ? '3px solid #F2C87E' : '3px solid transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px'
              }}
            >
              <i className="fas fa-id-card"></i> Profiles
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleTabSelect('logs')}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 25px', background: activeTab === 'logs' ? 'rgba(255,255,255,0.1)' : 'none',
                border: 'none', borderLeft: activeTab === 'logs' ? '3px solid #F2C87E' : '3px solid transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px'
              }}
            >
              <i className="fas fa-street-view"></i> Visitor Logs
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleTabSelect('users')}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 25px', background: activeTab === 'users' ? 'rgba(255,255,255,0.1)' : 'none',
                border: 'none', borderLeft: activeTab === 'users' ? '3px solid #F2C87E' : '3px solid transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px'
              }}
            >
              <i className="fas fa-users-cog"></i> Admin Users
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleTabSelect('settings')}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 25px', background: activeTab === 'settings' ? 'rgba(255,255,255,0.1)' : 'none',
                border: 'none', borderLeft: activeTab === 'settings' ? '3px solid #F2C87E' : '3px solid transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px'
              }}
            >
              <i className="fas fa-cog"></i> Settings
            </button>
          </li>
          <li style={{ marginTop: '20px' }}>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 25px', background: 'none',
                border: 'none', color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px'
              }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '30px', gap: '15px' }}>
          <h2 style={{ textTransform: 'capitalize', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)' }}>{activeTab} Overview</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.95rem' }}>Welcome, {ucwords(admin?.username || 'Admin')}</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <div className="loader-spinner"></div>
          </div>
        ) : (
          <div>
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div>
                {/* Stats Grid */}
                <div className="stats-grid" style={{ marginBottom: '40px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Active Admins</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#F2C87E' }}>{stats.activeAdmins}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Today's Visitors</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#F2C87E' }}>{stats.todayVisitors}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Week's Visitors</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#F2C87E' }}>{stats.weekVisitors}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Month's Visitors</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#F2C87E' }}>{stats.monthVisitors}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Total Profiles</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#F2C87E' }}>{stats.totalProfiles}</span>
                  </div>
                </div>

                {/* Charts Grid */}
                {chartData && (
                  <div className="charts-grid">
                    <div style={{ background: 'white', padding: '15px', borderRadius: '15px', color: '#333', width: '100%', minWidth: 0 }}>
                      <h4 style={{ marginBottom: '15px', color: '#203A5F', fontSize: '0.95rem' }}>Traffic history (last 30 days)</h4>
                      <div style={{ height: '240px', position: 'relative' }}>
                        <Bar data={chartData.traffic} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>
                    
                    <div style={{ background: 'white', padding: '15px', borderRadius: '15px', color: '#333', width: '100%', minWidth: 0 }}>
                      <h4 style={{ marginBottom: '15px', color: '#203A5F', fontSize: '0.95rem' }}>Top Visited Pages</h4>
                      <div style={{ height: '240px', position: 'relative' }}>
                        <Bar data={chartData.topPages} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '15px', borderRadius: '15px', color: '#333', width: '100%', minWidth: 0 }}>
                      <h4 style={{ marginBottom: '15px', color: '#203A5F', fontSize: '0.95rem' }}>Visitor Locations</h4>
                      <div style={{ height: '240px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <Pie data={chartData.locations} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profiles Tab Content */}
            {activeTab === 'profiles' && (
              <div>
                {editingProfile ? (
                  <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(20px, 5vw, 40px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '10px' }}>
                      <h3>{editingProfile === 'new' ? 'Create New Profile' : 'Edit Profile'}</h3>
                      <button onClick={() => setEditingProfile(null)} className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
                        <i className="fas fa-arrow-left"></i> Back
                      </button>
                    </div>

                    {error && <div style={{ background: 'rgba(231,76,60,0.15)', padding: '12px', borderLeft: '4px solid #e74c3c', marginBottom: '20px' }}>{error}</div>}
                    {success && <div style={{ background: 'rgba(39,174,96,0.15)', padding: '12px', borderLeft: '4px solid #27ae60', marginBottom: '20px' }}>{success}</div>}

                    <form onSubmit={handleProfileFormSubmit}>
                      {/* Pick Theme Template */}
                      <div className="form-group">
                        <label>Pick Theme Template</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px', marginTop: '10px' }}>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <div 
                              key={num}
                              onClick={() => setProfileFormData({ ...profileFormData, template: num.toString() })}
                              className={`theme-${num}`}
                              style={{
                                height: '50px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold',
                                border: profileFormData.template === num.toString() ? '3px solid white' : '3px solid transparent',
                                background: 'var(--theme-gradient)', color: 'white', fontSize: '0.8rem'
                              }}
                            >
                              Theme {num}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Images */}
                      <div className="form-row-2" style={{ marginBottom: '25px' }}>
                        <div className="form-group">
                          <label>Profile Image {editingProfile === 'new' ? '(Required)' : ''}</label>
                          <input type="file" accept="image/*" onChange={(e) => handleProfileFileChange(e, 'profile')} style={{ width: '100%', overflow: 'hidden' }} required={editingProfile === 'new'} />
                          {profileImgPreview && <img src={profileImgPreview} alt="prev" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px', border: '2px solid white' }} />}
                        </div>
                        <div className="form-group">
                          <label>Background Banner {editingProfile === 'new' ? '(Required)' : ''}</label>
                          <input type="file" accept="image/*" onChange={(e) => handleProfileFileChange(e, 'background')} style={{ width: '100%', overflow: 'hidden' }} required={editingProfile === 'new'} />
                          {backgroundImgPreview && <img src={backgroundImgPreview} alt="prev" style={{ width: '120px', height: '70px', borderRadius: '6px', objectFit: 'cover', marginTop: '10px', border: '2px solid white' }} />}
                        </div>
                      </div>

                      {/* General Fields */}
                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="first_name">First Name</label>
                          <input 
                            type="text" 
                            id="first_name" 
                            className="form-input" 
                            value={profileFormData.first_name} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, first_name: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="last_name">Last Name</label>
                          <input 
                            type="text" 
                            id="last_name" 
                            className="form-input" 
                            value={profileFormData.last_name} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, last_name: e.target.value })} 
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="mobile">Mobile Number</label>
                          <input 
                            type="text" 
                            id="mobile" 
                            className="form-input" 
                            maxLength={10} 
                            value={profileFormData.mobile} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, mobile: e.target.value.replace(/\D/g, '') })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="password">Password (Plain text)</label>
                          <input 
                            type="password" 
                            id="password" 
                            className="form-input" 
                            value={profileFormData.password} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, password: e.target.value })} 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="designation">Designation</label>
                          <input 
                            type="text" 
                            id="designation" 
                            className="form-input" 
                            value={profileFormData.designation} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, designation: e.target.value })} 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="company_name">Company Name</label>
                          <input 
                            type="text" 
                            id="company_name" 
                            className="form-input" 
                            value={profileFormData.company_name} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, company_name: e.target.value })} 
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="email">Email</label>
                          <input 
                            type="email" 
                            id="email" 
                            className="form-input" 
                            value={profileFormData.email} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="alter_email">Alternative Email</label>
                          <input 
                            type="email" 
                            id="alter_email" 
                            className="form-input" 
                            value={profileFormData.alter_email} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, alter_email: e.target.value })} 
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="alter_mobile">Alternative Mobile</label>
                          <input 
                            type="text" 
                            id="alter_mobile" 
                            className="form-input" 
                            maxLength={10} 
                            value={profileFormData.alter_mobile} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, alter_mobile: e.target.value.replace(/\D/g, '') })} 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="land_line">Land Line</label>
                          <input 
                            type="text" 
                            id="land_line" 
                            className="form-input" 
                            value={profileFormData.land_line} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, land_line: e.target.value.replace(/\D/g, '') })} 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="website">Website Link</label>
                        <input 
                          type="url" 
                          id="website" 
                          className="form-input" 
                          value={profileFormData.website} 
                          onChange={(e) => setProfileFormData({ ...profileFormData, website: e.target.value })} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="address">Office Address</label>
                        <textarea 
                          id="address" 
                          className="form-input" 
                          value={profileFormData.address} 
                          onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })} 
                          style={{ minHeight: '80px' }}
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <label htmlFor="description">Short Bio / Description</label>
                        <textarea 
                          id="description" 
                          className="form-input" 
                          value={profileFormData.description} 
                          onChange={(e) => setProfileFormData({ ...profileFormData, description: e.target.value })} 
                          style={{ minHeight: '80px' }}
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-accent" 
                        style={{ width: '100%', padding: '14px', justifyContent: 'center', borderRadius: '8px' }}
                        disabled={profileFormSaving}
                      >
                        {profileFormSaving ? <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Save Profile'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
                      <form onSubmit={handleProfileSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '400px', minWidth: '260px' }}>
                        <input 
                          type="text" 
                          placeholder="Search profiles..." 
                          className="form-input" 
                          value={profileSearch}
                          onChange={(e) => setProfileSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                      </form>
                      
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={handleAddProfileClick} className="btn btn-primary">
                          <i className="fas fa-plus"></i> Add Profile
                        </button>
                        <button onClick={handleExportCSV} className="btn btn-accent">
                          <i className="fas fa-file-excel"></i> Export CSV
                        </button>
                      </div>
                    </div>

                    {/* Scrollable table wrapper */}
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '15px 20px' }}>Name</th>
                            <th style={{ padding: '15px 20px' }}>Mobile</th>
                            <th style={{ padding: '15px 20px' }}>Email</th>
                            <th style={{ padding: '15px 20px' }}>Company</th>
                            <th style={{ padding: '15px 20px' }}>Designation</th>
                            <th style={{ padding: '15px 20px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profiles.map(p => (
                            <tr key={p.profile_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '15px 20px' }}>{p.first_name} {p.last_name || ''}</td>
                              <td style={{ padding: '15px 20px' }}>{p.mobile}</td>
                              <td style={{ padding: '15px 20px' }}>{p.email}</td>
                              <td style={{ padding: '15px 20px' }}>{p.company_name || '-'}</td>
                              <td style={{ padding: '15px 20px' }}>{p.designation || '-'}</td>
                              <td style={{ padding: '15px 20px', display: 'flex', gap: '10px' }}>
                                <Link to={`/profile/${p.profile_id}`} target="_blank" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View</Link>
                                <button onClick={() => handleEditProfileClick(p)} className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit</button>
                                <button onClick={() => handleDeleteProfile(p.profile_id, p.first_name)} className="btn btn-outline" style={{ color: '#ff6b6b', borderColor: '#ff6b6b', padding: '6px 12px', fontSize: '0.8rem' }}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                      <button onClick={() => setProfilePage(prev => Math.max(prev - 1, 1))} className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>Prev</button>
                      <span style={{ alignSelf: 'center' }}>Page {profilePage} of {profileTotalPages}</span>
                      <button onClick={() => setProfilePage(prev => Math.min(prev + 1, profileTotalPages))} className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>Next</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visitor Logs Tab Content */}
            {activeTab === 'logs' && (
              <div>
                {/* Filters Row */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '25px' }}>
                  <form onSubmit={handleLogSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '260px' }}>
                    <input 
                      type="text" 
                      placeholder="Search IP, page..." 
                      className="form-input" 
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Filter</button>
                  </form>

                  <select className="form-input" style={{ width: 'auto', minWidth: '130px' }} value={logDevice} onChange={(e) => setLogDevice(e.target.value)}>
                    <option value="">All Devices</option>
                    {logFilterOptions.devices.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  <select className="form-input" style={{ width: 'auto', minWidth: '130px' }} value={logCountry} onChange={(e) => setLogCountry(e.target.value)}>
                    <option value="">All Countries</option>
                    {logFilterOptions.countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <input type="date" className="form-input" style={{ width: 'auto', minWidth: '130px' }} value={logStartDate} onChange={(e) => setLogStartDate(e.target.value)} />
                  <input type="date" className="form-input" style={{ width: 'auto', minWidth: '130px' }} value={logEndDate} onChange={(e) => setLogEndDate(e.target.value)} />
                </div>

                {/* Scrollable table wrapper */}
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '15px 20px' }}>IP</th>
                        <th style={{ padding: '15px 20px' }}>Country</th>
                        <th style={{ padding: '15px 20px' }}>City</th>
                        <th style={{ padding: '15px 20px' }}>Device</th>
                        <th style={{ padding: '15px 20px' }}>Page Visited</th>
                        <th style={{ padding: '15px 20px' }}>Visited At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(l => (
                        <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '15px 20px' }}>{l.ip}</td>
                          <td style={{ padding: '15px 20px' }}>{l.country}</td>
                          <td style={{ padding: '15px 20px' }}>{l.city}</td>
                          <td style={{ padding: '15px 20px' }}>{l.device}</td>
                          <td style={{ padding: '15px 20px' }}>{l.page_visited}</td>
                          <td style={{ padding: '15px 20px' }}>{l.visited_at ? new Date(l.visited_at).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                  <button onClick={() => setLogPage(prev => Math.max(prev - 1, 1))} className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>Prev</button>
                  <span style={{ alignSelf: 'center' }}>Page {logPage} of {logTotalPages}</span>
                  <button onClick={() => setLogPage(prev => Math.min(prev + 1, logTotalPages))} className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>Next</button>
                </div>
              </div>
            )}

            {/* Admin Users Tab Content */}
            {activeTab === 'users' && (
              <div>
                {error && <div style={{ background: 'rgba(231,76,60,0.15)', padding: '12px', borderLeft: '4px solid #e74c3c', marginBottom: '20px' }}>{error}</div>}
                {success && <div style={{ background: 'rgba(39,174,96,0.15)', padding: '12px', borderLeft: '4px solid #27ae60', marginBottom: '20px' }}>{success}</div>}

                {/* Split grid */}
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', width: '100%' }}>
                  
                  {/* Create Admin Form */}
                  <div style={{ flex: '1', minWidth: '280px', background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '15px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '20px' }}>{editingAdminId ? 'Edit User details' : 'Add Admin User'}</h3>
                    
                    {editingAdminId ? (
                      <form onSubmit={handleUpdateAdmin}>
                        <div className="form-group">
                          <label htmlFor="edit_username">Username</label>
                          <input type="text" id="edit_username" className="form-input" value={editAdminData.username} onChange={(e) => setEditAdminData({ ...editAdminData, username: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit_password">Password (Leave blank to keep existing)</label>
                          <input type="password" id="edit_password" className="form-input" placeholder="New Password" value={editAdminData.password} onChange={(e) => setEditAdminData({ ...editAdminData, password: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit_status">Status</label>
                          <select id="edit_status" className="form-input" value={editAdminData.status} onChange={(e) => setEditAdminData({ ...editAdminData, status: e.target.value })}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button type="submit" className="btn btn-accent">Save</button>
                          <button type="button" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }} onClick={() => setEditingAdminId(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleCreateAdmin}>
                        <div className="form-group">
                          <label htmlFor="reg_username">Username</label>
                          <input type="text" id="reg_username" className="form-input" placeholder="e.g. jdoe" value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="reg_password">Password</label>
                          <input type="password" id="reg_password" className="form-input" placeholder="Enter password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Admin</button>
                      </form>
                    )}
                  </div>

                  {/* Admin User list */}
                  <div style={{ flex: '1.5', minWidth: '280px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <input 
                        type="text" 
                        placeholder="Search usernames..." 
                        className="form-input" 
                        value={adminUserSearch}
                        onChange={(e) => setAdminUserSearch(e.target.value)}
                      />
                      <button onClick={handleAdminSearchSubmit} className="btn btn-primary">Search</button>
                    </div>

                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '15px 20px' }}>Username</th>
                            <th style={{ padding: '15px 20px' }}>Status (Toggle)</th>
                            <th style={{ padding: '15px 20px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map(u => (
                            <tr key={u.nos} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '15px 20px' }}>{u.username}</td>
                              <td style={{ padding: '15px 20px' }}>
                                <button 
                                  onClick={() => handleToggleAdminStatus(u.nos)}
                                  style={{
                                    border: 'none', borderRadius: '50px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer',
                                    background: u.status === 'active' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #7f8c8d, #95a5a6)',
                                    color: 'white', fontSize: '0.85rem'
                                  }}
                                >
                                  {u.status === 'active' ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td style={{ padding: '15px 20px', display: 'flex', gap: '10px' }}>
                                <button 
                                  onClick={() => {
                                    setEditingAdminId(u.nos);
                                    setEditAdminData({ username: u.username, password: '', status: u.status });
                                  }}
                                  className="btn btn-primary" 
                                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteAdmin(u.nos)} className="btn btn-outline" style={{ color: '#ff6b6b', borderColor: '#ff6b6b', padding: '6px 12px', fontSize: '0.8rem' }}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Settings Tab Content */}
            {activeTab === 'settings' && (
              <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
                <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
                  <h3 style={{ marginBottom: '25px', fontSize: '1.25rem' }}>Change Admin Password</h3>

                  {error && <div style={{ background: 'rgba(231,76,60,0.15)', padding: '12px', borderLeft: '4px solid #e74c3c', marginBottom: '20px' }}>{error}</div>}
                  {success && <div style={{ background: 'rgba(39,174,96,0.15)', padding: '12px', borderLeft: '4px solid #27ae60', marginBottom: '20px' }}>{success}</div>}

                  <form onSubmit={handlePasswordChangeSubmit}>
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input 
                        type="password" 
                        id="currentPassword" 
                        className="form-input" 
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input 
                        type="password" 
                        id="newPassword" 
                        className="form-input" 
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input 
                        type="password" 
                        id="confirmPassword" 
                        className="form-input" 
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>Change Password</button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

// Helpers
function ucwords(str) {
  return (str || '').toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });
}

export default AdminDashboard;
