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
import CotizacionRepository from "../../../modules/Cotizacion/repository/CotizacionRepository";
import GetAllCotizaciones from "../../../modules/Cotizacion/application/GetAllCotizaciones";

const Reporte = () => {
    const rpRepo = new RegistroPagoRepository();
    const rpGetAll = new GetAllRegistroPago(rpRepo);

    const cotizacionRepo = new CotizacionRepository();
    const getAllCotizaciones = new GetAllCotizaciones(cotizacionRepo);

    const [desde, setDesde] = useState(null);
    const [hasta, setHasta] = useState(null);
    const [reporteFiltrado, setReporteFiltrado] = useState([]);
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

        
    const filtrarPorFechas = () => {
        if (!desde && !hasta) {
            setReporteFiltrado(reporte);
            return;
        }
        
        const filtrado = reporte.filter(registro => {
            if (!registro.registroPagos?.length) return false;
            const fechaMasReciente = registro.registroPagos
                .filter(rp => rp.fecha) // Solo fechas válidas
                .map(rp => new Date(rp.fecha)) // Convertir a Date
                .sort((a, b) => b - a)[0]; // Ordenar y tomar la primera (más reciente)
            
            if (!fechaMasReciente) return false;
            
            // Comparar fechas
            const fechaReciente = fechaMasReciente.getTime();
            const fechaDesde = desde ? new Date(desde).getTime() : null;
            const fechaHasta = hasta ? new Date(hasta).getTime() : null;
            console.log({fechaReciente, fechaDesde, fechaHasta});
            if (fechaDesde && !fechaHasta) {
                return fechaReciente >= fechaDesde;
            }
            if (!fechaDesde && fechaHasta) {
                return fechaReciente <= fechaHasta;
            }
            if (fechaDesde && fechaHasta) {
                return fechaReciente >= fechaDesde && fechaReciente <= fechaHasta;
            }
            
            return true;
        });
        
        setReporteFiltrado(filtrado);
    };
        useEffect(() => {
            filtrarPorFechas();
    }, [desde, hasta, reporte]);


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
            const data = await getAllCotizaciones.execute();
            console.log('Fetched cotizaciones:', data);
            const finalizedData = data.filter(cotizacion => cotizacion.estado === 'Finalizado');
            setReporte(finalizedData);
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

    const calcularTotalAdelanto = () => {
        return reporteFiltrado.reduce((acc, item) => {
            const adelanto = Number(item.adelanto) || 0;
            return acc + adelanto;
        }, 0).toFixed(2);
    };

    const calcularTotalSaldo = () => {
        return reporteFiltrado.reduce((acc, item) => {
            const saldo = Number(item.saldo) || 0;
            return acc + saldo;
        }, 0).toFixed(2);
    };

    return (
        <div className="reporte">
            <div className='reporte-header'>
                <h2>Reporte de registro de pagos</h2>
                {(desde || hasta) && (
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Mostrando {reporteFiltrado.length} de {reporte.length} registros
                    </p>
                )}
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
                    value={reporteFiltrado} 
                    tableStyle={{ minWidth: '60%' }}
                    emptyMessage="No hay registros"
                    loading={loading}
                >
                    <Column 
                        field="cliente.nombre" 
                        header="Nombre de cliente" 
                        style={{ width: '18%' }}>    
                    </Column>
                    <Column 
                        field="nombreCotizacion" 
                        header="Nombre de cotizacion" 
                        style={{ width: '21%' }}>
                    </Column>
                    <Column 
                        field="numeroFile" 
                        header="File" 
                        style={{ width: '10%' }}>
                    </Column>
                    <Column 
                        field="costo" 
                        header="Costo" 
                        style={{ width: '10%' }}>
                    </Column>
                    <Column 
                        header="% Utilidad" 
                        body={(rowData) => (
                            <span>
                                <span style={{color: '#c9c9c9ff'}}>{rowData.utilidad ? Number(rowData.utilidad).toFixed(0) : '0.00'}% </span>
                                {rowData.precioUtilidad}
                            </span>
                        )}
                        style={{ width: '13%' }}>
                    </Column>
                    <Column 
                        field="precioVenta" 
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
                        field="saldo" 
                        header="Saldo" 
                        style={{ width: '7%' }}>
                    </Column>
                </DataTable>
            </div>  

            <div className="reporte-footer">
                <div className="monto">Monto expresados en USD</div>
                <div className="adelanto-saldo">
                    <div><span>Adelanto:</span> <span>{calcularTotalAdelanto()}</span></div>
                    <div><span>Saldo: </span> <span>{calcularTotalSaldo()}</span></div>
                </div>
            </div>  
        </div>
    );
};
export default Reporte;