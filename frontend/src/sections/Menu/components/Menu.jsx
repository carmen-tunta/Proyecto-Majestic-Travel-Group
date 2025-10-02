import "../styles/Menu.css"

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { useModal } from "../../../contexts/ModalContext";
import { useEffect, useState } from 'react';
import { apiService } from '../../../services/apiService';


const Menu = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { isModalOpen } = useModal();
    const [loadingPerms, setLoadingPerms] = useState(true);
    const [myModules, setMyModules] = useState([]); // array de { module, actions }

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await apiService.getMyPermissions();
                if (mounted) setMyModules(data.modules || []);
            } catch (e) {
                // si falla, mantenemos lista vacía (oculta todo lo protegido)
                if (mounted) setMyModules([]);
            } finally {
                if (mounted) setLoadingPerms(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const canView = (code) => apiService.hasView(myModules, code);
    const noAccess = (code) => !loadingPerms && !canView(code);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className={`menu-app ${isModalOpen ? 'menu-app-modal' : ''}`}>
            <div className="menu-logo">
                <img src="logo_mtg.png" alt="Logo" />
            </div>
            <div className="menu-links">
                <Button label="Bandeja de solicitud" text size="small" icon="pi pi-home" onClick={() => canView('BANDEJA_SOLICITUD')&&navigate('/bandeja-solicitud')} disabled={noAccess('BANDEJA_SOLICITUD')} tooltip={noAccess('BANDEJA_SOLICITUD')? 'Sin acceso (asigne VIEW en Permisos)' : undefined} />
                <Button label="Clientes" text size="small" icon="pi pi-users" onClick={() => canView('CLIENTES')&&navigate('/clientes')} disabled={noAccess('CLIENTES')} tooltip={noAccess('CLIENTES')? 'Sin acceso' : undefined} />
                <Button label="Cotización" text size="small" icon="pi pi-money-bill" onClick={() => canView('COTIZACION')&&navigate('/cotizaciones')} disabled={noAccess('COTIZACION')} tooltip={noAccess('COTIZACION')? 'Sin acceso' : undefined} />
                <Button label="Itinerario" text size="small" icon="pi pi-file" onClick={() => canView('ITINERARIO')&&navigate('/itinerario')} disabled={noAccess('ITINERARIO')} tooltip={noAccess('ITINERARIO')? 'Sin acceso' : undefined} />
                <Button label="Proveedores" text size="small" icon="pi pi-users" onClick={() => canView('PROVEEDORES')&&navigate('/proveedores')} disabled={noAccess('PROVEEDORES')} tooltip={noAccess('PROVEEDORES')? 'Sin acceso' : undefined} />
                <Button label="Registro de pagos" text size="small" icon="pi pi-credit-card" onClick={() => canView('REGISTRO_PAGOS')&&navigate('/registro-pagos')} disabled={noAccess('REGISTRO_PAGOS')} tooltip={noAccess('REGISTRO_PAGOS')? 'Sin acceso' : undefined} />
                <Button label="Plantilla itineraria" text size="small" icon="pi pi-list" onClick={() => canView('PLANTILLA_ITINERARIA')&&navigate('/itinerario')} disabled={noAccess('PLANTILLA_ITINERARIA')} tooltip={noAccess('PLANTILLA_ITINERARIA')? 'Sin acceso' : undefined} />
                <Button label="Servicios" text size="small" icon="pi pi-flag" onClick={() => canView('SERVICIOS')&&navigate('/servicios')} disabled={noAccess('SERVICIOS')} tooltip={noAccess('SERVICIOS')? 'Sin acceso' : undefined} />
                <Button label="Componentes" text size="small" icon="pi pi-book" onClick={() => canView('COMPONENTES')&&navigate('/componentes')} disabled={noAccess('COMPONENTES')} tooltip={noAccess('COMPONENTES')? 'Sin acceso' : undefined} />
                <Button label="Reportes" text size="small" icon="pi pi-list-check" onClick={() => canView('REPORTES')&&navigate('/reportes')} disabled={noAccess('REPORTES')} tooltip={noAccess('REPORTES')? 'Sin acceso' : undefined} />
                {loadingPerms && <span style={{fontSize: '11px', opacity: 0.6}}>Cargando permisos...</span>}
            </div>
            <div className="menu-options">
                <Button label="Permisos" text size="small" icon="pi pi-lock" onClick={() => canView('USUARIOS')&&navigate('/permisos')} disabled={noAccess('USUARIOS')} tooltip={noAccess('USUARIOS')? 'Sin acceso' : undefined} />
                <Button label="Cerrar sesión" text size="small" icon="pi pi-sign-out" onClick={handleLogout}/>
            </div>
        </div>
    )
}

export default Menu;