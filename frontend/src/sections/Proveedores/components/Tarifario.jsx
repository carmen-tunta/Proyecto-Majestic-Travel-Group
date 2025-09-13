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
import { useNotification } from "../../Notification/NotificationContext";
import { useModal } from "../../../contexts/ModalContext";
import "../styles/Tarifario.css"
import TarifarioRepository from "../../../modules/Tarifario/repository/TarifarioRepository";
import GetTarifarioByIdProveedor from "../../../modules/Tarifario/application/GetTarifarioByIdProveedor";
import CreateTarifario from "../../../modules/Tarifario/application/CreateTarifario";
import UpdateTarifario from "../../../modules/Tarifario/application/UpdateTarifario";


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

    const tarifarioRepo = new TarifarioRepository();
    const getTarifarioByIdProveedor = new GetTarifarioByIdProveedor(tarifarioRepo);
    const createTarifario = new CreateTarifario(tarifarioRepo);
    const updateTarifario = new UpdateTarifario(tarifarioRepo);

    const [tarifa, setTarifa] = useState(null);
    const [validityFrom, setValidityFrom] = useState('');
    const [validityTo, setValidityTo] = useState('');
    const [observation, setObservation] = useState('');
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(false);

    const onClose = () => {
        navigate(-1);
    };

    const fetchTarifa = async (proveedorId) => {
        setLoading(true);
        try {
            const tarifaData = await getTarifarioByIdProveedor.execute(proveedorId);
            const tarifaObj = Array.isArray(tarifaData) ? tarifaData[0] : tarifaData;
            setTarifa(tarifaObj);
            console.log(tarifaObj);
        } catch (error) {
            console.error('Error al obtener el tarifario:', error);
            setTarifa(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (proveedor && proveedor.id) {
            fetchTarifa(proveedor.id);
        }
    }, [proveedor]);

    useEffect(() => {
        if (tarifa) {
            setValidityFrom(tarifa.validityFrom || '');
            setValidityTo(tarifa.validityTo || '');
            setObservation(tarifa.observation || '');
        } else {
            setValidityFrom('');
            setValidityTo('');
            setObservation('');
        }
    }, [tarifa]);

    const handleSaveTarifario = async () => {
        setLoading(true);
        try {
            if (tarifa && tarifa.id) {
                const tarifarioActualizado = await updateTarifario.execute({
                    ...tarifa,
                    validityFrom,
                    validityTo,
                    observation
                });
                setTarifa(tarifarioActualizado);
                showNotification('Cabecera actualizada con éxito!', 'success');
            } else {
                const nuevoTarifario = await createTarifario.execute({
                    validityFrom,
                    validityTo,
                    observation,
                    proveedorId: proveedor.id
                });
                setTarifa(nuevoTarifario);
                showNotification('Cabecera registrada con éxito!', 'success');
            }
        } catch (error) {
            showNotification('Error al guardar la cabecera', 'error');
            console.log(error);
        } finally {
            setLoading(false);
        }
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
            <>
            {loading ? (
                <div>Cargando...</div>
            ) : (
            <div className="tarifa-header">
                <FloatLabel >
                    <InputText 
                        id="validityFrom"
                        value={validityFrom}
                        onChange={(e) => setValidityFrom(e.target.value)}
                    />
                    <label htmlFor="validityFrom">Vigencia desde</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText 
                        id="validityTo"
                        value={validityTo}
                        onChange={(e) => setValidityTo(e.target.value)}
                    />
                    <label htmlFor="validityTo">Vigencia hasta</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText 
                        id="observation"
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                    />
                    <label htmlFor="observation">Observación</label>
                </FloatLabel>
                <Button
                    label= {tarifa ? "Guardar cambios" : "Guardar para continuar"}
                    text
                    onClick={handleSaveTarifario}
                />
            </div>
            )}
            </>
        )}
        {activeIndex === 1 && (
            <div></div>
        )}
        {activeIndex === 2 && (
            <div></div>
        )}

    </div>
  );
}

export default Tarifario;
