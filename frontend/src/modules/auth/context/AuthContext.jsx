import React, { createContext, useContext, useState, useEffect } from 'react';
import { getActiveSession, setActiveSession, clearActiveSession, purgeStaleSessions } from '../utils/multiSession';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purgeStaleSessions();
    const { data } = getActiveSession();
    if (data && data.token && data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    setActiveSession(token, userData);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearActiveSession();
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
