import React, { useEffect, useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
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
import DeleteImageFromService from '../../../modules/Service/application/DeleteImageFromService';

const ServicesModal = ({ onHide, service }) => {
    const peruCities = ["Lima", "Cusco", "Arequipa", "Trujillo", "Iquitos", "Puno", "Chiclayo", "Piura", "Huaraz", "Nazca"];
    const serviceRepository = new ServiceRepository();
    const updateService = new UpdateService(serviceRepository);
    const createService = new CreateService(serviceRepository);
    const deleteComponentFromService = new DeleteComponentFromService(serviceRepository);
    
    const serviceImageRepo = new ServiceImageRepository();
    const upload = new UploadServiceImage(serviceImageRepo);
    const deleteImage = new DeleteImageFromService(serviceImageRepo);

    const {showNotification} = useNotification();
    const [loading, setLoading] = useState(false);

    const [serviceName, setServiceName] = useState(service?.name || '');
    const [serviceCity, setServiceCity] = useState(service?.city || '');
    const [images, setImages] = useState(service?.images || []);
    const [serviceComponents, setServiceComponents] = useState(service?.components || []);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    const filesUploadRef = useRef(null);

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
            for (const image of newImages) {
                await upload.execute({
                    serviceId: service.id,
                    uploadDate: image.uploadDate,
                    file: image.file
                });
            }
            for (const image of deletedImages) {
                if (image.id) {
                    await deleteImage.execute(image.id);
                }
            }
            showNotification('Servicio actualizado con éxito!', 'success');
        } else {
            const resp = await createService.execute({
                name: serviceName.trim(),
                city: serviceCity.trim(),
                componentIds,
            });
            for (const image of images) {
                await upload.execute({
                    serviceId: resp.id,
                    uploadDate: image.uploadDate,
                    file: image.file
                });
            }
            showNotification('Servicio creado con éxito!', 'success');
        }
        onHide();
        } catch (error) {
            showNotification('Error al guardar el servicio', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ConfirmDialog state for component/image deletion
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'component'|'image', data: object }
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    const handleDeleteComponent = (component) => {
        setDeleteTarget({ type: 'component', data: component });
        setDeleteDialogVisible(true);
    };

    const handleDeleteImage = (image) => {
        setDeleteTarget({ type: 'image', data: image });
        setDeleteDialogVisible(true);
    };

    function handleDeleteAccept() {
        if (!deleteTarget) return;
        if (deleteTarget.type === 'component') {
            setServiceComponents(prevComponents => prevComponents.filter(c => c.id !== deleteTarget.data.id));
        } else if (deleteTarget.type === 'image') {
            const image = deleteTarget.data;
            if (image.id) { setDeletedImages(prevDeleted => [...prevDeleted, image]); }
            setImages(images => images.filter(img => img !== image));
            setNewImages(newImages => newImages.filter(img => img !== image));
        }
        setDeleteDialogVisible(false);
        setDeleteTarget(null);
    }

    function handleDeleteReject() {
        setDeleteDialogVisible(false);
        setDeleteTarget(null);
    }

    const handleSelectComponent = (c) => {
        setSelectedComponent(c);
        setSearch(c.componentName);
    }

    const handleSaveComponent = () => {
        let comp = selectedComponent;
        // Si no hay selección explícita, intentar emparejar por nombre exacto (case-insensitive)
        if (!comp && search && results?.length) {
            const q = search.trim().toLowerCase();
            comp = results.find(r => (r.componentName || '').toLowerCase() === q);
        }
        if (!comp) return; // no hay nada que agregar
        if (!serviceComponents.find(c => c.id === comp.id)) {
            setServiceComponents(prevComponents => [...prevComponents, comp]);
        }
        setSearch('');
        setSelectedComponent(null);
    }



    const handleAddImage = async (e) => {
        const files = e.files;
        if (!files || files.length === 0) {
            showNotification('No se seleccionó ningún archivo.', 'error');
            return;
        }
        for (const img of files) {
            const now = new Date().toISOString();
            const localUrl = URL.createObjectURL(img);
            const image = {
                    uploadDate: now, 
                    url: localUrl, 
                    file: img
            };
            setImages(images => [...images, image]);
            setNewImages(prevNewImages => [...prevNewImages, image]);
            await new Promise(resolve => setTimeout(resolve, 1)); // Pequeña pausa para evitar bloqueos
        }
        if (filesUploadRef.current) { filesUploadRef.current.clear(); }
        showNotification('Imagen(es) agregada(s) correctamente, recuerda guardar los cambios.', 'success');
    }

    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('components', q));


    return (
        <div className="service-modal-overlay">
            <div className="service-modal">
                <div className='service-modal-header'>
                    <h3>{service ? "Editar Servicio" : "Nuevo Servicio"}</h3>
                    <i 
                        className="pi pi-times" 
                        style={{ marginBottom: "1rem", cursor:"pointer" }}
                        onClick={loading ? () => undefined : onHide}
                    >
                    </i>
                </div>
                <FloatLabel style={{ marginTop: '2rem' }}>
                    <InputText 
                        id="name" 
                        className="p-inputtext-sm" 
                        value={serviceName} 
                        onChange={e => setServiceName(e.target.value)}
                        required 
                        disabled={loading}
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
                        disabled={loading}
                    />
                    <label htmlFor="city">Ciudad</label>
                </FloatLabel>
                <p>Galería de imágenes</p>
                <div className="p-4">
                    <FileUpload
                        ref={filesUploadRef}
                        name="file"
                        mode="basic"
                        accept="image/*"
                        className='service-upload-images'
                        customUpload
                        multiple
                        auto
                        uploadHandler={(e) => handleAddImage(e)}
                        disabled={loading}
                    />
                    {images
                        .filter(img => img && (img.imagePath || img.url))
                        .map((img, idx) => (
                            <div key={idx} className='service-image'>
                                <img
                                    src={img.imagePath ? `http://localhost:3080/${img.imagePath}` : img.url}
                                    alt={`Imagen de servicio ${idx}`}
                                />
                                <i 
                                    className="pi pi-times delete-image"
                                    onClick={loading ? () => undefined : () => handleDeleteImage(img)}
                                    title="Eliminar imagen"
                                />
                            </div>
                        ))
                    }
                </div>
                                <div className='service-components-search'>
                                        <SearchBar disabled={loading} value={search} onChange={setSearch} placeholder="Buscar componentes..." />
                                        <div>
                                                <Button 
                                                    icon="pi pi-plus" 
                                                    outlined 
                                                    label='Agregar' 
                                                    size='small' 
                                                    onClick={handleSaveComponent}
                                                    disabled={
                                                        loading || (
                                                            !selectedComponent && !results?.some(r => (r.componentName||'').toLowerCase() === (search||'').trim().toLowerCase())
                                                        )
                                                    }
                                                />
                                        </div>
                                        {search && results.length > 0 && selectedComponent?.componentName !== search && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '3rem',
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
                                                    .filter(comp => !serviceComponents.some(sc => sc.id === comp.id))
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
                                        onClick={() => { if (!loading) handleDeleteComponent(rowData); }}
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
                        disabled={loading}
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
            <ConfirmDialog
                visible={deleteDialogVisible}
                onHide={handleDeleteReject}
                message={deleteTarget?.type === 'component' ? '¿Estás seguro de que deseas eliminar este componente del servicio?' : '¿Estás seguro de que deseas eliminar esta imagen?'}
                header="Confirmar eliminación"
                icon="pi pi-exclamation-triangle"
                accept={handleDeleteAccept}
                reject={handleDeleteReject}
                acceptLabel="Sí, eliminar"
                rejectLabel="Cancelar"
            />
            </div>
        </div>
    )
}

export default ServicesModal;