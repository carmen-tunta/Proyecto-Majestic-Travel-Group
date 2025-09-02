import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import RecoverPassword from './sections/Login/components/RecoverPassword';
import Login from './sections/Login/components/Login';
import Menu from './sections/Menu/components/Menu';
import Itinerario from './sections/Itinerario/components/Itinerario';
import ResetPassword from './sections/Login/components/ResetPassword';
import { NotificationProvider } from './sections/Notification/NotificationContext';


function AppContent() {
  const location = useLocation();
  const hideMenu = location.pathname === '/forgot-password' || location.pathname === '/'|| location.pathname === '/reset-password'  ;
  return (
    <>
      {!hideMenu && <Menu />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<RecoverPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/itinerario" element={<Itinerario />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <Router>
        <AppContent />
      </Router>
    </NotificationProvider>
  );
}

export default App;
