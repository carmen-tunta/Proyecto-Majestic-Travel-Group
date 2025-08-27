import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecoverPassword from './sections/Login/components/RecoverPassword';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
