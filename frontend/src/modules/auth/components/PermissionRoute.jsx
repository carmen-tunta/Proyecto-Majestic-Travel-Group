import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiService } from '../../../services/apiService';
import ProtectedRoute from './ProtectedRoute';

// Envuelve una ruta protegida y además exige VIEW sobre un módulo
// Props: moduleCode (string), children
const PermissionRoute = ({ moduleCode, children }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiService.getMyPermissions();
        const ok = apiService.hasView(data.modules || [], moduleCode);
        if (mounted) {
          setAllowed(ok);
        }
      } catch (e) {
        if (mounted) setAllowed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [moduleCode]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>Verificando permisos...</div>;
  }

  if (!allowed) {
    return <Navigate to="/permisos?denied=1&module=" replace />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default PermissionRoute;