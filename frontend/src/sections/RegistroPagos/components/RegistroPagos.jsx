import { Button } from "primereact/button";
import { useEffect, useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import useSearch from "../../../hooks/useSearch";
import SearchBar from "../../../components/SearchBar";
import { apiService } from "../../../services/apiService";
import CotizacionRepository from "../../../modules/Cotizacion/repository/CotizacionRepository";
import GetAllCotizaciones from "../../../modules/Cotizacion/application/GetAllCotizaciones";
import { useModal } from "../../../contexts/ModalContext";
import RegistroPagosModal from "./RegistroPagosModal";
import "../styles/RegistroPagos.css"
import { useNavigate } from "react-router-dom";

const RegistroPagos = () => {
    const cotizacionRepo = new CotizacionRepository();
    const getAllCotizaciones = new GetAllCotizaciones(cotizacionRepo);

    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const { setIsModalOpen } = useModal();
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(15);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Cargar todas las cotizaciones finalizadas (sin paginación del backend)
    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllCotizaciones.execute();
            const finalizedData = Array.isArray(data) ? data.filter(cotizacion => cotizacion.estado === 'Finalizado') : [];
            setCotizaciones(finalizedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setCotizaciones([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleModalOpen = (cotizacion) => {
        setSelectedCotizacion(cotizacion);
        setShowModal(true);
        setIsModalOpen(true);
    }

    const handleModalClose = () => {
        setShowModal(false);
        setIsModalOpen(false);
        fetchData();
    };

    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('itinerary-templates', q));

    // Obtener los datos a mostrar (búsqueda o todos)
    const baseData = useMemo(() => {
        const data = search ? (Array.isArray(results) ? results : []) : cotizaciones;
        return Array.isArray(data) ? data : [];
    }, [search, results, cotizaciones]);

    // Paginar los datos
    const paginatedData = useMemo(() => {
        const start = first;
        const end = start + rows;
        return baseData.slice(start, end);
    }, [baseData, first, rows]);

    // Total de registros
    const totalRecords = useMemo(() => {
        return baseData.length;
    }, [baseData]);

    // Función para manejar el cambio de página
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    // Resetear paginación cuando cambia la búsqueda
    useEffect(() => {
        setFirst(0);
    }, [search]);


    return (
    <div className="registro-pagos">
        <div className='registro-pagos-header'>
            <h2>Registro de Pagos</h2>
            <Button 
                icon="pi pi-receipt" 
                label="Reporte" 
                size='small' 
                outlined
                onClick={() => navigate('/registro-pagos/reporte')}/>
        </div>

        <div className='registro-pagos-search'>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar..." />
        </div>

        <div className="card">
            <DataTable 
                className="registro-pagos-table" 
                size="small" 
                value={paginatedData} 
                tableStyle={{ minWidth: '100%' }}
                emptyMessage="No hay registros"
                paginator={false}
                loading={loading || searchLoading}
            >
                <Column 
                    field="cliente.nombre" 
                    header="Nombre" 
                    style={{ width : '18%' }}>    
                </Column>
                <Column 
                    field="nombreCotizacion" 
                    header="Cotización" 
                    style={{ width: isMobile ? '20%' : '26%' }}>
                </Column>
                <Column 
                    field="numeroFile" 
                    header="File" 
                    style={{ width: '8%' }}>
                </Column>
                <Column 
                    field="costo" 
                    header="Costo USD" 
                    style={{ width: '8%' }}>
                </Column>
                <Column 
                    header="% Utilidad USD" 
                    body={(rowData) => (
                        <span>
                            <span style={{color: '#c9c9c9ff'}}>{rowData.utilidad ? Number(rowData.utilidad).toFixed(0) : '0.00'}% </span>
                            {rowData.precioUtilidad}
                        </span>
                    )}
                    style={{ width: '11%' }}>
                </Column>
                <Column 
                    field="precioVenta" 
                    header={isMobile ? "Precio venta" : "Precio venta USD"} 
                    style={{ width: '9%' }}>
                </Column><Column  
                    header={isMobile ? "Adelanto" : "Adelanto USD"} 
                    body={(rowData) => (
                        <span>
                            {rowData.adelanto ? Number(rowData.adelanto).toFixed(2) : '1.00'}
                        </span>
                    )}
                    style={{ width: '8%' }}>
                </Column>
                <Column 
                    field="saldo" 
                    header={isMobile ? "Saldo" : "Saldo USD"}
                    style={{ width: '7%' }}>
                </Column>
                <Column
                    header="Acción"
                    style={{ width: '7%' }}
                    body={rowData => (
                        <span style={{ display: 'flex', justifyContent: 'center' }}>
                            <i 
                                className="pi pi-receipt"    
                                title="Reporte" 
                                style={{cursor:"pointer"}}
                                onClick={() => handleModalOpen(rowData)}    
                            ></i>
                        </span>
                    )}
                />
            </DataTable>
        </div>

        {/* Footer con paginación */}
        <div className='registro-pagos-footer'>
            <Paginator
                first={first}
                rows={rows}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                rowsPerPageOptions={[15]}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                className="custom-paginator"
            />
        </div>

        {showModal && (
            <RegistroPagosModal
                visible={showModal}
                onHide={handleModalClose}
                cotizacion={selectedCotizacion}
            />
        )}

    </div>
  );
}

export default RegistroPagos;