import React from 'react';
import { InputText } from 'primereact/inputtext';

function Login() {
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
          <InputText placeholder="Contraseña" />
        </div>
      </div>
    </div>
  );
}

export default Login;


