import "../styles/Menu.css"

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { useModal } from "../../../contexts/ModalContext";
import { usePermissions } from '../../../contexts/PermissionsContext';


const Menu = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { isModalOpen } = useModal();
    const { has, isAdmin } = usePermissions();
    // Debug en montaje
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[Menu] isAdmin:', isAdmin);
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className={`menu-app ${isModalOpen ? 'menu-app-modal' : ''}`}>
            <div className="menu-logo">
                <img src="logo_mtg.png" alt="Logo" />
                {user?.username && (
                    <div className="menu-user-name">{user.username}</div>
                )}
            </div>
            <div className="menu-links">
                {has('BANDEJA_SOLICITUD','VIEW') && <Button label="Bandeja de solicitud" text size="small" icon="pi pi-home" onClick={() => navigate('/bandeja-solicitud')} title="Bandeja de solicitud" />}
                {has('CLIENTES','VIEW') && <Button label="Clientes" text size="small" icon="pi pi-users" onClick={() => navigate('/clientes')} title="Clientes" />}
                {has('COTIZACION','VIEW') && <Button label="Cotización" text size="small" icon="pi pi-money-bill" onClick={() => navigate('/cotizaciones')} title="Cotización" />}
                {has('PROVEEDORES','VIEW') && <Button label="Proveedores" text size="small" icon="pi pi-users" onClick={() => navigate('/proveedores')} title="Proveedores" />}
                {has('REGISTRO_PAGOS','VIEW') && <Button label="Registro de pagos" text size="small" icon="pi pi-credit-card" onClick={() => navigate('/registro-pagos')} title="Registro de pagos" />}
                {has('PLANTILLA_ITINERARIO','VIEW') && <Button label="Plantilla itineraria" text size="small" icon="pi pi-list" onClick={() => navigate('/itinerario')} title="Plantilla itineraria" />}
                {has('SERVICIOS','VIEW') && <Button label="Servicios" text size="small" icon="pi pi-flag" onClick={() => navigate('/servicios')} title="Servicios" />}
                {has('COMPONENTES','VIEW') && <Button label="Componentes" text size="small" icon="pi pi-book" onClick={() => navigate('/componentes')} title="Componentes" />}
                {has('REPORTES','VIEW') && <Button label="Reportes" text size="small" icon="pi pi-list-check" onClick={() => navigate('/reportes')} title="Reportes" />}
            </div>
            <div className="menu-options">
                {isAdmin && <Button label="Permisos" text size="small" icon="pi pi-lock" onClick={() => navigate('/permisos')} title="Permisos" />}
                <Button label="Cerrar sesión" text size="small" icon="pi pi-sign-out" onClick={handleLogout} title="Cerrar sesión" />
            </div>
        </div>
    )
}

export default Menu;