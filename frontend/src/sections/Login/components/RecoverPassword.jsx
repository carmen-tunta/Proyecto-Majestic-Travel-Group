import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import "../styles/RecoverPassword.css"
import { useNotification } from '../../Notification/NotificationContext';        

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        showNotification('¡Correo de recuperación enviado!', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Surgió un error al enviar el correo', 'error');
      }
    } catch (error) {
      showNotification('Error de conexión con el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='recover-password'>
      <form className="recover-form" onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={process.env.PUBLIC_URL + '/logo_mtg.png'} alt="MTG" style={{ height: '5rem' }} />
        </div>
        <div className="p-input-icon-left">
            <i className="pi pi-envelope"/>
            <InputText 
              type="email" 
              placeholder="Correo" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
        </div>
        <Button 
          label={loading ? "Cargando..." : "Recuperar contraseña"} 
          type='submit' 
          disabled={loading}
          loading={loading}
        />
      </form>
    </div>
  );
};

export default RecoverPassword