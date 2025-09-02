import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import "../styles/RecoverPassword.css"
import { useNotification } from '../../Notification/NotificationContext';        

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const { showNotification } = useNotification();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className='recover-password'>
      <form className="recover-form" onSubmit={handleSubmit}>
        <div className="p-input-icon-left">
            <i className="pi pi-envelope"/>
            <InputText 
              type="email" 
              placeholder="Correo" 
              className='p-inputtext-sm'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
        </div>
        <Button label="Recuperar contraseña" size='small' type='submit'/>
      </form>
    </div>
  );
};

export default RecoverPassword