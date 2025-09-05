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
import { ModalProvider, useModal } from './contexts/ModalContext';


import Services from './sections/Services/components/Services';

function AppContent() {
  const location = useLocation();
  const { isModalOpen } = useModal();
  const hideMenu = location.pathname === '/forgot-password' || location.pathname === '/'|| location.pathname === '/reset-password'  ;
  return (
    <>
      {!hideMenu && <Menu />}

      <div className={hideMenu ? '' : (isModalOpen ? 'main-content-modal' : 'main-content')}>
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
      </div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<RecoverPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/itinerario" element={<Itinerario />} />
        <Route path="/componentes" element={<Componentes />} />
        <Route path="/servicios" element={<Services />} />
      </Routes>

    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
