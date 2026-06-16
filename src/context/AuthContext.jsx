import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated user session on mount
  const checkUserSession = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        setUser(data.user);
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      }
      return { success: true, message: 'Logged in successfully.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, avatarFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const { data } = await API.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setUser(data.user);
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await API.get('/auth/logout');
      return { success: true, message: 'Logged out successfully.' };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed. Please try again.',
      };
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, checkUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
