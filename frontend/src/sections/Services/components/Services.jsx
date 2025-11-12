import React, { useState, useEffect, useRef, useMemo } from 'react';
import SearchBar from '../../../components/SearchBar';
import useSearch from '../../../hooks/useSearch';
import { apiService } from '../../../services/apiService';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import ServiceRepository from '../../../modules/Service/repository/ServiceRepository';
import GetAllServices from '../../../modules/Service/application/GetAllServices';
import { ProgressSpinner } from 'primereact/progressspinner';
import ServiceModal from './ServicesModal';
import { usePermissions } from '../../../contexts/PermissionsContext';
import "../styles/Services.css"
import { useNavigate } from 'react-router-dom';
import { addLocale, locale } from 'primereact/api';


const Services = () => {
    const serviceRepository = new ServiceRepository();
    const getAllServices = new GetAllServices(serviceRepository);

    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [expandedRows, setExpandedRows] = useState(null);

    const { has } = usePermissions();

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const handleNew = () => {
        setSelectedService(null);
        setShowModal(true);
    }

    const onPageChange = (event) => {
        const page = Math.floor(event.first / event.rows);
        setFirst(event.first);
        setRows(event.rows);
        loadServices(page, event.rows);
    };

    const loadServices = async (page = 0, pageSize = 10) => {
        setLoading(true);
        try {
            const serviceData = await getAllServices.execute(`?page=${page}&limit=${pageSize}`);
            // Asegurar que serviceData.data es un array
            setServices(Array.isArray(serviceData.data) ? serviceData.data : (Array.isArray(serviceData) ? serviceData : []));
            setTotalRecords(serviceData.total || (Array.isArray(serviceData) ? serviceData.length : 0));
        } catch (error) {
            console.error('Error al obtener los servicios:', error);
            setServices([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    // Configurar localización en español
    useEffect(() => {
        addLocale('es', {
            apply: 'Aplicar',
            clear: 'Limpiar',
            matchAll: 'Coincidir todo',
            matchAny: 'Coincidir cualquiera',
            addRule: 'Agregar regla',
            removeRule: 'Quitar regla',
            accept: 'Sí',
            reject: 'No',
            choose: 'Elegir',
            upload: 'Subir',
            cancel: 'Cancelar'
        });
        locale('es');
    }, []);

    const handleModalClose = (shouldReload = false) => {
        // Cerrar modal inmediatamente
        setShowModal(false);
        
        if (shouldReload) {
            // Recargar después de que el modal se haya cerrado
            setTimeout(() => {
                loadServices();
            }, 100);
        }
    };

    const rowExpansionTemplate = (service) => (
        <DataTable value={service.components || []} className='service-components-table' size="small" emptyMessage="Sin componentes">
            <Column field="componentName" header="Nombre del componente" />
            <Column field="serviceType" header="Tipo de servicio" />
        </DataTable>
    );


    // Buscador universal para servicios
    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('services', q));

    // Opciones de ciudades (mismas que al crear servicio) + "Todos"
    const cityOptions = useMemo(() => (
        ['Todos', 'Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Iquitos', 'Puno', 'Chiclayo', 'Piura', 'Huaraz', 'Nazca']
    ), []);

    // Ordenar datos por ciudad
    const sortedServices = useMemo(() => {
        const data = search ? (Array.isArray(results) ? results : []) : services;
        if (!Array.isArray(data)) return [];
        
        return [...data].sort((a, b) => {
            const cityA = a.city || '';
            const cityB = b.city || '';
            return cityA.localeCompare(cityB);
        });
    }, [search, results, services]);

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
                    disabled={!has('SERVICIOS','CREATE')}
                />
            </div>

            <div className='service-search'>
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar servicios..." />
            </div>

            <div className="card">
                <DataTable
                    className="service-table"
                    size="small"
                    value={sortedServices}
                    tableStyle={{ minWidth: '60%' }}
                    emptyMessage="No se encontraron servicios"
                    expandedRows={expandedRows}
                    onRowToggle={e => setExpandedRows(e.data)}
                    rowExpansionTemplate={rowExpansionTemplate}
                    loading={loading || searchLoading}
                    paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    filterDisplay='menu'
                >
                    <Column
                        expander
                        style={{ width: '40px' }}
                    />   
                    <Column
                        field="name"
                        header="Nombre del servicio"
                        style={{ width: '66%' }}>
                    </Column>
                    <Column
                        field="city"
                        header="Ciudad"
                        style={{ width: '28%' }}
                        filterField='city'
                        filter
                        filterMatchMode='equals'
                        filterElement={(options) => (
                            <Dropdown
                                value={options.value ?? 'Todos'}
                                options={cityOptions}
                                onChange={(e) => {
                                    const val = e.value === 'Todos' ? null : e.value;
                                    options.filterApplyCallback(val);
                                }}
                                placeholder="Todos"
                                className="p-column-filter"
                            />
                        )}>
                    </Column>
                    <Column
                        header="Acción"
                        style={{ width: '6%' }}
                        body={rowData => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                {has('SERVICIOS','VIEW') && (
                                    <i
                                        className="pi pi-file"
                                        title="Portada"
                                        style={{ cursor: "pointer", marginRight: '10px' }}
                                        onClick={() => navigate('/servicios/portada', { state: { service: rowData } })}
                                    ></i>
                                )}
                                {has('SERVICIOS','EDIT') && (
                                    <i
                                        className="pi pi-pencil"
                                        title="Editar"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleEdit(rowData)}
                                    ></i>
                                )}
                            </span>
                        )}
                    />
                </DataTable>
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