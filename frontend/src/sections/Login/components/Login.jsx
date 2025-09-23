import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/apiService';
import { useNotification } from '../../Notification/NotificationContext';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import "../styles/Login.css"

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showNotification('Por favor, completa todos los campos', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.login(username, password);
      
      // Usar el contexto de autenticación
      login(response.user, response.token);
      navigate('/itinerario');
      
    } catch (error) {
      showNotification(error.message || 'Error en la autenticación', 'error');

    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  
  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={process.env.PUBLIC_URL + '/logo_mtg.png'} alt="MTG" style={{ height: 48 }} />
        </div>
        
        <div className="p-input-icon-left" style={{ marginBottom: 12 }}>
          <i className="pi pi-user" />
          <InputText 
            placeholder="Usuario" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            disabled={loading}
          />
        </div>
        
        <div className="p-input-icon-left login-password-group" style={{ marginBottom: 12 }}>
          <i className="pi pi-lock" />
          <InputText 
            placeholder="Contraseña" 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            disabled={loading}
          />
          <span
            className="login-password-eye"
            role="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={toggleShowPassword}
          >
            <i className={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'} />
          </span>
        </div>
        
        <Button 
          label={loading ? 'Autenticando...' : 'Acceder al sistema'} 
          className="p-button" 
          style={{ width: '100%' }}
          onClick={handleLogin}
          disabled={loading}
          loading={loading}
        />
        
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/forgot-password" className="forgot-password-link">
            ¿Olvidaste contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;


