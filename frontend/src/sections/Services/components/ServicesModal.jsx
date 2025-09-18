import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import SearchBar from '../../../components/SearchBar';
import useSearch from '../../../hooks/useSearch';
import { apiService } from '../../../services/apiService';
import ServiceRepository from '../../../modules/Service/repository/ServiceRepository';
import UpdateService from '../../../modules/Service/application/UpdateService';
import CreateService from '../../../modules/Service/application/CreateService';
import DeleteComponentFromService from '../../../modules/Service/application/DeleteComponentFromService';
import { useNotification } from '../../Notification/NotificationContext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from "primereact/fileupload";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Galleria } from 'primereact/galleria';
import "../styles/ServicesModal.css"
import ServiceImageRepository from '../../../modules/Service/repository/ServiceImageRepository';
import UploadServiceImage from '../../../modules/Service/application/UploadServiceImage';
import GetServiceImagesByServiceId from '../../../modules/Service/application/GetServiceImagesByServiceId';

const ServicesModal = ({ onHide, service }) => {
    const peruCities = ["Lima", "Cusco", "Arequipa", "Trujillo", "Iquitos", "Puno", "Chiclayo", "Piura", "Huaraz", "Nazca"];
    const serviceRepository = new ServiceRepository();
    const updateService = new UpdateService(serviceRepository);
    const createService = new CreateService(serviceRepository);
    const deleteComponentFromService = new DeleteComponentFromService(serviceRepository);
    
    const serviceImageRepo = new ServiceImageRepository();
    const upload = new UploadServiceImage(serviceImageRepo);
    const getImagesByServiceId = new GetServiceImagesByServiceId(serviceImageRepo);

    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);

    const [serviceName, setServiceName] = useState(service?.name || '');
    const [serviceCity, setServiceCity] = useState(service?.city || '');
    const [images, setImages] = useState(service?.images || []);
    const [serviceComponents, setServiceComponents] = useState(service?.components || []);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const galleriaImages = (images || [])
        .filter(img => typeof img && img.imagePath)
        .map(img => ({
            itemImageSrc: `http://localhost:3080/${img.imagePath}`,
            thumbnailImageSrc: `http://localhost:3080/${img.imagePath}`,
            alt: 'Imagen de servicio',
            title: 'Imagen'
        }));

    useEffect(() => {
        setServiceName(service?.name || '');
        setServiceCity(service?.city || '');
        setServiceComponents(service?.components || []);
        setImages(service?.images || []);
    }, [service]);

    const handleSave = async () => {
        if (!serviceName.trim() || !serviceCity.trim()) {
            showNotification('Completa todos los campos correctamente.', 'error');
            return;
        }
        setLoading(true);
        try {
            const componentIds = serviceComponents.map(c => c.id);
            if (service && service.id) {
                await updateService.execute({
                    ...service,
                    name: serviceName.trim(),
                    city: serviceCity.trim(),
                    componentIds,
                });
            showNotification('Servicio actualizada con éxito!', 'success');
        } else {
            await createService.execute({
                name: serviceName.trim(),
                city: serviceCity.trim(),
                componentIds,
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

    const handleDeleteComponent = async (component) => {
        setServiceComponents(prevComponents => prevComponents.filter(c => c.id !== component.id));
    }

    const handleSelectComponent = (c) => {
        setSelectedComponent(c);
        setSearch(c.componentName);
    }

    const handleSaveComponent = () => {
        if (selectedComponent && !serviceComponents.find(c => c.id === selectedComponent.id)) {
            setServiceComponents(prevComponents => [...prevComponents, selectedComponent]);
        }
        setSearch(''); 
        setSelectedComponent(null); 
    }

    const handleUpload = async (event) => {
        const files = event.files;
        if (!files || files.length === 0) {
            showNotification('No se seleccionó ningún archivo.', 'error');
            return;
        }
        try {
            const now = new Date().toISOString();
            for (const file of files) {
                const image = await upload.execute({
                    serviceId: service.id,
                    uploadDate: now}, 
                    file
                ); 
                setImages(images => [...images, image]);
            }
            showNotification('Imagen subida con éxito!', 'success');
        } catch (error) {
            showNotification('Error al subir la imagen', 'error');
            console.error('Error uploading image:', error);
        }
    };

    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('components', q));


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
                <FloatLabel style={{ marginTop: '2rem' }}>
                    <InputText 
                        id="name" 
                        className="p-inputtext-sm" 
                        value={serviceName} 
                        onChange={e => setServiceName(e.target.value)}
                        required 
                    />
                    <label htmlFor="name">Nombre del servicio</label>
                </FloatLabel>
                <FloatLabel style={{ marginTop: '2rem' }}>
                    <Dropdown 
                        inputId="city"
                        value={serviceCity} 
                        options={peruCities}
                        onChange={(e) => setServiceCity(e.value)} 
                        style={{ width: '100%' }}
                        required
                    />
                    <label htmlFor="city">Ciudad</label>
                </FloatLabel>
                <p>Galería de imágenes</p>
                <div className="p-4">
                    <FileUpload
                        name="file"
                        mode="basic"
                        accept="image/*"
                        chooseLabel="Subir"
                        className='service-upload-images'
                        customUpload
                        multiple
                        uploadHandler={(e) => handleUpload(e)}
                    />
                    {images
                        .filter(img => img && img.imagePath)
                        .map((img, idx) => (
                            <img
                                className='service-image'
                                key={img.id || idx}
                                src={`http://localhost:3080/${img.imagePath}`}
                                alt={`Imagen de servicio ${img.id || idx}`}
                            />
                        ))
                    }
                </div>
                <div className='service-components-search'>
                    <SearchBar value={search} onChange={setSearch} placeholder="Buscar componentes..." />
                    <div>
                        <Button icon="pi pi-plus" outlined label='Agregar' size='small' onClick={() => handleSaveComponent()} disabled={!selectedComponent}></Button>
                    </div>
                    {search && results.length > 0 && selectedComponent?.componentName !== search && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '3rem', // ajusta según la altura del input
                                left: 0,
                                width: '100%',
                                background: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                zIndex: 10,
                                maxHeight: '200px',
                                overflowY: 'auto',
                            }}
                        >
                            {results
                                .filter(comp => !comp.serviceId && 
                                    !serviceComponents.some(sc => sc.id === comp.id)) 
                                .map(comp => (
                                <div
                                    key={comp.id}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #eee'
                                    }}
                                    onClick={() => handleSelectComponent(comp)}
                                >
                                    {comp.componentName} <span style={{ color: '#888' }}>({comp.serviceType})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                <div className="card">
                    <DataTable  className="components-table" size="small" value={serviceComponents} tableStyle={{ minWidth: '60%' }} emptyMessage="Este servicio aun no cuenta con componentes">
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
                                        onClick={() => handleDeleteComponent(rowData)}
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