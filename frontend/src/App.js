import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import RecoverPassword from './sections/Login/components/RecoverPassword';
import Login from './sections/Login/components/Login';
import Menu from './sections/Menu/components/Menu';
import Itinerario from './sections/Itinerario/components/Itinerario';


function AppContent() {
  const location = useLocation();
  const hideMenu = location.pathname === '/recuperar-contrasena' || location.pathname === '/';
  return (
    <>
      {!hideMenu && <Menu />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
        <Route path="/itinerario" element={<Itinerario />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
