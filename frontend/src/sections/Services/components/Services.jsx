import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import ServiceRepository from '../../../modules/Service/repository/ServiceRepository';
import GetAllServices from '../../../modules/Service/application/GetAllServices';
import { ProgressSpinner } from 'primereact/progressspinner';
import ServiceModal from './ServicesModal';
import { useNotification } from '../../Notification/NotificationContext';
import "../styles/Services.css"

const Services = () => {
    const serviceRepository = new ServiceRepository();
    const getAllServices = new GetAllServices(serviceRepository);

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const handleNew = () => {
        setSelectedService(null);
        setShowModal(true);
    }

    const loadServices = async () => {
        setLoading(true);
        try {
            const serviceData = await getAllServices.execute();
            setServices(serviceData);
        } catch (error) {
            console.error('Error al obtener los servicios:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const handleModalClose = () => {
        setShowModal(false);
        loadServices();
    };


    return (
        <div className="service">
            <div className='service-header'>
                <h2>Servicios</h2>
                <Button 
                    icon="pi pi-plus" 
                    label="Nuevo" 
                    size='small' 
                    outlined
                    onClick={handleNew}
                    />
            </div>

            <div className='service-search'>
                <div className="p-input-icon-left">
                    <i className="pi pi-search"/>
                    <InputText type="text" placeholder="Buscar..." className='p-inputtext-sm'/>
                </div>
            </div>

            <div className="card">

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                        <ProgressSpinner />
                    </div>
                ) : (

                <DataTable className="service-table" size="small" value={services} tableStyle={{ minWidth: '60%' }}>
                    <Column 
                        field="name" 
                        header="Nombre del servicio" 
                        style={{ width: '66%' }}>    
                    </Column>
                    <Column 
                        field="city" 
                        header="Ciudad" 
                        style={{ width: '28%' }}>
                    </Column>
                    <Column
                        header="Acción"
                        style={{ width: '6%' }}
                        body={rowData => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                <i 
                                    className="pi pi-pencil"    
                                    title="Editar" 
                                    style={{color:'#1976d2', cursor:"pointer"}}
                                    onClick={() => handleEdit(rowData)}    
                                ></i>
                            </span>
                        )}
                    />
                </DataTable>
                )}
            </div>

            <div className='service-footer'>
                Aqui van los botones
            </div>

            {showModal && (
                <ServiceModal
                    visible={showModal}
                    onHide={handleModalClose}
                    service={selectedService}
                />
            )}
    
        </div>
    )
}
export default Services;