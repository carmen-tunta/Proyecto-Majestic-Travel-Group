import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import RecoverPassword from './sections/Login/components/RecoverPassword';
import Login from './sections/Login/components/Login';
import Menu from './sections/Menu/components/Menu';
import Itinerario from './sections/Itinerario/components/Itinerario';
import ResetPassword from './sections/Login/components/ResetPassword';
import Componentes from './sections/Componentes/components/Componentes';
import Proveedores from './sections/Proveedores/components/Proveedores';
import DetallesProveedores from './sections/Proveedores/components/DetallesProveedores';
import Tarifario from './sections/Proveedores/components/Tarifario/Tarifario';
import { NotificationProvider } from './sections/Notification/NotificationContext';
import { AuthProvider } from './modules/auth/context/AuthContext';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import PublicRoute from './modules/auth/components/PublicRoute';
import { ModalProvider, useModal } from './contexts/ModalContext';
import Clientes from './sections/Clientes/components/Clientes';
import ClientPage from './sections/Clientes/components/ClientPage';
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
          <Route path="/servicios" element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          } />
          <Route path="/proveedores" element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          } />
          <Route path="/proveedores/detalles" element={
            <ProtectedRoute>
              <DetallesProveedores />
            </ProtectedRoute>
          } />
          <Route path="/proveedores/tarifario" element={
            <ProtectedRoute>
              <Tarifario />
            </ProtectedRoute>
          } />
          <Route path="/clientes" element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          } />
          <Route path="/clientes/nuevo" element={
            <ProtectedRoute>
              <ClientPage />
            </ProtectedRoute>
          } />
          <Route path="/clientes/:id" element={
            <ProtectedRoute>
              <ClientPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>

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
