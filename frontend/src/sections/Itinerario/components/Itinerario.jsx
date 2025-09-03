import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import "../styles/Itinerario.css"
import ItineraryTemplateRepository from '../../../modules/ItineraryTemplate/repository/ItineraryTemplateRepository';
// import GetItineraryTemplateById from '../../../modules/ItineraryTemplate/application/GetItineraryTemplateById';
import GetAllItineraryTemplate from '../../../modules/ItineraryTemplate/application/GetAllItineraryTemplate';
import { useEffect, useState } from 'react';
import ItineraryModal from './ItineraryModal';

const Itinerario = () => {
    const itineraryTemplate = new ItineraryTemplateRepository();
    // const getTemplateById = new GetItineraryTemplateById(itineraryTemplate);
    const getAllTemplates = new GetAllItineraryTemplate(itineraryTemplate);

    const [template, setTemplate] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function loadItineraryTemplates(params) {
            try {
                setLoading(true);
                const templateData = await getAllTemplates.execute();
                setTemplate(templateData);
                console.log(templateData);
            } catch (error) {
                console.error('Error al obtener la plantilla:', error);
            } finally {
                setLoading(false);
            }
        }
        loadItineraryTemplates();
    }, []);

    return (
        <div className="itinerario">
            <div className='itinerario-header'>
                <h2>Plantilla Itineraria</h2>
                <Button 
                    icon="pi pi-plus" 
                    label="Nuevo" 
                    size='small' 
                    outlined
                    onClick={() => setShowModal(true)}/>
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

                <DataTable className="itinerario-table" size="small" value={template} tableStyle={{ minWidth: '60%' }}>
                    <Column 
                        field="itineraryTitle" 
                        header="Título de plantilla" 
                        style={{ width: '47%' }}>    
                    </Column>
                    <Column 
                        field="templateTitle" 
                        header="Título para el itinerario" 
                        style={{ width: '47%' }}>
                    </Column>
                    <Column
                        field="action"
                        header="Acción"
                        style={{ width: '6%' }}
                        body={() => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                <i className="pi pi-pencil" title="Editar" style={{color:'#1976d2'}}></i>
                            </span>
                        )}
                    />
                </DataTable>
                )}
            </div>

            <div className='itinerario-footer'>
                Aqui van los botones
            </div>

            {showModal && (
                <ItineraryModal
                    visible={showModal}
                    onHide={() => setShowModal(false)}
                />
            )}
    
        </div>
    )
}

export default Itinerario;