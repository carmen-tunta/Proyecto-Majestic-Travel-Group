import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../../contexts/PermissionsContext';

const RequirePermission = ({ moduleCode, action = 'VIEW', children }) => {
  const { has, isAdmin } = usePermissions();

  // If admin, allow
  if (isAdmin) return children;

  // If has permission, allow
  if (has(moduleCode, action)) return children;

  // Otherwise redirect to home (or show not authorized)
  return <Navigate to="/" replace />;
};

export default RequirePermission;
