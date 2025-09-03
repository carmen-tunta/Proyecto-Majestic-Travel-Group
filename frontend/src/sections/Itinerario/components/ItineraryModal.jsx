import '../styles/ItineraryModal.css';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';

const ItineraryModal = ({ onHide, template }) => {
  return (
    <div className="itinerary-modal-overlay">
        <div className="itinerary-modal">
            <div className='itinerary-modal-header'>
                <h3>{template ? "Editar Plantilla Itineraria" : "Nueva Plantilla Itineraria"}</h3>
                <i 
                    className="pi pi-times" 
                    style={{ marginBottom: "1rem", cursor:"pointer" }}
                    onClick={onHide}>
                </i>
            </div>
            <FloatLabel>
                <InputText id="plantilla" className="p-inputtext-sm" value={template?.itineraryTitle || ''} />
                <label htmlFor="plantilla">Título de plantilla</label>
            </FloatLabel>
            <FloatLabel>
                <InputText id="itinerario" className="p-inputtext-sm" value={template?.templateTitle || ''} />
                <label htmlFor="itinerario">Título para itinerario</label>
            </FloatLabel>
            <Editor 
                style={{ height: '20vh' }} 
            />
            <div className='itinerary-modal-buttons'>
                <Button 
                    label="Cancelar" 
                    size='small' 
                    outlined
                    className='p-button-secondary'
                    onClick={onHide}
                />
                <Button 
                    label="Guardar" 
                    size='small' 
                    className='p-button-primary'
                />
            </div>
        </div>
    </div>);
}


export default ItineraryModal;
