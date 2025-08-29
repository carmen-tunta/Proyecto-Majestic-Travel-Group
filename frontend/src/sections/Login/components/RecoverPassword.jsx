import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import "../styles/RecoverPassword.css"
        

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        console.log('¡Correo de recuperación enviado!');
      } else {
        console.log('No se pudo enviar el correo. Verifica el email.');
      }
    } catch (error) {
      console.log('Error de conexión con el servidor.');
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