import CreateTarifaIncrement from "../../../../modules/TarifaIncrement/application/CreateTarifaIncrement";
import UpdateTarifaIncrement from "../../../../modules/TarifaIncrement/application/UpdateTarifaIncrement";
import TarifaIncrementRepository from "../../../../modules/TarifaIncrement/repository/TarifaIncrementRepository";
import { useNotification } from "../../../Notification/NotificationContext";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { Calendar } from "primereact/calendar";
import { useState } from "react";
import { addLocale } from "primereact/api";
import "../../styles/Tarifario/IncrementoModal.css"


const IncrementoModal = ({ onHide, increment, tarifa }) => {
    const tarifaIncrementRepo = new TarifaIncrementRepository();
    const createIncrement = new CreateTarifaIncrement(tarifaIncrementRepo);
    const updateIncrement = new UpdateTarifaIncrement(tarifaIncrementRepo);
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
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

    const [date, setDate] = useState(increment && increment.incrementDate ? parseLocalDate(increment.incrementDate) : null);
    const [percentage, setPercentage] = useState(increment?.percentage || false);
    const [value, setValue] = useState(increment?.incrementValue || '');

    const handleSave = async () => {
        setLoading(true);
        try {
            if (increment && increment.id) {
                await updateIncrement.execute({
                    ...increment,
                    incrementDate: date,
                    percentage,
                    incrementValue: value
                });
                showNotification('Incremento actualizado correctamente.', 'success');
            } else {
                await createIncrement.execute({
                    tarifaId: tarifa.id,
                    incrementDate: date,
                    percentage,
                    incrementValue: value
                });
                showNotification('Incremento creado correctamente.', 'success');
            }
            onHide();
        } catch (error) {
            console.error("Error saving increment:", error);
            showNotification('Error al guardar el incremento.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="increment-modal-overlay">
            <div className="increment-modal">
                <div className='increment-modal-header'>
                    <h3>{increment ? "Editar incremento" : "Agregar incremento"}</h3>
                    <i 
                        className="pi pi-times" 
                        style={{ marginBottom: "1rem", cursor:"pointer" }}
                        onClick={onHide}>
                    </i>
                </div>
                <FloatLabel>
                    <Calendar
                        id="date"
                        value={date}
                        onChange={e => setDate(e.value)}
                        dateFormat="D dd M y"
                        locale="es"
                        required
                    />
                    <label htmlFor="date">Fecha de incremento</label>
                </FloatLabel>
                <div className="checkbox-percentage">
                    <Checkbox
                        inputId="percentage"
                        checked={percentage}
                        onChange={e => setPercentage(e.checked)}
                    />
                    <label htmlFor="percentage" style={{ marginLeft: '8px' }}>Porcentaje</label>
                </div>
                <FloatLabel>
                <InputNumber 
                    id="value" 
                    value={value}
                    onValueChange={e => setValue(e.value)}
                    required
                    min={0}
                    step={percentage ? 1 : 0.01}
                    mode="decimal"
                    minFractionDigits={ percentage ? 0 : 2 } 
                    maxFractionDigits={percentage ? 0 : 2}
                />
                <label htmlFor="value">Valor incremento</label>
            </FloatLabel>

                <div className='increment-modal-buttons'>
                    <Button 
                        label="Cancelar" 
                        size='small' 
                        outlined
                        className='p-button-secondary'
                        onClick={onHide}
                    />
                    <Button 
                        label={(increment && increment.id ? "Editar" : "Guardar")}
                        size='small' 
                        className='p-button-primary'
                        onClick={handleSave}
                        disabled={loading}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default IncrementoModal;