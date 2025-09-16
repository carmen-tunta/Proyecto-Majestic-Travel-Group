import CreateTarifaIncrement from "../../../../modules/TarifaIncrement/application/CreateTarifaIncrement";
import UpdateTarifaIncrement from "../../../../modules/TarifaIncrement/application/UpdateTarifaIncrement";
import TarifaIncrementRepository from "../../../../modules/TarifaIncrement/repository/TarifaIncrementRepository";
import { useNotification } from "../../../Notification/NotificationContext";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { Calendar } from "primereact/calendar";
import { useState } from "react";
import "../../styles/Tarifario/IncrementoModal.css"


const IncrementoModal = ({ onHide, increment, tarifa }) => {
    const tarifaIncrementRepo = new TarifaIncrementRepository();
    const createIncrement = new CreateTarifaIncrement(tarifaIncrementRepo);
    const updateIncrement = new UpdateTarifaIncrement(tarifaIncrementRepo);
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState(increment?.incrementDate || '');
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
                <div>
                    <Checkbox
                        inputId="percentage"
                        checked={percentage}
                        onChange={e => setPercentage(e.checked)}
                    />
                    <label htmlFor="percentage" style={{ marginLeft: '8px' }}>Porcentaje</label>
                </div>
                <FloatLabel>
                    <InputText 
                        id="value" 
                        value={value} 
                        onChange={e => setValue(e.target.value)}
                        required 
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