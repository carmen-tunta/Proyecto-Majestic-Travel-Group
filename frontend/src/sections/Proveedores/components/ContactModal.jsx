import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { useNotification } from '../../Notification/NotificationContext';
import ProveedorContactRepository from '../../../modules/ProveedorContact/repository/ProveedorContactRepository';
import UpdateProveedorContact from '../../../modules/ProveedorContact/application/UpdateProveedorContact';
import CreateProveedorContact from '../../../modules/ProveedorContact/application/CreateProveedorContact';
import "../styles/ContactModal.css"
import { Dropdown } from 'primereact/dropdown';


const ContactModal = ({ onHide, contact, proveedor }) => {
    const contactRepository = new ProveedorContactRepository();
    const updateContact = new UpdateProveedorContact(contactRepository);
    const createContact = new CreateProveedorContact(contactRepository);
    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);

    const [medium, setMedium] = useState(contact?.medium || '');
    const [description, setDescription] = useState(contact?.description || '');
    const [note, setNote] = useState('');

    useEffect(() => {
        setMedium(contact?.medium || '');
        setDescription(contact?.description || '');
        setNote(contact?.note || '');
    }, [contact]);

    const handleSave = async () => {
        if (!medium.trim() || !description.trim() || !note.trim()) {
            showNotification('Completa todos los campos correctamente.', 'error');
            return;
        }
        setLoading(true);
        try {
            if (contact && contact.id) {
                await updateContact.execute({
                    ...contact,
                    medium: medium.trim(),
                    description: description.trim(),
                    note: note.trim(),
                    proveedorId: proveedor.id
                });
            showNotification('Medio de contacto actualizado con éxito!', 'success');
        } else {
            await createContact.execute({
                medium: medium.trim(),
                description: description.trim(),
                note: note.trim(),
                proveedorId: proveedor.id
            });
            showNotification('Medio de contacto creado con éxito!', 'success');
        }
        onHide();
        } catch (error) {
            showNotification('Error al guardar el medio de contacto', 'error');
        } finally {
            setLoading(false);
        }
    };



  return (
    <div className="contact-modal-overlay">
        <div className="contact-modal">
            <div className='contact-modal-header'>
                <h3>{contact ? "Editar medio de contacto" : "Nuevo medio de contacto"}</h3>
                <i 
                    className="pi pi-times" 
                    style={{ marginBottom: "1rem", cursor:"pointer" }}
                    onClick={onHide}>
                </i>
            </div>
            <FloatLabel>
                <Dropdown 
                    id="medium" 
                    value={medium}
                    options={['WhatsApp', 'Correo', 'Red social', 'Persona', 'Teléfono']} 
                    onChange={e => setMedium(e.value)}
                    required 
                />
                <label htmlFor="medium">Medio</label>
            </FloatLabel>
            <FloatLabel>
                <InputText 
                    id="description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    required 
                />
                <label htmlFor="description">Descripción</label>
            </FloatLabel>
            <FloatLabel>
                <InputText 
                    id="note" 
                    value={note} 
                    onChange={e => setNote(e.target.value)}
                    required 
                />
                <label htmlFor="note">Nota</label>
            </FloatLabel>
            <div className='contact-modal-buttons'>
                <Button 
                    label="Cancelar" 
                    outlined
                    className='p-button-secondary'
                    onClick={onHide}
                />
                <Button 
                    label={(contact && contact.id ? "Editar" : "Guardar")}
                    className='p-button-primary'
                    onClick={handleSave}
                    disabled={loading}
                    loading={loading}
                />
            </div>
        </div>
    </div>);
}


export default ContactModal;
