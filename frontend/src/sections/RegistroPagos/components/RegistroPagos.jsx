import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import useSearch from "../../../hooks/useSearch";
import SearchBar from "../../../components/SearchBar";
import { apiService } from "../../../services/apiService";
import CotizacionRepository from "../../../modules/Cotizacion/repository/CotizacionRepository";
import GetAllCotizaciones from "../../../modules/Cotizacion/application/GetAllCotizaciones";
import { useModal } from "../../../contexts/ModalContext";
import RegistroPagosModal from "./RegistroPagosModal";
import "../styles/RegistroPagos.css"

const RegistroPagos = () => {
    const cotizacionRepo = new CotizacionRepository();
    const getAllCotizaciones = new GetAllCotizaciones(cotizacionRepo);

    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const { setIsModalOpen } = useModal();
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const fetchData = async (page, pageSize) => {
        try {
            setLoading(true);
            const data = await getAllCotizaciones.execute({ page, pageSize });
            setCotizaciones(data);
            // setTotalRecords(total);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData(0, rows);
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

    const onPageChange = (event) => {
        const page = Math.floor(event.first / event.rows);
        setFirst(event.first);
        setRows(event.rows);
        // loadItineraryTemplates(page, event.rows);
    };
    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('itinerary-templates', q));


    return (
    <div className="registro-pagos">
        <div className='registro-pagos-header'>
            <h2>Registro de Pagos</h2>
            <Button 
                icon="pi pi-receipt" 
                label="Reporte" 
                size='small' 
                outlined
                onClick={() => undefined}/>
        </div>

        <div className='registro-pagos-search'>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar..." />
        </div>

        <div className="card">
            <DataTable 
                className="registro-pagos-table" 
                size="small" 
                value={search ? results : cotizaciones} 
                tableStyle={{ minWidth: '60%' }}
                emptyMessage="No hay registros"
                paginator
                first={first}
                rows={rows}
                totalRecords={totalRecords}
                onPage={onPageChange}
                // loading={loading || searchLoading}
            >
                <Column 
                    field="cliente.nombre" 
                    header="Nombre" 
                    style={{ width: '18%' }}>    
                </Column>
                <Column 
                    field="nombreCotizacion" 
                    header="Cotización" 
                    style={{ width: '26%' }}>
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
                    header="Precio venta USD" 
                    style={{ width: '9%' }}>
                </Column><Column 
                    field="" 
                    header="Adelanto USD" 
                    style={{ width: '8%' }}>
                </Column>
                <Column 
                    field="" 
                    header="Saldo USD" 
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