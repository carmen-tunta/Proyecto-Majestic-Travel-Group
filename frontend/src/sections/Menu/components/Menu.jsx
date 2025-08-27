import "../styles/Menu.css"
import { Button } from "primereact/button";

const Menu = () => {
    return (
        <div className="menu-app">
            <div className="menu-logo">
                <img src="logo_mtg.png" alt="Logo" />
            </div>
            <div className="menu-links">
                <Button label="Principal" text size="small" icon="pi pi-home"/>
                <Button label="Clientes" text size="small" icon="pi pi-users"/>
                <Button label="Cotización" text size="small" icon="pi pi-money-bill"/>
                <Button label="Itinerario" text size="small" icon="pi pi-file"/>
                <Button label="Proveedores" text size="small" icon="pi pi-users"/>
                <Button label="Registro de pagos" text size="small" icon="pi pi-credit-card"/>
                <Button label="Plantilla itineraria" text size="small" icon="pi pi-list"/>
                <Button label="Servicios" text size="small" icon="pi pi-flag"/>
                <Button label="Componentes" text size="small" icon="pi pi-book"/>
                <Button label="Reportes" text size="small" icon="pi pi-list-check"/>
            </div>
            <div className="menu-options">
                <Button label="Permisos" text size="small" icon="pi pi-lock"/>
                <Button label="Cerrar sesión" text size="small" icon="pi pi-sign-out"/>
            </div>
        </div>
    )
}

export default Menu;