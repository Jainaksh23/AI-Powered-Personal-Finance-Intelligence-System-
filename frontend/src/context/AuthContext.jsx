import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pfis_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (err) {
          console.error("Token expired or invalid", err);
          localStorage.removeItem('pfis_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('pfis_token', access_token);
    setUser(userData);
    return userData;
  };

  const loginAsDemo = async () => {
    return await login('demo@pfis.com', 'password123');
  };

  const register = async (name, email, password, coldStartOption = 'demo', selectedPersona = 'Working Professional') => {
    await authAPI.register(name, email, password, coldStartOption, selectedPersona);
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('pfis_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsDemo, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
