import { use, useEffect, useState } from "react";
import GetAllRegistroPago from "../../../modules/RegistroPagos/application/GetAllRegistroPago";
import RegistroPagoRepository from "../../../modules/RegistroPagos/repository/RegistroPagoRepository";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "../styles/Reporte.css"
import { Calendar } from "primereact/calendar";
import { FloatLabel } from "primereact/floatlabel";
import { addLocale } from "primereact/api";
import { useNotification } from "../../Notification/NotificationContext";

const Reporte = () => {
    const rpRepo = new RegistroPagoRepository();
    const rpGetAll = new GetAllRegistroPago(rpRepo);

    const [desde, setDesde] = useState(null);
    const [hasta, setHasta] = useState(null);
    const showNotification = useNotification();

    const [reporte, setReporte] = useState([]);
    const [loading, setLoading] = useState(false);


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

        
    const handleDesdeChange = (e) => {
        const nuevaDesde = e.target.value;
        setDesde(nuevaDesde);
        if (hasta && nuevaDesde && nuevaDesde > hasta) {
            setHasta(null);
            showNotification('La fecha se ha reiniciado porque era menor a la nueva fecha', 'error');
        }
    };

    const handleHastaChange = (e) => {
        const nuevaHasta = e.target.value;        
        if (desde && nuevaHasta && nuevaHasta < desde) {
            showNotification('La fecha no puede ser menor', 'error');
            return;
        }
        setHasta(nuevaHasta);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await rpGetAll.execute();
            console.log(data);
            setReporte(data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setReporte([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="reporte">
            <div className='reporte-header'>
                <h2>Reporte de registro de pagos</h2>
            </div>

            <div className="reporte-buscador">
                <FloatLabel>
                    <Calendar 
                        id="desdeCalendar"
                        locale="es"
                        dateFormat="D dd M y"
                        value={desde}
                        onChange={handleDesdeChange}
                        maxDate={hasta}
                    />
                    <label htmlFor="desdeCalendar">Fecha desde</label>
                </FloatLabel>
                <FloatLabel>
                    <Calendar 
                        id="hastaCalendar" 
                        locale="es" 
                        dateFormat="D dd M y"
                        value={hasta}
                        onChange={handleHastaChange}
                        minDate={desde}
                    />
                    <label htmlFor="hastaCalendar">Fecha hasta</label>
                </FloatLabel>
            </div>

            <div className="card">
                <DataTable 
                    className="reporte-table" 
                    size="small" 
                    value={reporte} 
                    tableStyle={{ minWidth: '60%' }}
                    emptyMessage="No hay registros"
                    loading={loading}
                >
                    <Column 
                        field="cotizacion.nombreCotizacion" 
                        header="Nombre" 
                        style={{ width: '18%' }}>    
                    </Column>
                    <Column 
                        field="nota" 
                        header="Nota (?)" 
                        style={{ width: '21%' }}>
                    </Column>
                    <Column 
                        field="cotizacion.numeroFile" 
                        header="File" 
                        style={{ width: '10%' }}>
                    </Column>
                    <Column 
                        field="cotizacion.costo" 
                        header="Costo" 
                        style={{ width: '10%' }}>
                    </Column>
                    <Column 
                        header="% Utilidad" 
                        body={(rowData) => (
                            <span>
                                <span style={{color: '#c9c9c9ff'}}>{rowData.cotizacion.utilidad ? Number(rowData.cotizacion.utilidad).toFixed(0) : '0.00'}% </span>
                                {rowData.cotizacion.precioUtilidad}
                            </span>
                        )}
                        style={{ width: '13%' }}>
                    </Column>
                    <Column 
                        field="cotizacion.precioVenta" 
                        header="Precio venta" 
                        style={{ width: '11%' }}>
                    </Column><Column  
                        header="Adelanto" 
                        body={(rowData) => (
                            <span>
                                {rowData.adelanto ? Number(rowData.adelanto).toFixed(2) : '0.00'}
                            </span>
                        )}
                        style={{ width: '10%' }}>
                    </Column>
                    <Column 
                        field="cotizacion.saldo" 
                        header="Saldo" 
                        style={{ width: '7%' }}>
                    </Column>
                </DataTable>
            </div>    
        </div>
    );
};
export default Reporte;