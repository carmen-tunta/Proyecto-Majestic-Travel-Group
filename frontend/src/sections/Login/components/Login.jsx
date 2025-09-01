import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/apiService';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Validación básica
    if (!username.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Llamar al servicio de API real
      const response = await apiService.login(username, password);
      
      // Guardar datos en localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirigir a la página de itinerario
      navigate('/itinerario');
      
    } catch (error) {
      setError(error.message || 'Error en la autenticación');
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
        
        {error && (
          <div style={{ 
            color: '#dc3545', 
            textAlign: 'center', 
            marginBottom: 12, 
            fontSize: '14px',
            padding: '8px',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}
        
        <div className="p-inputgroup" style={{ marginBottom: 12 }}>
          <span className="p-inputgroup-addon">
            <i className="pi pi-user" />
          </span>
          <InputText 
            placeholder="Usuario" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            disabled={loading}
          />
        </div>
        
        <div className="p-inputgroup" style={{ marginBottom: 12 }}>
          <span className="p-inputgroup-addon">
            <i className="pi pi-lock" />
          </span>
          <InputText 
            placeholder="Contraseña" 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            disabled={loading}
          />
          <span
            className="p-inputgroup-addon"
            role="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={toggleShowPassword}
            style={{ cursor: 'pointer' }}
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
          <Link to="/recuperar-contrasena" style={{ textDecoration: 'none', color: '#007bff' }}>
            ¿Olvidaste contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;


