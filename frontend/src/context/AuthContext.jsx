import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { generateVaultSalt } from '../crypto/vaultCrypto';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Register a new user
   * Generates a unique cryptographically random vaultSalt on the client
   */
  const register = async (email, masterPassword) => {
    const vaultSalt = generateVaultSalt(16);
    const res = await api.post('/auth/register', {
      email,
      masterPassword,
      vaultSalt,
    });
    setUser(res.data.user);
    return { user: res.data.user, vaultSalt: res.data.vaultSalt || vaultSalt };
  };

  /**
   * Log in user with master password
   * Returns user and vaultSalt needed to derive vault key
   */
  const login = async (email, masterPassword) => {
    const res = await api.post('/auth/login', {
      email,
      masterPassword,
    });
    setUser(res.data.user);
    return { user: res.data.user, vaultSalt: res.data.vaultSalt };
  };

  /**
   * Log out user
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setUser(null);
    }
  };

  /**
   * Update user settings (auto lock timeout, theme, etc.)
   */
  const updateSettings = async (settings) => {
    const res = await api.put('/auth/settings', { settings });
    setUser(res.data.user);
    return res.data.user;
  };

  /**
   * Delete user account and all vault data
   */
  const deleteAccount = async (masterPassword) => {
    await api.delete('/auth/account', { data: { masterPassword } });
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    checkAuth,
    register,
    login,
    logout,
    updateSettings,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
