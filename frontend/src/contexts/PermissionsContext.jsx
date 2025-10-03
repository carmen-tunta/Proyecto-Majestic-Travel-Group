import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

const PermissionsContext = createContext();

export const usePermissions = () => useContext(PermissionsContext);

export const PermissionsProvider = ({ children }) => {
  const [modules, setModules] = useState([]); // [{ module, actions: [] }]
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(0);

  const fetchPermissions = useCallback(async ({ force = false, includeEmpty = true } = {}) => {
    if (!force && Date.now() - lastFetched < 15000) return; // TTL 15s
    setLoading(true);
    try {
      const data = await apiService.getMyPermissions(includeEmpty);
      setModules(data.modules || []);
      if (typeof data.version === 'number') setVersion(data.version);
      setLastFetched(Date.now());
      setError(null);
    } catch (e) {
      setError(e.message || 'Error cargando permisos');
    } finally {
      setLoading(false);
    }
  }, [lastFetched]);

  // Inicial
  useEffect(() => { fetchPermissions({ force: true }); }, [fetchPermissions]);

  // API pública para forzar refresh (tras grant/revoke)
  const refreshPermissions = async () => fetchPermissions({ force: true });

  const value = { modules, version, loading, error, refreshPermissions };
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};
