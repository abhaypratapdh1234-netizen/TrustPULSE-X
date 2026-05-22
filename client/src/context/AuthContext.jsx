import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('trustpulse_user');
    const token = localStorage.getItem('trustpulse_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      const { token, user: userData } = data;
      localStorage.setItem('trustpulse_token', token);
      localStorage.setItem('trustpulse_user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}! 👋`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setAuthLoading(true);
    try {
      const { data } = await authAPI.register({ name, email, password });
      const { token, user: userData } = data;
      localStorage.setItem('trustpulse_token', token);
      localStorage.setItem('trustpulse_user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Account created! Welcome to TrustPULSE, ${userData.name}! 🚀`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('trustpulse_token');
    localStorage.removeItem('trustpulse_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('trustpulse_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setAuthLoading(true);
    try {
      const { data } = await authAPI.forgotPassword(email);
      toast.success(data.message || 'Reset link generated!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(msg);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    setAuthLoading(true);
    try {
      const { data } = await authAPI.resetPassword(token, password);
      const { token: newToken, user: userData } = data;
      localStorage.setItem('trustpulse_token', newToken);
      localStorage.setItem('trustpulse_user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Password successfully reset! Welcome back! 🎉');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed. Please try again.';
      toast.error(msg);
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
