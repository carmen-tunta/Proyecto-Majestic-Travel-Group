import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import RecoverPassword from './sections/Login/components/RecoverPassword';
import Login from './sections/Login/components/Login';
import Menu from './sections/Menu/components/Menu';
import Itinerario from './sections/Itinerario/components/Itinerario';
import ResetPassword from './sections/Login/components/ResetPassword';
import Componentes from './sections/Componentes/components/Componentes';
import Proveedores from './sections/Proveedores/components/Proveedores';
import DetallesProveedores from './sections/Proveedores/components/DetallesProveedor/DetallesProveedores';
import Tarifario from './sections/Proveedores/components/Tarifario/Tarifario';
import { NotificationProvider } from './sections/Notification/NotificationContext';
import { AuthProvider } from './modules/auth/context/AuthContext';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import PermissionRoute from './modules/auth/components/PermissionRoute';
import PublicRoute from './modules/auth/components/PublicRoute';
import { ModalProvider, useModal } from './contexts/ModalContext';
import Clientes from './sections/Clientes/components/Clientes';
import ClientPage from './sections/Clientes/components/ClientPage';
import Services from './sections/Services/components/Services';
import Cotizaciones from './sections/Cotizacion/components/Cotizaciones';
import CotizacionForm from './sections/Cotizacion/components/CotizacionForm';
import RegistroPagos from './sections/RegistroPagos/components/RegistroPagos';
import Reporte from './sections/RegistroPagos/components/Reporte';
import Permisos from './sections/Permisos/components/Permisos';
import PlanYourTrip from './sections/Public/components/PlanYourTrip';
import ThankYou from './sections/Public/components/ThankYou';
import BandejaSolicitud from './sections/BandejaSolicitud/components/BandejaSolicitud';

function AppContent() {
  const location = useLocation();
  const { isModalOpen } = useModal();
  const hideMenu = location.pathname === '/forgot-password' || location.pathname === '/'|| location.pathname === '/reset-password' || location.pathname === '/plan-your-trip' || location.pathname === '/plan-your-trip/thank-you';
  return (
    <>
      {!hideMenu && <Menu />}

      <div className={hideMenu ? 'main-content-modal' : (isModalOpen ? 'main-content-modal' : 'main-content')}>
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
          <Route path="/plan-your-trip" element={<PlanYourTrip />} />
          <Route path="/plan-your-trip/thank-you" element={<ThankYou />} />
          
          {/* Rutas protegidas - solo para usuarios autenticados */}
          <Route path="/bandeja-solicitud" element={
            <PermissionRoute moduleCode="BANDEJA_SOLICITUD">
              <BandejaSolicitud />
            </PermissionRoute>
          } />
          <Route path="/itinerario" element={
            <PermissionRoute moduleCode="ITINERARIO">
              <Itinerario />
            </PermissionRoute>
          } />
          <Route path="/componentes" element={
            <PermissionRoute moduleCode="COMPONENTES">
              <Componentes />
            </PermissionRoute>
          } />
          <Route path="/servicios" element={
            <PermissionRoute moduleCode="SERVICIOS">
              <Services />
            </PermissionRoute>
          } />
          <Route path="/proveedores" element={
            <PermissionRoute moduleCode="PROVEEDORES">
              <Proveedores />
            </PermissionRoute>
          } />
          <Route path="/cotizaciones" element={
            <PermissionRoute moduleCode="COTIZACION">
              <Cotizaciones />
            </PermissionRoute>
          } />
          <Route path="/cotizaciones/nuevo" element={
            <PermissionRoute moduleCode="COTIZACION">
              <CotizacionForm />
            </PermissionRoute>
          } />
          <Route path="/cotizaciones/:id" element={
            <PermissionRoute moduleCode="COTIZACION">
              <CotizacionForm />
            </PermissionRoute>
          } />
          <Route path="/proveedores/detalles" element={
            <PermissionRoute moduleCode="PROVEEDORES">
              <DetallesProveedores />
            </PermissionRoute>
          } />
          <Route path="/proveedores/tarifario" element={
            <PermissionRoute moduleCode="PROVEEDORES">
              <Tarifario />
            </PermissionRoute>
          } />
          <Route path="/clientes" element={
            <PermissionRoute moduleCode="CLIENTES">
              <Clientes />
            </PermissionRoute>
          } />
          <Route path="/clientes/nuevo" element={
            <PermissionRoute moduleCode="CLIENTES">
              <ClientPage />
            </PermissionRoute>
          } />
          <Route path="/clientes/:id" element={
            <PermissionRoute moduleCode="CLIENTES">
              <ClientPage />
            </PermissionRoute>
          } />
          <Route path="/registro-pagos" element={
            <PermissionRoute moduleCode="REGISTRO_PAGOS">
              <RegistroPagos />
            </PermissionRoute>
          } />
          <Route path="/registro-pagos/reporte" element={
            <PermissionRoute moduleCode="REGISTRO_PAGOS">
              <Reporte />
            </PermissionRoute>
          } />
          <Route path="/permisos" element={
            <PermissionRoute moduleCode="USUARIOS">
              <Permisos />
            </PermissionRoute>
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
