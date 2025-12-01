import { DataTable } from 'primereact/datatable';
import SearchBar from '../../../components/SearchBar';
import useSearch from '../../../hooks/useSearch';
import { apiService } from '../../../services/apiService';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import "../styles/Itinerario.css"
import ItineraryTemplateRepository from '../../../modules/ItineraryTemplate/repository/ItineraryTemplateRepository';
import GetAllItineraryTemplate from '../../../modules/ItineraryTemplate/application/GetAllItineraryTemplate';
import { useEffect, useState } from 'react';
import ItineraryModal from './ItineraryModal';
import { usePermissions } from '../../../contexts/PermissionsContext';
import { useModal } from '../../../contexts/ModalContext';

const Itinerario = () => {
    const itineraryTemplate = new ItineraryTemplateRepository();
    const getAllTemplates = new GetAllItineraryTemplate(itineraryTemplate);
    const { setIsModalOpen } = useModal();

    const [template, setTemplate] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const handleEdit = (template) => {
        setSelectedTemplate(template);
        setShowModal(true);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedTemplate(null);
        setShowModal(true);
        setIsModalOpen(true);
    }

    const { has } = usePermissions();

    const onPageChange = (event) => {
        const page = Math.floor(event.first / event.rows);
        setFirst(event.first);
        setRows(event.rows);
        loadItineraryTemplates(page, event.rows);
    };

    const loadItineraryTemplates = async (page = 0, pageSize = 10) => {
        setLoading(true);
        try {
            const templateData = await getAllTemplates.execute(`?page=${page}&limit=${pageSize}`);
            // Asegurar que templateData.data es un array
            setTemplate(Array.isArray(templateData.data) ? templateData.data : (Array.isArray(templateData) ? templateData : []));
            setTotalRecords(templateData.total || (Array.isArray(templateData) ? templateData.length : 0));
        } catch (error) {
            console.error('Error al obtener la plantilla:', error);
            setTemplate([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItineraryTemplates();
    }, []);

    const handleModalClose = () => {
        setShowModal(false);
        setIsModalOpen(false);
        loadItineraryTemplates();
    };


    // Función para truncar texto largo - responsive
    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        // En móviles, truncar más agresivamente
        const isMobile = window.innerWidth <= 768;
        const mobileMaxLength = isMobile ? 25 : maxLength;
        return text.length > mobileMaxLength ? text.substring(0, mobileMaxLength) + '...' : text;
    };

    // Buscador universal para plantillas
    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('itinerary-templates', q));


    return (
        <div className="itinerario">
            <div className='itinerario-header'>
                <h2>Plantilla Itineraria</h2>
                <Button 
                    icon="pi pi-plus" 
                    label="Nuevo" 
                    size='small' 
                    outlined
                    onClick={() => has('ITINERARIO','CREATE') && handleNew()}
                    disabled={!has('ITINERARIO','CREATE')}
                />
            </div>

            <div className='itinerario-search'>
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar plantillas..." />
            </div>

            <div className="card">
                {(loading || searchLoading) && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column' }}>
                        <ProgressSpinner />
                        <p>Cargando plantillas de itinerario...</p>
                    </div>
                )}
                {!(loading || searchLoading) && (
                <DataTable 
                    className="itinerario-table" 
                    size="small" 
                    value={search ? results : template} 
                    tableStyle={{ minWidth: '60%' }}
                    emptyMessage="No se encontraron plantillas"
                    scrollable={window.innerWidth <= 768}
                    scrollHeight={window.innerWidth <= 768 ? "400px" : undefined}
                >
                    <Column 
                        field="templateTitle" 
                        header="Título de plantilla" 
                        style={{ width: '47%' }}
                        body={(rowData) => (
                            <div title={rowData.templateTitle}>
                                {truncateText(rowData.templateTitle, 40)}
                            </div>
                        )}>    
                    </Column>
                    <Column 
                        field="itineraryTitle" 
                        header="Título para el itinerario" 
                        style={{ width: '47%' }}
                        body={(rowData) => (
                            <div title={rowData.itineraryTitle}>
                                {truncateText(rowData.itineraryTitle, 40)}
                            </div>
                        )}>
                    </Column>
                    <Column
                        header="Acción"
                        style={{ width: '6%' }}
                        body={rowData => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                {has('ITINERARIO','EDIT') && (
                                <i 
                                    className="pi pi-pencil"    
                                    title="Editar" 
                                    style={{
                                        cursor: "pointer",
                                        fontSize: window.innerWidth <= 768 ? '1rem' : '1.2rem',
                                        padding: window.innerWidth <= 768 ? '4px' : '8px'
                                    }}
                                    onClick={() => handleEdit(rowData)}    
                                ></i>
                                )}
                            </span>
                        )}
                    />
                </DataTable>
                )}
            </div>

            {/* Footer con paginación */}
            <div className='itinerario-footer'>
                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    rowsPerPageOptions={[10]}
                    onPageChange={onPageChange}
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    className="custom-paginator"
                />
            </div>

            {showModal && (
                <ItineraryModal
                    visible={showModal}
                    onHide={handleModalClose}
                    template={selectedTemplate}
                />
            )}
    
        </div>
    )
}

export default Itinerario;