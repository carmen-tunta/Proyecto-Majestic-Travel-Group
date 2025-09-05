import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import ServiceRepository from '../../../modules/Service/repository/ServiceRepository';
import UpdateService from '../../../modules/Service/application/UpdateService';
import CreateService from '../../../modules/Service/application/CreateService';
import DeleteComponentFromService from '../../../modules/Service/application/DeleteComponentFromService';
import { useNotification } from '../../Notification/NotificationContext';
import { Dropdown } from 'primereact/dropdown';
import "../styles/ServicesModal.css"
import { FileUpload } from "primereact/fileupload";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const ServicesModal = ({ onHide, service }) => {
    const peruCities = ["Lima", "Cusco", "Arequipa", "Trujillo", "Iquitos", "Puno", "Chiclayo", "Piura", "Huaraz", "Nazca"];
    const serviceRepository = new ServiceRepository();
    const updateService = new UpdateService(serviceRepository);
    const createService = new CreateService(serviceRepository);
    const deleteComponentFromService = new DeleteComponentFromService(serviceRepository);
    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);

    const [serviceName, setServiceName] = useState(service?.name || '');
    const [serviceCity, setServiceCity] = useState(service?.city || '');
    const [serviceComponents, setServiceComponents] = useState(service?.components || []);

    useEffect(() => {
        setServiceName(service?.name || '');
        setServiceCity(service?.city || '');
        setServiceComponents(service?.components || []);
    }, [service]);

    const handleSave = async () => {
        if (!serviceName.trim() || !serviceCity.trim()) {
            showNotification('Completa todos los campos correctamente.', 'error');
            return;
        }
        setLoading(true);
        try {
            if (service && service.id) {
                await updateService.execute({
                    ...service,
                    name: serviceName.trim(),
                    city: serviceCity.trim()
                });
            showNotification('Servicio actualizada con éxito!', 'success');
        } else {
            await createService.execute({
                name: serviceName.trim(),
                city: serviceCity.trim()
            });
            showNotification('Servicio creado con éxito!', 'success');
        }
        onHide();
        } catch (error) {
            showNotification('Error al guardar el servicio', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (component) => {
        try {
            await deleteComponentFromService.execute(service.id, component.id);
            showNotification('Componente eliminado con éxito!', 'success');
            setServiceComponents(prevComponents => prevComponents.filter(c => c.id !== component.id));
        } catch (error) {
            showNotification('Error al eliminar el componente', 'error');
            console.error('Error al eliminar el componente:', error);
        }
    }

    return (
        <div className="service-modal-overlay">
            <div className="service-modal">
                <div className='service-modal-header'>
                    <h3>{service ? "Editar Servicio" : "Nuevo Servicio"}</h3>
                    <i 
                        className="pi pi-times" 
                        style={{ marginBottom: "1rem", cursor:"pointer" }}
                        onClick={onHide}>
                    </i>
                </div>
                <FloatLabel>
                    <InputText 
                        id="name" 
                        className="p-inputtext-sm" 
                        value={serviceName} 
                        onChange={e => setServiceName(e.target.value)}
                        required 
                    />
                    <label htmlFor="name">Nombre del servicio</label>
                </FloatLabel>
                <FloatLabel>
                    <Dropdown 
                        inputId="city"
                        value={serviceCity} 
                        options={peruCities}
                        onChange={(e) => setServiceCity(e.value)} 
                        style={{ width: '100%' }}
                    />
                    <label htmlFor="city">Ciudad</label>
                </FloatLabel>
                <div className="p-4">
                    <p>Galería de imágenes</p>
                    <FileUpload
                        name="images[]"
                        mode="basic"
                        accept="image/*"
                        chooseLabel="Subir"
                        className='service-images'
                    />
                </div>
                <div className='service-components-search'>
                    <div className="p-input-icon-left" style={{ width: '70%' }}>
                        <i className="pi pi-search"/>
                        <InputText 
                            type="text" 
                            placeholder="Buscar..." 
                            className='p-inputtext-sm'/>
                    </div>
                    <div>
                        <Button icon="pi pi-plus" outlined label='Agregar' size='small'></Button>
                    </div>
                </div>


                <div className="card">
                    <DataTable scrollable scrollHeight="100px" className="components-table" size="small" value={serviceComponents} tableStyle={{ minWidth: '60%' }} emptyMessage="Este servicio aun no cuenta con componentes">
                        <Column 
                            field="componentName" 
                            header="Nombre del componente" 
                            style={{ width: '60%' }}>    
                        </Column>
                        <Column 
                            field="serviceType" 
                            header="Tipo de servicio" 
                            style={{ width: '40%' }}>
                        </Column>
                        <Column
                            header=""
                            style={{ width: '6%' }}
                            body={rowData => (
                                <span style={{ display: 'flex', justifyContent: 'center' }}>
                                    <i 
                                        className="pi pi-trash"    
                                        title="Eliminar" 
                                        style={{color:'#gray', cursor:"pointer"}}
                                        onClick={() => handleDelete(rowData)}
                                    ></i>
                                </span>
                            )}
                        />
                    </DataTable>
                </div>


                <div className='service-modal-buttons'>
                    <Button 
                        label="Cancelar" 
                        size='small' 
                        outlined
                        className='p-button-secondary'
                        onClick={onHide}
                    />
                    <Button 
                        label={(service && service.id ? "Editar" : "Guardar")}
                        size='small' 
                        className='p-button-primary'
                        onClick={handleSave}
                        disabled={loading}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    )
}

export default ServicesModal;