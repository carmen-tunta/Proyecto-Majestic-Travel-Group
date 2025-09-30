import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { use, useEffect, useState } from 'react';
import { useNotification } from '../../Notification/NotificationContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import "../styles/RegistroPagosModal.css"
import RegistroPagoRepository from '../../../modules/RegistroPagos/repository/RegistroPagoRepository';
import GetRegistroPagoByCotizacionId from '../../../modules/RegistroPagos/application/GetRegistroPagoByCotizacionId';
import CreateRegistroPago from '../../../modules/RegistroPagos/application/CreateRegistroPago';
import DeleteRegistroPago from '../../../modules/RegistroPagos/application/DeleteResgistroPago';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import CotizacionRepository from '../../../modules/Cotizacion/repository/CotizacionRepository';
import UpdateCotizacion from '../../../modules/Cotizacion/application/UpdateCotizacion';

const RegistroPagosModal = ({ onHide, cotizacion }) => {
    const rpRepo = new RegistroPagoRepository();
    const getRpByCotizacion = new GetRegistroPagoByCotizacionId(rpRepo);
    const createRp = new CreateRegistroPago(rpRepo);
    const deleteRp = new DeleteRegistroPago(rpRepo);

    const cotizacionRepo = new CotizacionRepository();
    const updateCotizacion = new UpdateCotizacion(cotizacionRepo);

    const [registroPago, setRegistroPago] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);

    const [fecha, setFecha] = useState('');
    const [monto, setMonto] = useState('');
    const [nota, setNota] = useState('');

    const adelanto = registroPago.reduce((sum, pago) => sum + (Number(pago.monto) || 0), 0);
    const precioVenta = Number(cotizacion?.precioVenta) || 0;
    const saldo = precioVenta - adelanto;

    useEffect(() => {
        if (!isInitialLoad) {
            try {
                setLoading(true);
                updateCotizacion.execute(cotizacion.id, {
                    adelanto: adelanto,
                    saldo: saldo
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    }, [adelanto, saldo]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getRpByCotizacion.execute(cotizacion.id);
            setRegistroPago(data);
            setIsInitialLoad(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSaveRegistroPago = async () => {
        try {
            setLoading(true);
            await createRp.execute({
                fecha: fecha,
                monto: monto,
                nota: nota,
                cotizacionId: cotizacion.id
            });
            showNotification('Registro de pago creado exitosamente.', 'success');
            setFecha('');
            setMonto('');
            setNota('');
        } catch (error) {
            console.error(error);
            showNotification('Error al crear el registro de pago.', 'error');
        } finally {
            fetchData();
        }
    }

    const handleDeleteRp = async (id) => {
        try {
            setLoading(true);
            await deleteRp.execute(id);
            showNotification('Registro de pago eliminado exitosamente.', 'success');
        } catch (error) {
            console.error(error);
            showNotification('Error al eliminar el registro de pago.', 'error');
        } finally {
            fetchData();
        }
    }

    useEffect(() => {
        fetchData();
    }, []);


  return (
    <div className="registro-pagos-modal-overlay">
        <div className="registro-pagos-modal">
            <div className='registro-pagos-modal-header'>
                <div className='registro-pagos-modal-header-left'>
                    <h3>Registro de pagos</h3>
                    <div>
                        <div>{cotizacion?.cliente?.nombre}</div>
                        <div>{cotizacion?.nombreCotizacion}</div>
                    </div>
                </div>
                <i 
                    className="pi pi-times" 
                    style={{ marginBottom: "1rem", cursor:"pointer" }}
                    onClick={loading ? undefined : onHide}>
                </i>
            </div>
            <div className='registro-pagos-modal-body'>
                <FloatLabel style={{width: '10rem'}}>
                    <Calendar 
                        id="fecha" 
                        className="p-inputtext-sm" 
                        value={fecha} 
                        onChange={e => setFecha(e.target.value)}
                        required 
                    />
                    <label htmlFor="fecha">Fecha de pago</label>
                </FloatLabel>
                <FloatLabel style={{width: '7rem'}}>
                    <InputNumber
                        id="monto"
                        className="p-inputtext-sm"
                        value={monto}
                        onValueChange={e => setMonto(e.value)}
                        required
                    />
                    <label htmlFor="monto">Monto</label>
                </FloatLabel>
                <FloatLabel style={{width: '20rem'}}>
                    <InputText 
                        id="nota" 
                        className="p-inputtext-sm" 
                        value={nota} 
                        onChange={e => setNota(e.target.value)}
                    />
                    <label htmlFor="nota">Nota</label>
                </FloatLabel>
                <Button 
                    icon="pi pi-plus"
                    className="p-button-sm" 
                    onClick={() => handleSaveRegistroPago()}
                    disabled={loading}
                    loading={loading}
                />
            </div>
            <DataTable 
                value={registroPago}
                loading={loading}
                emptyMessage="No hay registros de pago"
            >
                <Column 
                    field="fecha" 
                    header="Fecha de pago" 
                    style={{ width: '20%' }}
                />
                <Column 
                    field="nota" 
                    header="Nota" 
                    style={{ width: '60%' }} 
                />
                <Column 
                    field="monto" 
                    header="Monto"
                    style={{ width: '13%' }} 
                />
                <Column
                    style={{ width: '7%' }}
                    body={rowData => (
                        <span style={{ display: 'flex', justifyContent: 'center' }}>
                            <i 
                                className="pi pi-trash"    
                                title="Eliminar" 
                                style={{cursor:"pointer"}}
                                onClick={() => handleDeleteRp(rowData.id)}    
                            ></i>
                        </span>
                    )}
                />
            </DataTable>
            <div className='registro-pagos-modal-footer'>
                    <div style={{ color: '#888888ff'}}>
                        Monto expresado en USD
                    </div>
                    <div style={{ textAlign: 'right', color: '#525252ff', fontWeight: 'bold' }}>
                        <div>Adelanto: {adelanto.toFixed(2)}</div>
                        <div>Saldo: {saldo.toFixed(2)}</div>
                    </div>
            </div>
        </div>
    </div>);
}


export default RegistroPagosModal;
