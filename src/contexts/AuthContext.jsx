import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/mockDb';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem('gestor_notas_auth_user');
    if (storagedUser) {
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const loggedUser = await api.login(email, password, role);
      setUser(loggedUser);
      localStorage.setItem('gestor_notas_auth_user', JSON.stringify(loggedUser));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gestor_notas_auth_user');
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
