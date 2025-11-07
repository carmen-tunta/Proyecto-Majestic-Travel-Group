import { useNavigate, useLocation } from "react-router-dom";
import { TabMenu } from "primereact/tabmenu";
import { useEffect, useState } from "react";
import TarifaMenu from "./Tarifa";
import Incremento from "./Incremento";
import Documents from "./Documents";
import "../../styles/Tarifario/Tarifario.css"

const Tarifario = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const proveedor = location.state?.proveedor;
    const [activeIndex, setActiveIndex] = useState(0);
    const [tarifa, setTarifa] = useState(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);


    const items = [
        { label: 'Tarifa'},
        { label: 'Incremento', disabled: !tarifa },
        { label: 'Documentos', disabled: !tarifa }
    ];

    const onClose = () => {
        navigate(-1);
    };
    
    return (
    <div className="tarifario">
        <div className="tarifario-header">
            <div className="header-icon">
                <i className="pi pi-arrow-left" onClick={onClose}></i>
                <div>Proveedores</div>
            </div>
            <div className={`proveedor-info ${isMobile ? 'proveedor-info-mobile' : ''}`}>
                <span className="proveedor-name">{proveedor?.name}</span>
                <span>{proveedor?.serviceType}</span>
                <span>{proveedor?.city}</span>
            </div>
        </div>
        <TabMenu
            model={items}
            activeIndex={activeIndex} 
            onTabChange={(e) => {
                setActiveIndex(e.index);
            }} 
            className={isMobile ? 'tabmenu-mobile' : ''}
        />

        {activeIndex === 0 && (
            <div>
                <TarifaMenu
                    proveedor={proveedor}
                    tarifa={tarifa}
                    setTarifa={setTarifa}
                />
            </div>
        )}
        {activeIndex === 1 && (
            <div>
                <Incremento
                    tarifa={tarifa}
                />
            </div>
        )}
        {activeIndex === 2 && (
            <div>
                <Documents
                    tarifario={tarifa}
                />
            </div>
        )}

    </div>
  );
}

export default Tarifario;
