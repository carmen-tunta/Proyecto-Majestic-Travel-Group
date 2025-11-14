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
import PublicRoute from './modules/auth/components/PublicRoute';
import RequirePermission from './modules/auth/components/RequirePermission';
import { ModalProvider, useModal } from './contexts/ModalContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import Clientes from './sections/Clientes/components/Clientes';
import ClientPage from './sections/Clientes/components/ClientPage';
import Services from './sections/Services/components/Services';
import Cotizaciones from './sections/Cotizacion/components/Cotizaciones';
import CotizacionForm from './sections/Cotizacion/components/CotizacionForm';
import RegistroPagos from './sections/RegistroPagos/components/RegistroPagos';
import Reporte from './sections/RegistroPagos/components/Reporte';
import PlanYourTrip from './sections/Public/components/PlanYourTrip';
import ThankYou from './sections/Public/components/ThankYou';
import PortadaMenu from './sections/Services/components/Portada/PortadaMenu';
import BandejaSolicitud from './sections/BandejaSolicitud/components/BandejaSolicitud';
import ReportesHome from './sections/Reportes/components/ReportesHome';
import BandejaSolicitudReporte from './sections/Reportes/components/BandejaSolicitudReporte';
import CotizacionReporte from './sections/Reportes/components/CotizacionReporte';
import Permisos from './sections/Permisos/components/Permisos';

function AppContent() {
  const location = useLocation();
  const { isModalOpen } = useModal();
  const hideMenu = location.pathname === '/forgot-password' || location.pathname === '/'|| location.pathname === '/reset-password' || location.pathname === '/plan-your-trip' || location.pathname === '/plan-your-trip/thank-you' || location.pathname === '/servicios/portada';
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
          <Route path="/bandeja-solicitud" element={<ProtectedRoute><BandejaSolicitud /></ProtectedRoute>} />
          <Route path="/itinerario" element={<ProtectedRoute><Itinerario /></ProtectedRoute>} />
          <Route path="/componentes" element={<ProtectedRoute><RequirePermission moduleCode={'COMPONENTES'}><Componentes /></RequirePermission></ProtectedRoute>} />
          <Route path="/servicios" element={<ProtectedRoute><RequirePermission moduleCode={'SERVICIOS'}><Services /></RequirePermission></ProtectedRoute>} />
          <Route path="/proveedores" element={<ProtectedRoute><RequirePermission moduleCode={'PROVEEDORES'}><Proveedores /></RequirePermission></ProtectedRoute>} />
          <Route path="/cotizaciones" element={<ProtectedRoute><RequirePermission moduleCode={'COTIZACION'}><Cotizaciones /></RequirePermission></ProtectedRoute>} />
          <Route path="/cotizaciones/nuevo" element={<ProtectedRoute><CotizacionForm /></ProtectedRoute>} />
          <Route path="/cotizaciones/:id" element={<ProtectedRoute><CotizacionForm /></ProtectedRoute>} />
          <Route path="/proveedores/detalles" element={<ProtectedRoute><DetallesProveedores /></ProtectedRoute>} />
          <Route path="/proveedores/tarifario" element={<ProtectedRoute><Tarifario /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><RequirePermission moduleCode={'CLIENTES'}><Clientes /></RequirePermission></ProtectedRoute>} />
          <Route path="/clientes/nuevo" element={<ProtectedRoute><ClientPage /></ProtectedRoute>} />
          <Route path="/clientes/:id" element={<ProtectedRoute><ClientPage /></ProtectedRoute>} />
          <Route path="/registro-pagos" element={<ProtectedRoute><RequirePermission moduleCode={'REGISTRO_PAGOS'}><RegistroPagos /></RequirePermission></ProtectedRoute>} />
          <Route path="/registro-pagos/reporte" element={<ProtectedRoute><Reporte /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><RequirePermission moduleCode={'REPORTES'}><ReportesHome /></RequirePermission></ProtectedRoute>} />
          <Route path="/reportes/bandeja-solicitud" element={<ProtectedRoute><RequirePermission moduleCode={'REPORTES'}><BandejaSolicitudReporte /></RequirePermission></ProtectedRoute>} />
          <Route path="/reportes/cotizacion" element={<ProtectedRoute><RequirePermission moduleCode={'REPORTES'}><CotizacionReporte /></RequirePermission></ProtectedRoute>} />
          <Route path="/permisos" element={<ProtectedRoute><RequirePermission moduleCode={'PERMISOS'}><Permisos /></RequirePermission></ProtectedRoute>} />
          <Route path="/servicios/portada" element={<ProtectedRoute><PortadaMenu /></ProtectedRoute>} />
        </Routes>
      </div>

    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <ModalProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificationProvider>
        </ModalProvider>
      </PermissionsProvider>
    </AuthProvider>
  );
}

export default App;
