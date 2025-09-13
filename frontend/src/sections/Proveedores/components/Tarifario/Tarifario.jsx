import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useNotification } from "../../../Notification/NotificationContext";
import { useModal } from "../../../../contexts/ModalContext";
import "../../styles/Tarifario/Tarifario.css"
import TarifarioRepository from "../../../../modules/Tarifario/repository/TarifarioRepository";
import GetTarifarioByIdProveedor from "../../../../modules/Tarifario/application/GetTarifarioByIdProveedor";
import CreateTarifario from "../../../../modules/Tarifario/application/CreateTarifario";
import UpdateTarifario from "../../../../modules/Tarifario/application/UpdateTarifario";
import TarifaMenu from "./Tarifa";

const Tarifario = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const proveedor = location.state?.proveedor;
    const [activeIndex, setActiveIndex] = useState(0);
    const items = [
        { label: 'Tarifa'},
        { label: 'Incremento', disabled: !proveedor },
        { label: 'Documentos', disabled: !proveedor }
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
            <div className="proveedor-info">
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
        />

        {activeIndex === 0 && (
            <div>
                <TarifaMenu
                    proveedor={proveedor}
                />
            </div>
        )}
        {activeIndex === 1 && (
            <div>

            </div>
        )}
        {activeIndex === 2 && (
            <div></div>
        )}

    </div>
  );
}

export default Tarifario;
