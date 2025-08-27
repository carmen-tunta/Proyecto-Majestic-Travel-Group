import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={process.env.PUBLIC_URL + '/logo_mtg.png'} alt="MTG" style={{ height: 48 }} />
        </div>
        <div className="p-inputgroup" style={{ marginBottom: 12 }}>
          <span className="p-inputgroup-addon">
            <i className="pi pi-user" />
          </span>
          <InputText placeholder="Usuario" />
        </div>
        <div className="p-inputgroup" style={{ marginBottom: 12 }}>
          <span className="p-inputgroup-addon">
            <i className="pi pi-lock" />
          </span>
          <InputText placeholder="Contraseña" type={showPassword ? 'text' : 'password'} />
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
        <Button label="Acceder al sistema" className="p-button" style={{ width: '100%' }} />
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/recuperar-contrasena" style={{ textDecoration: 'none' }}>
            ¿Olvidaste contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;


