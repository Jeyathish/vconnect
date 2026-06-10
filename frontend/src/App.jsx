import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import ProfileCard from './pages/ProfileCard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CompleteProfile from './pages/CompleteProfile';
import UserDashboard from './pages/UserDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';

import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Protected Route wrappers
const RequireAuth = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#111827' }}>
        <div className="loader-spinner"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireAdmin = ({ children }) => {
  const { admin, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#111827' }}>
        <div className="loader-spinner"></div>
      </div>
    );
  }
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile/:id" element={<ProfileCard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Private User Routes */}
          <Route path="/create-profile" element={<CompleteProfile />} />
          <Route 
            path="/dashboard" 
            element={
              <RequireAuth>
                <UserDashboard />
              </RequireAuth>
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/*" 
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
