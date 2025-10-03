import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { usePermissions } from '../../../contexts/PermissionsContext';
import { apiService } from '../../../services/apiService';

// Envuelve una ruta protegida y además exige VIEW sobre un módulo
// Props: moduleCode (string), children
const PermissionRoute = ({ moduleCode, children }) => {
  const { modules, loading } = usePermissions();
  const allowed = useMemo(() => apiService.hasView(modules, moduleCode), [modules, moduleCode]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>Verificando permisos...</div>;
  }

  if (!allowed) {
    return <Navigate to="/permisos?denied=1&module=" replace />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default PermissionRoute;