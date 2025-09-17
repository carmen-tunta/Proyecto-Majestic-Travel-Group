import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useModal } from "../../../../contexts/ModalContext";
import { useNotification } from "../../../Notification/NotificationContext";
import ProveedorContactRepository from "../../../../modules/ProveedorContact/repository/ProveedorContactRepository";
import GetContactByIdProveedor from "../../../../modules/ProveedorContact/application/GetContactByIdProveedor";
import DeleteProveedorContact from "../../../../modules/ProveedorContact/application/DeleteProveedorContact";
import ContactModal from "./ContactModal";
import "../../styles/DetallesProveedores.css"

const Contact = ( {proveedor} ) => {
    const [visible, setVisible] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const contactRepository = new ProveedorContactRepository();
    const getContactByIdProveedor = new GetContactByIdProveedor(contactRepository);
    const deleteContact = new DeleteProveedorContact(contactRepository);
    const [contacts, setContacts] = useState([]);
    const { showNotification } = useNotification();

    const [loadContactsing, setLoadContacts] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const { setIsModalOpen } = useModal();

    const loadContacts = async () => {
        setLoadContacts(true);
        try {
            const contactData = await getContactByIdProveedor.execute(proveedor.id);
            setContacts(Array.isArray(contactData) ? contactData : []);
        } catch (error) {
            console.error('Error al obtener los contactos:', error);
            setContacts([]);
        } finally {
            setLoadContacts(false);
        }
    };

    useEffect(() => {  
        loadContacts();
    }, []);

    const handleEditContact = (contact) => {
        setSelectedContact(contact);
        setShowModal(true);
        setIsModalOpen(true);
    };

    const handleNewContact = () => {
        setSelectedContact(null);
        setShowModal(true);
        setIsModalOpen(true);
    }   

    const handleDeleteIconClick = (contact) => {
        setContactToDelete(contact);
        setVisible(true);
    };

    const reject = () => {
        setContactToDelete(null);
        setVisible(false);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsModalOpen(false);
        loadContacts();
    };
    
    const handleDeleteContact = async () => {
        if (contactToDelete && contactToDelete.id) {
            try {
                await deleteContact.execute(contactToDelete.id);
                showNotification('Medio de contacto eliminado con éxito!', 'success');
                loadContacts();
            } catch (error) {
                console.error('Error al eliminar el contacto:', error);
                showNotification('Error al eliminar el medio de contacto', 'error');
            } finally {
                setContactToDelete(null);
                setVisible(false);
            }
        }
    }
    
    
    return (
        <div className="contact">
            <div className="contact-header">
                <h3>Datos de contacto</h3>
                <Button 
                    icon="pi pi-plus" 
                    label="Nuevo" 
                    size='small' 
                    outlined
                    onClick={() => handleNewContact()}
                />
            </div>
            <DataTable
                className="contact-table"
                size="small"
                loading={loadContactsing}
                value={contacts}
                emptyMessage="No se encontraron medios de contacto"
            >
                <Column field="medium" header="Medio" />
                <Column field="description" header="Descripción" />
                <Column field="note" header="Nota" />
                <Column field="actions"  
                    body={rowData => (
                        <span style={{ display: 'flex', justifyContent: 'center' }}>
                            <i
                                className="pi pi-pencil"
                                title="Editar"
                                style={{ cursor: "pointer", marginRight: '10px' }}
                                onClick={() => handleEditContact(rowData)}
                            ></i>
                            <i
                                className="pi pi-trash"
                                title="Borrar"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleDeleteIconClick(rowData)}
                            ></i>
                        </span>
                    )} />
            </DataTable>
                <ConfirmDialog 
                    group="declarative"  
                    visible={visible} 
                    onHide={() => setVisible(false)} 
                    message="¿Seguro que  deseas eliminar este medio de contacto?" 
                    header="Confirmación" 
                    icon="pi pi-exclamation-triangle" 
                    accept={() => handleDeleteContact()}
                    reject={() => reject()} 
                />

                {showModal && (
                    <ContactModal
                        visible={showModal}
                        onHide={handleModalClose}
                        contact={selectedContact}
                        proveedor={proveedor}
                    />
                )}
        </div>
    );
}

export default Contact;