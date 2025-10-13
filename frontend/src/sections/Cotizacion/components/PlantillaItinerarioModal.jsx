import { useEffect, useState } from "react";
import GetAllItineraryTemplate from "../../../modules/ItineraryTemplate/application/GetAllItineraryTemplate";
import ItineraryTemplateRepository from "../../../modules/ItineraryTemplate/repository/ItineraryTemplateRepository";
import { ProgressSpinner } from "primereact/progressspinner";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import useSearch from "../../../hooks/useSearch";
import { apiService } from "../../../services/apiService";
import SearchBar from "../../../components/SearchBar";
import { Button } from "primereact/button";
import "../../Services/styles/Portada/AgregarPlantillaItinerario.css";
import "../styles/PlantillaItinerarioModal.css";

const PlantillaItinerarioModal = ({ onHide, onSelectTemplate }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(false);

    const templateRepo = new ItineraryTemplateRepository();
    const getAllTemplates = new GetAllItineraryTemplate(templateRepo);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const templates = await getAllTemplates.execute();
            setTemplates(templates);
        } catch (error) {
            console.error('Error al obtener las plantillas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAgregarTemplate = () => {
        if (selectedTemplate) {
            onSelectTemplate(selectedTemplate);
            onHide();
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('itinerary-templates', q));

    const handleRowClick = (event) => {
        setSelectedTemplate(event.data);
    };

    return (
        <div className="itinerary-modal-overlay">
            <div className="agregar-itinerario-modal plantilla-itinerario-modal">
                {loading ? (
                    <ProgressSpinner />
                ) : (
                    <>
                        <div className="header">
                            <h3>Plantilla Itinerario</h3>
                        </div>
                        <div className='search'>
                            <SearchBar value={search} onChange={setSearch} placeholder="Buscar plantillas..." />
                        </div>
                        <div className="body">
                            <DataTable
                                className="table" 
                                size="small" 
                                value={search ? results : templates} 
                                emptyMessage="No se encontraron plantillas"
                                loading={loading || searchLoading}
                                onRowClick={handleRowClick}
                                selectionMode="single"
                                selection={selectedTemplate}
                                onSelectionChange={(e) => setSelectedTemplate(e.value)}
                                responsiveLayout="scroll"
                                paginator={(search ? results : templates).length > 8}
                                rows={8}
                                paginatorClassName="custom-paginator"
                            >
                                <Column
                                    field="templateTitle" 
                                    header="Título de la plantilla" 
                                    style={{ width: '100%' }}>    
                                </Column>
                            </DataTable>
                            <div className="itinerario-info">
                                {!selectedTemplate ? (
                                    <>No hay nada seleccionado</>
                                ) : (
                                    <div>
                                        <div style={{fontWeight: 500}}>Título para el itinerario</div>
                                        <div>{selectedTemplate?.itineraryTitle}</div>
                                        <div dangerouslySetInnerHTML={{ __html: selectedTemplate?.description }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="buttons">
                            <Button 
                                label="Cancelar" 
                                size="small"
                                outlined
                                onClick={onHide} 
                                disabled={loading}
                            />
                            <Button 
                                label="Agregar"
                                size='small' 
                                className='p-button-primary'
                                onClick={handleAgregarTemplate}
                                disabled={loading}
                                loading={loading}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default PlantillaItinerarioModal;

