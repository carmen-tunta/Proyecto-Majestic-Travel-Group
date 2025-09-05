import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import "../styles/Itinerario.css"
import ItineraryTemplateRepository from '../../../modules/ItineraryTemplate/repository/ItineraryTemplateRepository';
import GetAllItineraryTemplate from '../../../modules/ItineraryTemplate/application/GetAllItineraryTemplate';
import { useEffect, useState } from 'react';
import ItineraryModal from './ItineraryModal';

const Itinerario = () => {
    const itineraryTemplate = new ItineraryTemplateRepository();
    const getAllTemplates = new GetAllItineraryTemplate(itineraryTemplate);

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
    };

    const handleNew = () => {
        setSelectedTemplate(null);
        setShowModal(true);
    }

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
            setTemplate(templateData.data || templateData);
            setTotalRecords(templateData.total || templateData.length);
        } catch (error) {
            console.error('Error al obtener la plantilla:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItineraryTemplates();
    }, []);

    const handleModalClose = () => {
        setShowModal(false);
        loadItineraryTemplates();
    };


    return (
        <div className="itinerario">
            <div className='itinerario-header'>
                <h2>Plantilla Itineraria</h2>
                <Button 
                    icon="pi pi-plus" 
                    label="Nuevo" 
                    size='small' 
                    outlined
                    onClick={() => handleNew()}/>
            </div>

            <div className='itinerario-search'>
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

                <DataTable 
                    className="itinerario-table" 
                    size="small" value={template} 
                    tableStyle={{ minWidth: '60%' }}
                    emptyMessage="No se encontraron servicios"
                    paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                >
                    <Column 
                        field="templateTitle" 
                        header="Título de plantilla" 
                        style={{ width: '47%' }}>    
                    </Column>
                    <Column 
                        field="itineraryTitle" 
                        header="Título para el itinerario" 
                        style={{ width: '47%' }}>
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