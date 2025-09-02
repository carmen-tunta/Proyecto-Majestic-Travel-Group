import React, { useState } from 'react';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNotification } from '../../Notification/NotificationContext';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ token, newPassword: password }),
            });
            if (response.ok) {
                showNotification('Contraseña restablecida con éxito.', 'success');
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || 'Error al restablecer la contraseña.', 'error');
            }
        } catch (error) {
            showNotification('Error de conexión, por favor intenta nuevamente más tarde.', 'error');
        }
    };

    return ( <div className="reset-password">
        <form onSubmit={handleSubmit}>
            <h1>Restablecer Contraseña</h1>
            <InputText 
                type="password" 
                placeholder="Nueva Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <Button type="submit" label="Restablecer" />
        </form>
    </div> );
}

export default ResetPassword;
