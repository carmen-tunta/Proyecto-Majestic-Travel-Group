import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import useSearch from "../../../hooks/useSearch";
import SearchBar from "../../../components/SearchBar";
import { apiService } from "../../../services/apiService";

import "../styles/RegistroPagos.css"
import CotizacionRepository from "../../../modules/Cotizacion/repository/CotizacionRepository";
import GetAllCotizaciones from "../../../modules/Cotizacion/application/GetAllCotizaciones";

const RegistroPagos = () => {
    const cotizacionRepo = new CotizacionRepository();
    const getAllCotizaciones = new GetAllCotizaciones(cotizacionRepo);

    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const fetchData = async (page, pageSize) => {
        try {
            setLoading(true);
            const data = await getAllCotizaciones.execute({ page, pageSize });
            setCotizaciones(data);
            console.log(data)
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
                    field="" 
                    header="Costo USD" 
                    style={{ width: '8%' }}>
                </Column>
                <Column 
                    header="% Utilidad USD" 
                    body={(rowData) => (
                        <span>
                            {rowData.utilidad ? Number(rowData.utilidad).toFixed(0) : '0.00'}%

                        </span>
                    )}
                    style={{ width: '9%' }}>
                </Column>
                <Column 
                    field="" 
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
                                onClick={() => undefined}    
                            ></i>
                        </span>
                    )}
                />
            </DataTable>
        </div>

        {showModal && (
            <div>Hola</div>
            // <ItineraryModal
            //     visible={showModal}
            //     onHide={handleModalClose}
            //     template={selectedTemplate}
            // />
        )}

    </div>
  );
}

export default RegistroPagos;