import { useEffect, useState } from "react";
import { useNotification } from "../../Notification/NotificationContext";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

import "../styles/DatosViajeModal.css"
import { InputTextarea } from "primereact/inputtextarea";
import DatosViajeRepository from "../../../modules/Cotizacion/repository/DatosViajeRepository";
import getDatosViajeByCotizacionId from "../../../modules/Cotizacion/application/GetDatosViajeByCotizacionId";
import CreateDatosViaje from "../../../modules/Cotizacion/application/CreateDatosVidaje";
import { escapeRegExp } from "pdf-lib";
import UpdateDatosViaje from "../../../modules/Cotizacion/application/UpdateDatosViaje";
import { addLocale } from "primereact/api";
import { InputNumber } from "primereact/inputnumber";
import { ProgressSpinner } from "primereact/progressspinner";

const DatosViajeModal = ({ onHide, cotizacion }) => {
    const datosVidajeRepo = new DatosViajeRepository();
    const getDatosViaje = new getDatosViajeByCotizacionId(datosVidajeRepo);
    const createDatosViaje = new CreateDatosViaje(datosVidajeRepo);
    const updateDatosViaje = new UpdateDatosViaje(datosVidajeRepo);

    const [datosViaje, setDatosViaje] = useState(null);
    const [fechaLlegada, setFechaLlegada] = useState(null);
    const [fechaSalida, setFechaSalida] = useState(null);
    const [cantidadAdultos, setCantidadAdultos] = useState('');
    const [cantidadNinos, setCantidadNinos] = useState('')
    const [cantidadBebes, setCantidadBebes] = useState('');
    const [lugarRecojo, setLugarRecojo] = useState('');
    const [comentario, setComentario] = useState('');

    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);

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

    useEffect(() => {
        fetchDatosViaje();
    }, [cotizacion]);

    const fetchDatosViaje = async () => {
        setLoadingModal(true);
        try {
            const datos = await getDatosViaje.execute(cotizacion.id);
            if (!datos) {
                return;
            }
            console.log(datos)
            setDatosViaje(datos);
            setFechaLlegada(datos.fechaLlegada ? parseLocalDate(datos.fechaLlegada) : null);
            setFechaSalida(datos.fechaSalida ? parseLocalDate(datos.fechaSalida) : null);
            setCantidadAdultos(datos.adultos);
            setCantidadNinos(datos.ninos);
            setCantidadBebes(datos.bebes);
            setLugarRecojo(datos.lugarRecojo);
            setComentario(datos.comentario || '');
        } catch (error) {
            console.error("Error al cargar los datos de viaje");
        } finally {
            setLoadingModal(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        if (!fechaLlegada || !fechaSalida || !lugarRecojo) {
            showNotification('Por favor, completa todos los campos obligatorios.', 'error');
            return;
        }
        try {
            setLoading(true);
            if (!datosViaje) {
                await createDatosViaje.execute({
                    cotizacionId: cotizacion.id,
                    fechaLlegada: fechaLlegada,
                    fechaSalida: fechaSalida,
                    adultos: cantidadAdultos,
                    ninos: cantidadNinos,
                    bebes: cantidadBebes,
                    lugarRecojo: lugarRecojo,
                    comentario: comentario
                });
                showNotification('Datos de viaje guardados correctamente.', 'success');
            } else {
                await updateDatosViaje.execute(cotizacion.id, {
                    fechaLlegada: fechaLlegada,
                    fechaSalida: fechaSalida,
                    adultos: cantidadAdultos,
                    ninos: cantidadNinos,
                    bebes: cantidadBebes,
                    lugarRecojo: lugarRecojo,
                    comentario: comentario
                });
                showNotification('Datos de viaje actualizados correctamente.', 'success');
            }
        } catch (error) {
            console.error("Error al crear los datos de viaje");
        } finally {
            setLoading(false);
            onHide();
        }
    }

    return (
        <div className="datos-viaje-modal-overlay">
            <div className="datos-viaje-modal">
                {loadingModal ? <ProgressSpinner/> :
                (
                <>
                <div className='datos-viaje-modal-header'>
                    <h3>{datosViaje?.id ? 'Editar ' : 'Añadir '} datos de viaje</h3>
                    <i 
                        className="pi pi-times" 
                        style={{ marginBottom: "1rem", cursor:"pointer" }}
                        onClick={() => loading ? undefined : onHide()}>
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
                            dateFormat="D dd M y"
                            locale="es"
                            maxDate={fechaSalida}
                            disabled={loading}
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
                            dateFormat="D dd M y"
                            locale="es"
                            minDate={fechaLlegada}
                            disabled={loading}
                        />
                        <label htmlFor="salida">Fecha de salida</label>
                    </FloatLabel>
                </div>
                <div className="datos-viaje-modal-cantidades">
                    <FloatLabel>
                        <InputNumber
                            id="adultos" 
                            className="p-inputtext-sm" 
                            value={cantidadAdultos} 
                            onValueChange={e => setCantidadAdultos(e.value)}
                            required 
                            min={0}
                            step={1}
                            mode="decimal"
                            minFractionDigits={0} 
                            maxFractionDigits={0}
                            disabled={loading}
                        />
                        <label htmlFor="adultos">Nº adultos</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputNumber
                            id="ninos" 
                            className="p-inputtext-sm" 
                            value={cantidadNinos} 
                            onValueChange={e => setCantidadNinos(e.value)}
                            min={0}
                            step={1}
                            mode="decimal"
                            minFractionDigits={0} 
                            maxFractionDigits={0}
                            disabled={loading}
                        />
                        <label htmlFor="ninos">Nº niños(as)</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputNumber
                            id="bebes" 
                            className="p-inputtext-sm" 
                            value={cantidadBebes} 
                            onValueChange={e => setCantidadBebes(e.value)}
                            min={0}
                            step={1}
                            mode="decimal"
                            minFractionDigits={0} 
                            maxFractionDigits={0}
                            disabled={loading}
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
                        disabled={loading}
                    />
                    <label htmlFor="recojo">Lugar de recojo</label>
                </FloatLabel>

                <FloatLabel className="comentario">
                    <InputTextarea
                        id="comentario" 
                        className="p-inputtext-sm" 
                        value={comentario} 
                        onChange={e => setComentario(e.target.value)}
                        disabled={loading}
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
                        disabled={loading}
                    />
                    <Button 
                        label={(datosViaje && datosViaje.id ? "Editar" : "Guardar")}
                        size='small' 
                        className='p-button-primary'
                        onClick={handleCreateOrUpdate}
                        disabled={loading}
                        loading={loading}
                    />
                </div>
                </>
                )}
            </div>
        </div>
    );
};

export default DatosViajeModal;
