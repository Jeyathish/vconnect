import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios defaults to always send cookies
axios.defaults.withCredentials = true;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      // 1. Check User session
      const userRes = await axios.get('/api/auth/me');
      if (userRes.data && userRes.data.isAuthenticated) {
        setUser(userRes.data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }

    try {
      // 2. Check Admin session
      const adminRes = await axios.get('/api/auth/admin/me');
      if (adminRes.data && adminRes.data.isAuthenticated) {
        setAdmin(adminRes.data.admin);
      } else {
        setAdmin(null);
      }
    } catch (e) {
      setAdmin(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (mobile, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { mobile, password });
      if (res.data && res.data.success) {
        setUser(res.data.user);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid credentials or server error.'
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      // Ignore
    }
    setUser(null);
    setLoading(false);
  };

  const adminLogin = async (username, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/admin/login', { username, password });
      if (res.data && res.data.success) {
        setAdmin(res.data.admin);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid username or password.'
      };
    }
  };

  const adminLogout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/admin/logout');
    } catch (e) {
      // Ignore
    }
    setAdmin(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        login,
        logout,
        adminLogin,
        adminLogout,
        refreshSession: checkSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
