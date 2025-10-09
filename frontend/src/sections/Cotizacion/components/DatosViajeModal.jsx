import { useState } from "react";
import { useNotification } from "../../Notification/NotificationContext";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

import "../styles/DatosViajeModal.css"
import { InputTextarea } from "primereact/inputtextarea";

const DatosViajeModal = ({ visible, onHide, cotizacion }) => {
    
    const [fechaLlegada, setFechaLlegada] = useState('');
    const [fechaSalida, setFechaSalida] = useState('');
    const [cantidadAdultos, setCantidadAdultos] = useState(0);
    const [cantidadNinos, setCantidadNinos] = useState(0);
    const [cantidadBebes, setCantidadBebes] = useState(0);
    const [lugarRecojo, setLugarRecojo] = useState('');
    const [comentario, setComentario] = useState('');

    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);


    return (
        <div className="datos-viaje-modal-overlay">
            <div className="datos-viaje-modal">
                <div className='datos-viaje-modal-header'>
                    <h3>Datos de viaje</h3>
                    <i 
                        className="pi pi-times" 
                        style={{ marginBottom: "1rem", cursor:"pointer" }}
                        onClick={onHide}>
                    </i>
                </div>
                <div className="datos-viaje-modal-dates">
                    <FloatLabel>
                        <Calendar 
                            id="llegada" 
                            className="p-inputtext-sm" 
                            value={fechaLlegada} 
                            onChange={e => setFechaLlegada(e.target.value)}
                            required 
                        />
                        <label htmlFor="llegada">Fecha de llegada</label>
                    </FloatLabel>
                    <FloatLabel>
                        <Calendar 
                            id="salida" 
                            className="p-inputtext-sm" 
                            value={fechaSalida} 
                            onChange={e => setFechaSalida(e.target.value)}
                            required 
                        />
                        <label htmlFor="salida">Fecha de salida</label>
                    </FloatLabel>
                </div>
                <div className="datos-viaje-modal-cantidades">
                    <FloatLabel>
                        <InputText 
                            id="adultos" 
                            className="p-inputtext-sm" 
                            value={cantidadAdultos} 
                            onChange={e => setCantidadAdultos(e.target.value)}
                            required 
                        />
                        <label htmlFor="adultos">Nº adultos</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputText 
                            id="ninos" 
                            className="p-inputtext-sm" 
                            value={cantidadNinos} 
                            onChange={e => setCantidadNinos(e.target.value)}
                            required 
                        />
                        <label htmlFor="ninos">Nº niños(as)</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputText 
                            id="bebes" 
                            className="p-inputtext-sm" 
                            value={cantidadBebes} 
                            onChange={e => setCantidadBebes(e.target.value)}
                            required 
                        />
                        <label htmlFor="bebes">Nº bebés</label>
                    </FloatLabel>
                </div>

                <FloatLabel>
                    <InputText 
                        id="recojo" 
                        className="p-inputtext-sm" 
                        value={lugarRecojo} 
                        onChange={e => setLugarRecojo(e.target.value)}
                        required 
                    />
                    <label htmlFor="recojo">Lugar de recojo</label>
                </FloatLabel>

                <FloatLabel className="comentario">
                    <InputTextarea
                        id="comentario" 
                        className="p-inputtext-sm" 
                        value={comentario} 
                        onChange={e => setComentario(e.target.value)}
                        
                    />
                    <label htmlFor="comentario">Comentario o nota</label>
                </FloatLabel>

                <div className='datos-viaje-modal-buttons'>
                    <Button
                        label="Cancelar" 
                        size='small' 
                        outlined
                        className='p-button-secondary'
                        onClick={onHide}
                    />
                    <Button 
                        label={(cotizacion && cotizacion.id ? "Editar" : "Guardar")}
                        size='small' 
                        className='p-button-primary'
                        onClick={undefined}
                        disabled={loading}
                        loading={loading}
                    />
                </div>
            </div>
        </div>);
};

export default DatosViajeModal;
