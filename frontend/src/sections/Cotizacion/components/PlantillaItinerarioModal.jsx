import { useEffect, useState } from "react";
import GetAllItineraryTemplate from "../../../modules/ItineraryTemplate/application/GetAllItineraryTemplate";
import ItineraryTemplateRepository from "../../../modules/ItineraryTemplate/repository/ItineraryTemplateRepository";
import { ProgressSpinner } from "primereact/progressspinner";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";
import useSearch from "../../../hooks/useSearch";
import { apiService } from "../../../services/apiService";
import SearchBar from "../../../components/SearchBar";
import { Button } from "primereact/button";
import "../../Services/styles/Portada/AgregarPlantillaItinerario.css";
import "../styles/PlantillaItinerarioModal.css";

const PlantillaItinerarioModal = ({ onHide, onSelectTemplate }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(15);
    const [totalRecords, setTotalRecords] = useState(0);

    const templateRepo = new ItineraryTemplateRepository();
    const getAllTemplates = new GetAllItineraryTemplate(templateRepo);

    const fetchTemplates = async (page = 0, limit = 15) => {
        setLoading(true);
        try {
            const response = await getAllTemplates.execute(page, limit);
            
            if (response && response.data) {
                // Respuesta paginada del backend
                setTemplates(response.data);
                setTotalRecords(response.total);
            } else if (Array.isArray(response)) {
                // Fallback para array plano
                setTemplates(response);
                setTotalRecords(response.length);
            } else {
                setTemplates([]);
                setTotalRecords(0);
            }
        } catch (error) {
            console.error('Error al obtener las plantillas:', error);
            setTemplates([]);
            setTotalRecords(0);
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
        // Calcular número de página (0-indexado)
        const page = Math.floor(first / rows);
        fetchTemplates(page, rows);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [first, rows]);

    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('itinerary-templates', q));

    // Lógica combinada de datos
    let dataToDisplay = [];
    let totalItems = 0;

    if (search) {
        // Modo Búsqueda: Paginación en cliente sobre resultados
        const searchResults = Array.isArray(results) ? results : [];
        totalItems = searchResults.length;
        dataToDisplay = searchResults.slice(first, first + rows);
    } else {
        // Modo Normal: Paginación en servidor (templates ya viene paginado)
        // Nota: si el backend devuelve array plano por error, templates tendrá todos y deberíamos hacer slice.
        // Pero con el cambio en backend, templates debe tener solo 15.
        // Para seguridad, si templates.length > rows, hacemos slice.
        if (templates.length > rows) {
             dataToDisplay = templates.slice(first, first + rows);
        } else {
             dataToDisplay = templates;
        }
        totalItems = totalRecords;
    }

    // Función para manejar el cambio de página
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    // Resetear paginación cuando cambia la búsqueda
    useEffect(() => {
        setFirst(0);
    }, [search]);

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
                                value={dataToDisplay}   
                                emptyMessage="No se encontraron plantillas"
                                loading={loading || searchLoading}
                                onRowClick={handleRowClick}
                                selectionMode="single"
                                selection={selectedTemplate}
                                onSelectionChange={(e) => setSelectedTemplate(e.value)}
                                responsiveLayout="scroll"
                                paginator={false}
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
                        {/* Footer con paginación */}
                        <div className='plantilla-itinerario-footer'>
                            <Paginator
                                first={first}
                                rows={rows}
                                totalRecords={totalItems}
                                onPageChange={onPageChange}
                                rowsPerPageOptions={[15]}
                                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                className="custom-paginator"
                            />
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

