import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useNotification } from "../../../Notification/NotificationContext";
import { ProgressSpinner } from "primereact/progressspinner";
import { usePermissions } from '../../../../contexts/PermissionsContext';
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
import TarifaColumnRepository from "../../../../modules/TarifaColumn/repository/TarifaColumnRepository";
import CreateTarifaColumn from "../../../../modules/TarifaColumn/application/CreateTarifaColumn";
import GetTarifaColumnByIdTarifa from "../../../../modules/TarifaColumn/application/GetTarifaColumnByIdTarifa";
import UpdateTarifaColumn from "../../../../modules/TarifaColumn/application/UpdateTarifaColumn";
import DeleteTarifaColumn from "../../../../modules/TarifaColumn/application/DeleteTarifaColumn";
import TarifaPriceRepository from "../../../../modules/TarifaPrice/repository/TarifaPriceRepository";
import GetTarifaPriceByTarifaId from "../../../../modules/TarifaPrice/application/GetTarifaPriceByTarifaId";
import "../../styles/Tarifario/Tarifa.css"


const TarifaMenu = ({ proveedor, tarifa, setTarifa }) => {
    const [loading, setLoading] = useState(false);
    const [validityFrom, setValidityFrom] = useState('');
    const [validityTo, setValidityTo] = useState('');
    const [observation, setObservation] = useState('');
    const { showNotification } = useNotification();
    const [selectedComponents, setSelectedComponents] = useState([]);
    const [tarifaComponents, setTarifaComponents] = useState([]);
    
    const [columns, setColumns] = useState([]);
    const [modalColumn, setModalColumn] = useState(false);
    const [columnDescription, setColumnDescription] = useState('');
    const [paxMin, setPaxMin] = useState('');
    const [paxMax, setPaxMax] = useState('');

    const [prices, setPrices] = useState([]);
    const [modalColumnX, setModalColumnX] = useState(null);
    const [modalColumnY, setModalColumnY] = useState(null);

    const [visibleDialog, setVisibleDialog] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);
    const [columnToDelete, setColumnToDelete] = useState(null);
    const [dialogType, setDialogType] = useState('');


    const tarifarioRepo = new TarifarioRepository();
    const getTarifarioByIdProveedor = new GetTarifarioByIdProveedor(tarifarioRepo);
    const createTarifario = new CreateTarifario(tarifarioRepo);
    const updateTarifario = new UpdateTarifario(tarifarioRepo);

    const tarifaComponentRepo = new TarifaComponentRepository();
    const getTarifaComponentByIdTarifa = new GetTarifaComponentByIdTarifa(tarifaComponentRepo);
    const createTarifaComponent = new CreateTarifaComponent(tarifaComponentRepo);
    const deleteTarifaComponent = new DeleteTarifaComponent(tarifaComponentRepo);

    const tarifaColumnRepo = new TarifaColumnRepository();
    const createTarifaColumn = new CreateTarifaColumn(tarifaColumnRepo);
    const getTarifaColumnByTarifaId = new GetTarifaColumnByIdTarifa(tarifaColumnRepo);
    const updateTarifaColumn = new UpdateTarifaColumn(tarifaColumnRepo);
    const deleteTarifaColumn = new DeleteTarifaColumn(tarifaColumnRepo);

    const tarifaPricesRepo = new TarifaPriceRepository();
    const getTarifaPriceByIdTarifa = new GetTarifaPriceByTarifaId(tarifaPricesRepo);
    const { has } = usePermissions();


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
            try {
                setLoading(true);
                const newTarifaComponent = await createTarifaComponent.execute({
                    tarifa_id: tarifa.id,
                    componente_id: comp.id
                });

                // 2. Crear las celdas (precios) para cada columna existente
                await Promise.all(
                    columns.map(col =>
                        tarifaPricesRepo.create({
                            tarifa_component_id: newTarifaComponent.id,
                            tarifa_column_id: col.id,
                            price: 0 // o el valor inicial que desees
                        })
                    )
                );

                // 3. Refresca la tabla
                const tarifaComponentData = await getTarifaComponentByIdTarifa.execute(tarifa.id);
                setTarifaComponents(tarifaComponentData);
                setSelectedComponents(tarifaComponentData);

                const tarifaPricesData = await getTarifaPriceByIdTarifa.execute(tarifa.id);
                setPrices(tarifaPricesData);

                setSelectedComponents(buildRows(tarifaComponentData, columns, tarifaPricesData));
                showNotification('Componente agregado correctamente', 'success');
            } catch (error) {
                console.error('Error al crear el componente o sus celdas:', error);
                showNotification('Error al agregar el componente', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddColumn = async () => {
        setLoading(true);
        setModalColumn(false);
        try {
            // 1. Crear la columna en el backend
            const newColumn = await createTarifaColumn.execute({
                tarifa_id: tarifa.id,
                description: columnDescription,
                paxMin: paxMin,
                paxMax: paxMax
            });

            // 2. Crear las celdas (precios) para cada componente existente
            await Promise.all(
                tarifaComponents.map(tc =>
                    tarifaPricesRepo.create({
                        tarifa_component_id: tc.id,
                        tarifa_column_id: newColumn.id,
                        price: 0 // o el valor inicial que desees
                    })
                )
            );

            // 3. Refresca la tabla
            const tarifaColumnData = await getTarifaColumnByTarifaId.execute(tarifa.id);
            setColumns(tarifaColumnData);

            const tarifaPricesData = await getTarifaPriceByIdTarifa.execute(tarifa.id);
            setPrices(tarifaPricesData);

            setSelectedComponents(buildRows(tarifaComponents, tarifaColumnData, tarifaPricesData));

            showNotification('Columna agregada correctamente', 'success');
        } catch (error) {
            showNotification('Error al agregar la columna', 'error');
            console.error(error);
        } finally {
            setLoading(false);
            setColumnDescription('');
            setPaxMin('');
            setPaxMax('');
        }
    };

    const handleDeleteColumn = async () => {
        setLoading(true);
        try {
            await deleteTarifaColumn.execute(columnToDelete.id);

            // 3. Refresca la tabla
            const tarifaColumnData = await getTarifaColumnByTarifaId.execute(tarifa.id);
            setColumns(tarifaColumnData);

            const tarifaPricesData = await getTarifaPriceByIdTarifa.execute(tarifa.id);
            setPrices(tarifaPricesData);

            const tarifaComponentsData = await getTarifaComponentByIdTarifa.execute(tarifa.id);
            setTarifaComponents(tarifaComponentsData);

            setSelectedComponents(buildRows(tarifaComponentsData, tarifaColumnData, tarifaPricesData));

            showNotification('Columna eliminada correctamente', 'success');
            setColumnToDelete(null);
            setVisibleDialog(false);
        } catch (error) {
            showNotification('Error al eliminar la columna', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [editingColumn, setEditingColumn] = useState(null);

    const handleEditColumn = (col) => {
        setEditingColumn(col); // guarda la columna original
        setColumnDescription(col.description);
        setPaxMin(col.paxMin);
        setPaxMax(col.paxMax);
        setModalColumn(true);
    };

    const handleSaveColumnEdit = async () => {
        setModalColumn(false);
        try {
            setLoading(true);
            await updateTarifaColumn.execute({
                ...editingColumn,
                id: editingColumn.id,
                description: columnDescription,
                paxMin: paxMin,
                paxMax: paxMax
            });
            const tarifaColumnData = await getTarifaColumnByTarifaId.execute(tarifa.id);
            setColumns(tarifaColumnData);
            showNotification('Columna actualizada correctamente', 'success');
        } catch {
            showNotification('Error al actualizar la columna', 'error');
        } finally {
            setLoading(false);
        }
        setEditingColumn(null);
        setColumnDescription('');
        setPaxMin('');
        setPaxMax('');
    };


    const buildColumnHeaders = (columns) => {
        return columns.map(col => ({
            key: String(col.id),
            field: String(col.id),
            header: (
                            <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        minWidth: 120,
                        position: 'relative'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1
                    }}>
                        <div style={{ fontWeight: 500 }}>{col.description}</div>
                        <div style={{ fontSize: '0.95em', color: '#555' }}>{col.paxMin}-{col.paxMax}</div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: "1rem",
                        marginLeft: 8
                    }}>
                        {has('PROVEEDORES','EDIT') && (
                        <i
                            className="pi pi-pencil"
                            style={{
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'color 0.2s',
                                color: '#00000075'
                            }}
                            title="Editar columna"
                            onClick={(e) => {
                                handleEditColumn(col);
                                setModalColumnX(e.pageX);
                                setModalColumnY(e.pageY);
                            }}
                        />
                        )}
                        {has('PROVEEDORES','DELETE') && (
                        <i
                            className="pi pi-trash"
                            style={{
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'color 0.2s',
                                color: '#00000075'
                            }}
                            title="Eliminar columna"
                            onClick={() => {handleDeleteIconColumnClick(col)}}
                        />
                        )}
                    </div>
                </div>
            ),
            description: col.description,
            paxMin: col.paxMin,
            paxMax: col.paxMax
        }));
    };

    const buildRows = (tarifaComponents, columns, prices) => {
        const getCell = (tcId, colId) =>
            prices.find(p => p.tarifa_component_id === tcId && p.tarifa_column_id === colId);

        return tarifaComponents.map(tc => {
            const row = { ...tc.component };
            columns.forEach(col => {
                const cell = getCell(tc.id, col.id);
                row[col.id] = cell ? Number(cell.price) : 0;
                row[`${col.id}_priceId`] = cell ? cell.id : null;
            });
            return row;
        });
    };

    const fetchTarifa = async (proveedorId) => {
        setLoading(true);
        try {
            const tarifaData = await getTarifarioByIdProveedor.execute(proveedorId);
            const tarifaObj = Array.isArray(tarifaData) ? tarifaData[0] : tarifaData;
            setTarifa(tarifaObj);

            const tarifaComponentData = await getTarifaComponentByIdTarifa.execute(tarifaObj.id);
            setTarifaComponents(tarifaComponentData);

            const tarifaColumnData = await getTarifaColumnByTarifaId.execute(tarifaObj.id);
            setColumns(tarifaColumnData);

            const tarifaPricesData = await getTarifaPriceByIdTarifa.execute(tarifaObj.id);
            setPrices(tarifaPricesData);

            const rows = buildRows(tarifaComponentData, tarifaColumnData, tarifaPricesData);
            setSelectedComponents(rows);
        } catch (error) {
            console.error('Error al obtener el tarifario:', error);
            // setTarifa(null);
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
                console.log(tarifarioActualizado);
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
                console.log(nuevoTarifario);
                setValidityFrom(parseLocalDate(nuevoTarifario.validityFrom) || null);
                setValidityTo(parseLocalDate(nuevoTarifario.validityTo) || null);
                setObservation(nuevoTarifario.observation || '');
                showNotification('Cabecera registrada con éxito!', 'success');
            }
        } catch (error) {
            showNotification('Error al guardar la cabecera', 'error');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const onCellEditComplete = async (e) => {
        const { rowData, newValue, field } = e;
        const priceId = rowData[`${field}_priceId`];
        const value = Number(newValue);

        setSelectedComponents(prevRows =>
            prevRows.map(row =>
                row === rowData
                    ? { ...row, [field]: value }
                    : row
            )
        );
        setPrices(prevPrices =>
            prevPrices.map(p =>
                p.id === priceId
                    ? { ...p, price: value }
                    : p
            )
        );

        if (priceId) {
            try {
                await tarifaPricesRepo.update(priceId, { price: value });
        
            } catch (error) {
                showNotification('Error al actualizar el precio', 'error');
                console.error(error);
                setSelectedComponents(prevRows =>
                    prevRows.map(row =>
                        row === rowData
                            ? { ...row, [field]: rowData[field] }
                            : row
                    )
                );
                setPrices(prevPrices =>
                    prevPrices.map(p =>
                        p.id === priceId
                            ? { ...p, price: rowData[field] }
                            : p
                    )
                );
            }
        }
    };

    // Editor para celdas numéricas
    const cellEditor = (options) => {
        const displayValue = options.value === 0 ? '' : options.value;
        return (
            <InputText
                type="number"
                min={0}
                value={displayValue}
                onChange={(e) => options.editorCallback(Number(e.target.value))}
                style={{ width: '100%', margin: 0, alignContent: 'center', textAlign: 'center' }}
                onWheel={e => e.target.blur()}
            />
        );
    };

    const handleDeleteIconComponentClick = (component) => {
        setComponentToDelete(component);
        setDialogType('component');
        setVisibleDialog(true);
    };

    const handleDeleteIconColumnClick = (column) => {
        setColumnToDelete(column);
        setDialogType('column');
        setVisibleDialog(true);
    };

    const reject = () => {
        setComponentToDelete(null);
        setColumnToDelete(null);
        setDialogType('');
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
            {has('PROVEEDORES','DELETE') && (
            <i
                className="pi pi-trash"
                style={{ cursor: 'pointer', marginRight: 8 }}
                title="Eliminar componente"
                onClick={() => handleDeleteIconComponentClick(rowData)}
            />
            )}
            <span>{rowData.componentName}</span>
        </div>
    );


    const MODAL_WIDTH = window.innerWidth * 0.27;
    let modalStyle = {};
    if (modalColumnX !== null) {
        const windowWidth = window.innerWidth;
        if (modalColumnX + MODAL_WIDTH > windowWidth) {
            // Aparece por la izquierda si está muy cerca del borde derecho
            modalStyle = { left: modalColumnX - MODAL_WIDTH }; // 20px de margen
        } else {
            modalStyle = { left: modalColumnX };
        }
        modalStyle.top = modalColumnY + 15 || '65vh';
    }



    return (
        <>
            {/* {loading && tarifa ? ( */}
                {/* <div>Cargando...</div> */}
            {/* ) : ( */}
                <div className="tarifa-header">
                    <FloatLabel className="tarifa-validity">
                        <Calendar
                            id="validityFrom" 
                            value={validityFrom} 
                            onChange={(e) => setValidityFrom(e.value)} 
                            dateFormat="D dd M y"
                            locale="es"
                            required
                            disabled={loading}
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
                            disabled={loading}
                        />
                        <label htmlFor="validityTo">Vigencia hasta</label>
                    </FloatLabel>
                    <FloatLabel className="tarifa-observation">
                        <InputText 
                            id="observation"
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            disabled={loading}
                        />
                        <label htmlFor="observation">Observación</label>
                    </FloatLabel>
                    <Button
                        className="tarifa-save-button"
                        label= {tarifa ? "Guardar cambios" : "Guardar para continuar"}
                        text
                        disabled={loading || (tarifa && !has('PROVEEDORES','EDIT')) || (!tarifa && !has('PROVEEDORES','CREATE'))}
                        onClick={handleSaveTarifario}
                    />
                </div>
            {/* )} */}

            {tarifa && (
                <div className="tarifa-body">
                    <h3>Tarifa</h3>

                    

                    <div className="tarifa-content">
                        {loading && tarifa ? (
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '8rem', minHeight: 120 }}>
                                <ProgressSpinner />
                            </div>
                        ) : (
                        <div className="scrolling-table">
                        <DataTable 
                            className="tarifa-table"
                            value={selectedComponents}
                            scrollable
                            scrollHeight="flex" 
                            editMode="cell"
                            loading={loading}
                            emptyMessage="Sin datos todavía"
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

                            {buildColumnHeaders(columns).map(col => (
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
                        )}
                        {has('PROVEEDORES','CREATE') && (
                        <i className="pi pi-plus-circle tarifa-add-column-button" 
                            onClick={modalColumn ? undefined : (e) => {
                                setModalColumn(true);
                                setModalColumnX(e.pageX);
                                setModalColumnY(e.pageY);
                            }} 
                            style={{ visibility: loading ? 'hidden' : 'visible' }}
                        ></i>
                        )}
                        
                    </div>

                     

                </div>
            )}

            <ConfirmDialog 
                group="declarative"  
                visible={visibleDialog} 
                onHide={() => setVisibleDialog(false)} 
                message={dialogType === 'component' ? "¿Estás seguro de que deseas eliminar este componente de la tarifa?" 
                    : dialogType === 'column' ? "¿Estás seguro de que deseas eliminar esta columna de la tarifa?" : ''}
                header="Confirmación" 
                icon="pi pi-exclamation-triangle" 
                accept={() => {
                    if (dialogType === 'component') handleDeleteComponent();
                    else if (dialogType === 'column' && columnToDelete) handleDeleteColumn();
                }}
                reject={() => reject()} 
                acceptLabel="Sí"
                rejectLabel="No"
            />


            {modalColumn && (
                <div
                    className="modal-add-column-backdrop"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 9998,
                    }}
                    onClick={() => {
                        setModalColumn(false);
                        setEditingColumn(null);
                        setColumnDescription('');
                        setPaxMin('');
                        setPaxMax('');
                    }}
                >
                    <div
                        className="modal-add-column"
                        style={modalStyle}
                        onClick={e => e.stopPropagation()} // Evita que el click dentro del modal cierre el modal
                    >
                        <div className="modal-column-header">
                            <h2>{editingColumn ? 'Editar columna' : 'Agregar columna'}</h2>
                            <i className="pi pi-times" onClick={() => {
                                setModalColumn(false);
                                setEditingColumn(null);
                                setColumnDescription('');
                                setPaxMin('');
                                setPaxMax('');
                            }}></i>
                        </div>
                        <div className="modal-column-body">
                            <FloatLabel>
                                <InputText 
                                    id="columnDescription"
                                    value={columnDescription}
                                    onChange={(e) => setColumnDescription(e.target.value)}
                                    required
                                />
                                <label htmlFor="columnDescription">Descripción de la columna</label>
                            </FloatLabel>
                            <div>
                                <FloatLabel className="pax">
                                    <InputText 
                                        id="paxMin"
                                        value={paxMin}
                                        onChange={(e) => setPaxMin(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="paxMin">Pax mínimo</label>
                                </FloatLabel>

                                <FloatLabel className="pax">
                                    <InputText 
                                        id="paxMax"
                                        value={paxMax}
                                        onChange={(e) => setPaxMax(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="paxMax">Pax máximo</label>
                                </FloatLabel>
                            </div>
                        </div>
                        <div>
                            {editingColumn ? (
                                <Button label="Guardar cambios" onClick={handleSaveColumnEdit}/>
                            ) : (
                                <Button label="Agregar" onClick={handleAddColumn} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
        
    );
};

export default TarifaMenu;
