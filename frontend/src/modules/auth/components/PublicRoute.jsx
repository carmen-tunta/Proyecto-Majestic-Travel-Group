import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  // Si está autenticado, redirigir a la bandeja de solicitud
  if (isAuthenticated) {
    return <Navigate to="/bandeja-solicitud" replace />;
  }

  // Si no está autenticado, mostrar el componente (login, recover password, etc.)
  return children;
};

export default PublicRoute;
