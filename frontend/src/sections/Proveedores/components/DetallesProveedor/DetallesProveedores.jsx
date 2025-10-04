import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import Contact from "./Contact";
import FormProveedor from "./FormProveedor";
import "../../styles/DetallesProveedores.css"


const DetallesProveedores = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const proveedor = location.state?.proveedor;
    const [proveedorState, setProveedorState] = useState(proveedor || null);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const items = [
        { label: 'Detalles'},
        { label: 'Medio de contacto', disabled: !proveedorState },
    ];

    const onClose = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (proveedor) {
            setProveedorState(proveedor);
        }
    }, [proveedor]);

    return (
        <div className="menu-edition">
            <div className="header">
                <div className="header-icon">
                    <i className="pi pi-arrow-left" onClick={onClose}></i>
                    <div>Proveedores</div>
                </div>
                <div className="proveedor-name">{proveedorState?.name}</div>
            </div>
            <TabMenu 
                model={items} 
                activeIndex={activeIndex} 
                onTabChange={(e) => {setActiveIndex(e.index);}} 
            />

            {activeIndex === 0 && (
                <FormProveedor
                    proveedor={proveedorState}
                    setProveedorState={setProveedorState}
                    setActiveIndex={setActiveIndex}
                />
            )}
            {activeIndex === 1 && (
                <Contact 
                    proveedor={proveedorState} 
                />
            )}
        </div>
    )
}

export default DetallesProveedores;