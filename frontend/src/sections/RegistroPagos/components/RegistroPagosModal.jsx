import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { useNotification } from '../../Notification/NotificationContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import "../styles/RegistroPagosModal.css"

const RegistroPagosModal = ({ onHide, cotizacion }) => {
    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);

    const [fecha, setFecha] = useState('');
    const [monto, setMonto] = useState('');
    const [nota, setNota] = useState('');


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
                    onClick={onHide}>
                </i>
            </div>
            <div className='registro-pagos-modal-body'>
                <FloatLabel style={{width: '10rem'}}>
                    <InputText 
                        id="fecha" 
                        className="p-inputtext-sm" 
                        value={fecha} 
                        onChange={e => setFecha(e.target.value)}
                        required 
                    />
                    <label htmlFor="fecha">Fecha de pago</label>
                </FloatLabel>
                <FloatLabel style={{width: '7rem'}}>
                    <InputText 
                        id="monto" 
                        className="p-inputtext-sm" 
                        value={monto} 
                        onChange={e => setMonto(e.target.value)}
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
                        required 
                    />
                    <label htmlFor="nota">Nota</label>
                </FloatLabel>
                <Button 
                    icon="pi pi-plus"
                    className="p-button-sm" 
                    onClick={() => undefined}
                    disabled={loading}
                    loading={loading}
                />
            </div>
            <DataTable value={[]}>
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
                                onClick={() => undefined }    
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
                        <div>Adelanto: 00.00</div>
                        <div>Saldo: 00.00</div>
                    </div>
            </div>
        </div>
    </div>);
}


export default RegistroPagosModal;
