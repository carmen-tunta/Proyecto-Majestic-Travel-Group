import React, { useEffect, useState } from 'react';
import "../styles/ResetPassword.css"
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNotification } from '../../Notification/NotificationContext';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const passwordMatch = password && confirmPassword && password === confirmPassword;
    const showError = password && confirmPassword && password !== confirmPassword;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ token, newPassword: password }),
            });
            if (response.ok) {
                showNotification('Contraseña restablecida con éxito, regresando a la página de inicio.', 'success');
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || 'Error al restablecer la contraseña.', 'error');
            }
        } catch (error) {
            showNotification('Error de conexión, por favor intenta nuevamente más tarde.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return ( 
    <div className="reset-password">
        <form onSubmit={handleSubmit}>
            <i className="pi pi-arrow-left comeback" onClick={() => navigate('/')}></i>
            <div style={{ textAlign: 'center'}}>
                <img src={process.env.PUBLIC_URL + '/logo_grande.png'} alt="MTG" style={{ height: '5rem' }} />
            </div>
            <h1>Restablecer Contraseña</h1>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <InputText 
                    type={showPassword ? "text" : "password"}
                    placeholder="Nueva contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                />
                <Button
                    type="button"
                    icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                    className="p-button-text"
                    style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '15%',
                        transform: 'translateY(-50%)',
                        padding: 0,
                        minWidth: '2rem',
                        height: '2rem'
                    }}
                    onClick={() => setShowPassword(prev => !prev)}
                    tabIndex={-1}
                />
            </div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <InputText 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                />
                <Button
                    type="button"
                    icon={showConfirmPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                    className="p-button-text"
                    style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '15%',
                        transform: 'translateY(-50%)',
                        padding: 0,
                        minWidth: '2rem',
                        height: '2rem'
                    }}
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    tabIndex={-1}
                />
            </div>
            {showError && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    Las contraseñas no coinciden.
                </div>
            )}
            <Button 
                className='reset-button'
                type="submit"
                label={loading ? "Cargando..." : "Restablecer"}
                disabled={!passwordMatch || loading}
            />
        </form>
    </div> );
}

export default ResetPassword;
