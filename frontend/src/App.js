import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import RecoverPassword from './sections/Login/components/RecoverPassword';
import Login from './sections/Login/components/Login';
import Menu from './sections/Menu/components/Menu';
import Itinerario from './sections/Itinerario/components/Itinerario';
import ResetPassword from './sections/Login/components/ResetPassword';
import Componentes from './sections/Componentes/components/Componentes';
import { NotificationProvider } from './sections/Notification/NotificationContext';
import { AuthProvider } from './modules/auth/context/AuthContext';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import PublicRoute from './modules/auth/components/PublicRoute';


function AppContent() {
  const location = useLocation();
  const hideMenu = location.pathname === '/forgot-password' || location.pathname === '/'|| location.pathname === '/reset-password'  ;
  return (
    <>
      {!hideMenu && <Menu />}
      <Routes>
        {/* Rutas públicas - solo para usuarios NO autenticados */}
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <RecoverPassword />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
        
        {/* Rutas protegidas - solo para usuarios autenticados */}
        <Route path="/itinerario" element={
          <ProtectedRoute>
            <Itinerario />
          </ProtectedRoute>
        } />
        <Route path="/componentes" element={
          <ProtectedRoute>
            <Componentes />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
