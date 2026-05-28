import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute = ({ children, requiredRole }) => {
  const { signed, user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!signed) {
    return <Navigate to="/" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Se o usuário não tem a role necessária, redireciona para a home correta dele
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/teacher" />;
  }

  return children;
};
