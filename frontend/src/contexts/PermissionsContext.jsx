import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../modules/auth/context/AuthContext';

const PermissionsContext = createContext(null);

export const usePermissions = () => useContext(PermissionsContext);

export const PermissionsProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [modules, setModules] = useState([]); // [{module, nombre, acciones:[] }]
  const [flat, setFlat] = useState([]); // ['MOD:ACTION']
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyPermissions(true);
      console.debug('[Permissions] /permissions/me ->', data);
      const mods = data.modules || [];
      setModules(mods);
      // Fallback: si no viene flat, construirlo
      let flatResp = data.flat;
      if (!flatResp || !Array.isArray(flatResp)) {
        flatResp = mods.flatMap(m => (m.acciones || []).map(a => `${m.module || m.moduleCode || m.module_name || m.module}:${a}`));
      }
      setFlat(flatResp);
      setVersion(data.version || 0);
      setIsAdmin(!!data.isAdmin);
      setError(null);
    } catch (e) {
      console.debug('[Permissions] error fetching permissions:', e);
      setError(e?.message || 'Error cargando permisos');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPermissions();
    } else {
      // Reset cuando se hace logout
      setModules([]);
      setFlat([]);
      setVersion(0);
      setIsAdmin(false);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchPermissions]);

  const refresh = () => fetchPermissions();

  // Fallback de admin por frontend (solo para los 3 admins conocidos) para no bloquear UI si backend se demora
  const isAdminFallback = (() => {
    const adminEmails = new Set(['admin@gmail.com','nico03vj@gmail.com','agustinrobolero@gmail.com']);
    const adminUsernames = new Set(['admin','nico','agus']);
    const email = (user?.email || '').toLowerCase();
    const username = (user?.username || '').toLowerCase();
    return adminEmails.has(email) || adminUsernames.has(username);
  })();

  const has = (mod, action = 'VIEW') => {
    const allow = (isAdmin || isAdminFallback) || flat.includes(`${mod}:${action}`);
    // Debug puntual para diagnosticar por qué no se muestran botones
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(`[Permissions.has] ${mod}:${action} ->`, allow, { isAdmin, isAdminFallback, flatSample: flat.slice(0, 5), version });
    }
    return allow;
  };

  return (
    <PermissionsContext.Provider value={{ modules, flat, version, loading, error, refresh, has, isAdmin: isAdmin || isAdminFallback }}>
      {children}
    </PermissionsContext.Provider>
  );
};
