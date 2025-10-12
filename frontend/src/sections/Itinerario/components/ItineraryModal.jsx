import '../styles/ItineraryModal.css';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import ItineraryTemplateRepository from '../../../modules/ItineraryTemplate/repository/ItineraryTemplateRepository';
import UpdateItineraryTemplate from '../../../modules/ItineraryTemplate/application/UpdateItineraryTemplate';
import CreateItineraryTemplate from '../../../modules/ItineraryTemplate/application/CreateItineraryTemplate';
import { useEffect, useState } from 'react';
import { useNotification } from '../../Notification/NotificationContext';

const ItineraryModal = ({ onHide, template }) => {
    const itineraryTemplate = new ItineraryTemplateRepository();
    const updateTemplate = new UpdateItineraryTemplate(itineraryTemplate);
    const createItinerary = new CreateItineraryTemplate(itineraryTemplate);
    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);

    const [itineraryTitle, setItineraryTitle] = useState(template?.itineraryTitle || '');
    const [templateTitle, setTemplateTitle] = useState(template?.templateTitle || '');
    const [editorContent, setEditorContent] = useState('');

    useEffect(() => {
        setItineraryTitle(template?.itineraryTitle || '');
        setTemplateTitle(template?.templateTitle || '');
        setEditorContent(template?.description || '');
    }, [template]);

    const handleSave = async () => {
        if (!itineraryTitle.trim() || !templateTitle.trim() || !editorContent.trim()) {
            showNotification('Completa todos los campos correctamente.', 'error');
            return;
        }
        setLoading(true);
        try {
            if (template && template.id) {
                await updateTemplate.execute({
                    ...template,
                    itineraryTitle: itineraryTitle.trim(),
                    templateTitle: templateTitle.trim(),
                    description: editorContent
                });
            showNotification('¡Plantilla actualizada con éxito!', 'success');
        } else {
            await createItinerary.execute({
                itineraryTitle: itineraryTitle.trim(),
                templateTitle: templateTitle.trim(),
                description: editorContent
            });
            showNotification('¡Plantilla creada con éxito!', 'success');
        }
        onHide();
        } catch (error) {
            showNotification('Error al guardar la plantilla', 'error');
        } finally {
            setLoading(false);
        }
    };



  return (
    <div className="itinerary-modal-overlay">
        <div className="itinerary-modal">
            <div className='itinerary-modal-header'>
                <h3>{template ? "Editar Plantilla Itineraria" : "Nueva Plantilla Itineraria"}</h3>
                <i 
                    className="pi pi-times" 
                    style={{ cursor: "pointer", fontSize: "1.2rem", color: "#666" }}
                    onClick={onHide}>
                </i>
            </div>

            <div className="itinerary-modal-content">
                <FloatLabel>
                    <InputText 
                        id="plantilla" 
                        className="p-inputtext-sm" 
                        value={templateTitle} 
                        onChange={e => setTemplateTitle(e.target.value)}
                        placeholder=" "
                        required 
                        style={{ width: '100%' }}
                    />
                    <label htmlFor="plantilla">Título de plantilla</label>
                </FloatLabel>
                
                <FloatLabel>
                    <InputText 
                        id="itinerario" 
                        className="p-inputtext-sm" 
                        value={itineraryTitle} 
                        onChange={e => setItineraryTitle(e.target.value)}
                        placeholder=" "
                        required 
                        style={{ width: '100%' }}
                    />
                    <label htmlFor="itinerario">Título para itinerario</label>
                </FloatLabel>
                
                <Editor 
                    style={{ width: '100%' }} 
                    placeholder="Descripción de la plantilla"
                    value={editorContent}
                    onTextChange={(e) => setEditorContent(e.htmlValue)}
                />
            </div>

            <div className='itinerary-modal-buttons'>
                <Button 
                    label="Cancelar" 
                    size='small' 
                    outlined
                    className='p-button-secondary'
                    onClick={onHide}
                />
                <Button 
                    label={(template && template.id ? "Editar" : "Guardar")}
                    size='small' 
                    className='p-button-primary'
                    onClick={handleSave}
                    disabled={loading}
                    loading={loading}
                />
            </div>
        </div>
    </div>);
}


export default ItineraryModal;
