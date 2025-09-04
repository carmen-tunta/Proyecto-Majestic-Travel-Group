// Exportar todo el módulo de autenticación
export { AuthProvider, useAuth } from './context/AuthContext';
export { authService } from './services/authService';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { default as PublicRoute } from './components/PublicRoute';
