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
import "../../styles/Tarifario/Tarifa.css"
import TarifarioRepository from "../../../../modules/Tarifario/repository/TarifarioRepository";
import GetTarifarioByIdProveedor from "../../../../modules/Tarifario/application/GetTarifarioByIdProveedor";
import CreateTarifario from "../../../../modules/Tarifario/application/CreateTarifario";
import UpdateTarifario from "../../../../modules/Tarifario/application/UpdateTarifario";
import useSearch from "../../../../hooks/useSearch";
import { apiService } from "../../../../services/apiService";
import SearchBar from "../../../../components/SearchBar";
import TarifaComponentRepository from "../../../../modules/TarifaComponent/repository/TarifaComponentRepository";
import GetTarifaComponentByIdTarifa from "../../../../modules/TarifaComponent/application/GetTarifaComponentByIdTarifa";
import CreateTarifaComponent from "../../../../modules/TarifaComponent/application/CreateTarifaComponent";
import DeleteTarifaComponent from "../../../../modules/TarifaComponent/application/DeleteTarifaComponent";

const TarifaMenu = ({ proveedor }) => {
    const [loading, setLoading] = useState(false);
    const [tarifa, setTarifa] = useState(null);
    const [validityFrom, setValidityFrom] = useState('');
    const [validityTo, setValidityTo] = useState('');
    const [observation, setObservation] = useState('');
    const { showNotification } = useNotification();
    const [selectedComponents, setSelectedComponents] = useState([]);
    
    const [columns, setColumns] = useState([]);
    const [modalColumn, setModalColumn] = useState(false);
    const [columnDescription, setColumnDescription] = useState('');
    const [paxMin, setPaxMin] = useState('');
    const [paxMax, setPaxMax] = useState('');

    
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);


    const tarifarioRepo = new TarifarioRepository();
    const getTarifarioByIdProveedor = new GetTarifarioByIdProveedor(tarifarioRepo);
    const createTarifario = new CreateTarifario(tarifarioRepo);
    const updateTarifario = new UpdateTarifario(tarifarioRepo);

    const tarifaComponentRepo = new TarifaComponentRepository();
    const getTarifaComponentByIdTarifa = new GetTarifaComponentByIdTarifa(tarifaComponentRepo);
    const createTarifaComponent = new CreateTarifaComponent(tarifaComponentRepo);
    const deleteTarifaComponent = new DeleteTarifaComponent(tarifaComponentRepo);

    const parseLocalDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    };
    addLocale('es', {
        firstDayOfWeek: 1,
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        today: 'Hoy',
        clear: 'Limpiar'
    });
    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('components', q));


    const handleAddComponent = async (comp) => {
        setSearch('');
        if (!selectedComponents.some(c => c.id === comp.id)) {
            const newComp = { ...comp };
            
            try {
                await createTarifaComponent.execute(
                    {
                        tarifa_id: tarifa.id,
                        componente_id: newComp.id
                    }
                );
                columns.forEach(col => {
                newComp[col.field] = 0;
            });
                setSelectedComponents([...selectedComponents, newComp]);
                console.log('Componente agregado:', selectedComponents);
            } catch (error) {
                console.error('Error al crear el componente:', error);
                showNotification('Error al agregar el componente', 'error');
            }
        }
    };

    const handleAddColumn = () => {
        const newField = `col_${columns.length + 1}`;
        setColumns([
            ...columns,
            {   
                field: newField,
                header: <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div>{columnDescription}</div>
                            <div>{paxMin}-{paxMax}</div>
                        </div>
            }
        ]);
        setSelectedComponents(selectedComponents.map(comp => ({
            ...comp,
            [newField]: 0
        })));
        setModalColumn(false);
        setColumnDescription('');
        setPaxMin('');
        setPaxMax('');
    };

    const fetchTarifa = async (proveedorId) => {
        setLoading(true);
        try {
            const tarifaData = await getTarifarioByIdProveedor.execute(proveedorId);
            const tarifaObj = Array.isArray(tarifaData) ? tarifaData[0] : tarifaData;
            setTarifa(tarifaObj);
            const tarifaComponentData = await getTarifaComponentByIdTarifa.execute(tarifaObj.id);
            const tarifaComponentArray = tarifaComponentData.map(item => item.component);
            setSelectedComponents(tarifaComponentArray);
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
            setValidityFrom(parseLocalDate(tarifa.validityFrom) || null);
            setValidityTo( parseLocalDate(tarifa.validityTo) || null);
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

    const onCellEditComplete = (e) => {
        const { rowData, newValue, field } = e;
        const updated = selectedComponents.map(comp =>
            comp.id === rowData.id ? { ...comp, [field]: newValue } : comp
        );
        setSelectedComponents(updated);
    };

    // Editor para celdas numéricas
    const cellEditor = (options) => {
        return (
            <InputText
                type="number"
                min={0}
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                style={{ width: '100%', margin: 0, alignContent: 'center', textAlign: 'center' }}
                onWheel={e => e.target.blur()}
            />
        );
    };

    const handleDeleteIconComponentClick = (component) => {
        setComponentToDelete(component);
        setVisibleDialog(true);
    };

    const reject = () => {
        setComponentToDelete(null);
        setVisibleDialog(false);
    };

    const handleDeleteComponent = async () => {
        if (!tarifa || !tarifa.id) {
            showNotification('No hay tarifa guardada para eliminar componentes.', 'error');
            return;
        }

        try {
            await deleteTarifaComponent.execute(tarifa.id, componentToDelete.id);
            setSelectedComponents((prev) => prev.filter((comp) => comp.id !== componentToDelete.id));
            setComponentToDelete(null);
            setVisibleDialog(false);
            showNotification('Componente eliminado con éxito.', 'success');
        } catch (error) {
            showNotification('Error al eliminar el componente.', 'error');
            console.error(error);
        }
    };

    const componentBodyTemplate = (rowData) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <i
                className="pi pi-trash"
                style={{ cursor: 'pointer', marginRight: 8 }}
                title="Eliminar componente"
                onClick={() => handleDeleteIconComponentClick(rowData)}
            />
            <span>{rowData.componentName}</span>
        </div>
    );


    return (
        <>
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <div className="tarifa-header">
                    <FloatLabel className="tarifa-validity">
                        <Calendar
                            id="validityFrom" 
                            value={validityFrom} 
                            onChange={(e) => setValidityFrom(e.value)} 
                            dateFormat="D dd M y"
                            locale="es"
                            required
                        />
                        <label htmlFor="validityFrom">Vigencia desde</label>
                    </FloatLabel>
                    <FloatLabel className="tarifa-validity">
                        <Calendar
                            id="validityTo"
                            value={validityTo}
                            onChange={(e) => setValidityTo(e.target.value)}
                            dateFormat="D dd M y"
                            locale="es"
                            required
                        />
                        <label htmlFor="validityTo">Vigencia hasta</label>
                    </FloatLabel>
                    <FloatLabel className="tarifa-observation">
                        <InputText 
                            id="observation"
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                        />
                        <label htmlFor="observation">Observación</label>
                    </FloatLabel>
                    <Button
                        className="tarifa-save-button"
                        label= {tarifa ? "Guardar cambios" : "Guardar para continuar"}
                        text
                        onClick={handleSaveTarifario}
                    />
                </div>
            )}

            {tarifa && (
                <div className="tarifa-body">
                    Tarifa
                    <div className="tarifa-content">
                        <div className="scrolling-table">
                        <DataTable 
                            value={selectedComponents}
                            scrollable
                            scrollHeight="flex" 
                            editMode="cell"
                            loading={loading}
                        >
                            <Column 
                                style={{ minWidth: '25vw', backgroundColor: '#ffffff', border: 'none' }}
                                field="componentName"
                                body={componentBodyTemplate}
                                header={
                                    <div>
                                        <SearchBar value={search} onChange={setSearch} placeholder="Buscar componentes..." />
                                        {search && results.length > 0 && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '4rem', // ajusta según la altura del input
                                                    left: '1.25rem',
                                                    width: '22vw',
                                                    background: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: 4,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                    zIndex: 10,
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                }}
                                            >
                                                {results
                                                    .filter(comp => !selectedComponents.some(sc => sc.id === comp.id)) 
                                                    .map(comp => (
                                                    <div
                                                        key={comp.id}
                                                        style={{
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #eee'
                                                        }}
                                                        onClick={() => handleAddComponent(comp)}
                                                    >
                                                        {comp.componentName} <span style={{ color: '#888' }}>({comp.serviceType})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                }
                            />

                            {columns.map(col => (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    editor={cellEditor}
                                    bodyClassName="tarifa-dynamic-cell"
                                    onCellEditComplete={onCellEditComplete}
                                />
                            ))}
                        </DataTable>
                        </div>
                        <i className="pi pi-plus-circle tarifa-add-column-button" onClick={() => setModalColumn(true)}></i>
                    </div>
                </div>
            )}

            <ConfirmDialog 
                group="declarative"  
                visible={visibleDialog} 
                onHide={() => setVisibleDialog(false)} 
                message="¿Seguro que  deseas eliminar este medio de contacto?" 
                header="Confirmación" 
                icon="pi pi-exclamation-triangle" 
                accept={() => handleDeleteComponent()}
                reject={() => reject()} 
            />

            {modalColumn && (
                <div className="modal-add-column">
                    <div className="modal-column-header">
                        <h2>Agregar columna</h2>
                        <i className="pi pi-times" onClick={() => setModalColumn(false)}></i>
                    </div>
                    <div className="modal-column-body">
                        <FloatLabel>
                            <InputText 
                                id="columnDescription"
                                value={columnDescription}
                                onChange={(e) => setColumnDescription(e.target.value)}
                            />
                            <label htmlFor="columnDescription">Descripción de la columna</label>
                        </FloatLabel>
                        <div>
                            <FloatLabel className="pax">
                                <InputText 
                                    id="paxMin"
                                    value={paxMin}
                                    onChange={(e) => setPaxMin(e.target.value)}
                                />
                                <label htmlFor="paxMin">Pax mínimo</label>
                            </FloatLabel>

                            <FloatLabel className="pax">
                                <InputText 
                                    id="paxMax"
                                    value={paxMax}
                                    onChange={(e) => setPaxMax(e.target.value)}
                                />
                                <label htmlFor="paxMax">Pax máximo</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div>
                        <Button label="Agregar" onClick={handleAddColumn} />
                    </div>
                </div>
            )}

        </>
    );
};

export default TarifaMenu;
