import "../styles/Menu.css"

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { useModal } from "../../../contexts/ModalContext";
import { usePermissions } from '../../../contexts/PermissionsContext';


const Menu = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
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
            </div>
            <div className="menu-links">
                {has('BANDEJA_SOLICITUD','VIEW') && <Button label="Bandeja de solicitud" text size="small" icon="pi pi-home" onClick={() => navigate('/bandeja-solicitud')} />}
                {has('CLIENTES','VIEW') && <Button label="Clientes" text size="small" icon="pi pi-users" onClick={() => navigate('/clientes')} />}
                {has('COTIZACION','VIEW') && <Button label="Cotización" text size="small" icon="pi pi-money-bill" onClick={() => navigate('/cotizaciones')} />}
                {has('ITINERARIO','VIEW') && <Button label="Itinerario" text size="small" icon="pi pi-file" onClick={() => navigate('/itinerario')} />}
                {has('PROVEEDORES','VIEW') && <Button label="Proveedores" text size="small" icon="pi pi-users" onClick={() => navigate('/proveedores')} />}
                {has('REGISTRO_PAGOS','VIEW') && <Button label="Registro de pagos" text size="small" icon="pi pi-credit-card" onClick={() => navigate('/registro-pagos')} />}
                {has('PLANTILLA_ITINERARIO','VIEW') && <Button label="Plantilla itineraria" text size="small" icon="pi pi-list" onClick={() => navigate('/itinerario')} />}
                {has('SERVICIOS','VIEW') && <Button label="Servicios" text size="small" icon="pi pi-flag" onClick={() => navigate('/servicios')} />}
                {has('COMPONENTES','VIEW') && <Button label="Componentes" text size="small" icon="pi pi-book" onClick={() => navigate('/componentes')} />}
                {has('REPORTES','VIEW') && <Button label="Reportes" text size="small" icon="pi pi-list-check" onClick={() => navigate('/reportes')} />}
            </div>
            <div className="menu-options">
                {isAdmin && <Button label="Permisos" text size="small" icon="pi pi-lock" onClick={() => navigate('/permisos')} />}
                <Button label="Cerrar sesión" text size="small" icon="pi pi-sign-out" onClick={handleLogout}/>
            </div>
        </div>
    )
}

export default Menu;