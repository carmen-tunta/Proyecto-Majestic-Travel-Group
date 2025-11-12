import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Dropdown } from 'primereact/dropdown';
import ComponentModal from './ComponentModal';
import { usePermissions } from '../../../contexts/PermissionsContext';
import "../styles/Componentes.css";

import SearchBar from '../../../components/SearchBar';
import useSearch from '../../../hooks/useSearch';
import { apiService } from '../../../services/apiService';

import { GetAllComponentsTemplate } from '../../../modules/ComponentsTemplate/application/GetAllComponentsTemplate';
import { CreateComponentsTemplate } from '../../../modules/ComponentsTemplate/application/CreateComponentsTemplate';
import { UpdateComponentsTemplate } from '../../../modules/ComponentsTemplate/application/UpdateComponentsTemplate';
import { useModal } from '../../../contexts/ModalContext';
import { addLocale, locale } from 'primereact/api';


const Componentes = () => {
  const [componentes, setComponentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { setIsModalOpen } = useModal();
  const { has } = usePermissions();

  // Instancias de los casos de uso
  const createComponent = new CreateComponentsTemplate();
  const updateComponent = new UpdateComponentsTemplate();

  // Función para obtener todos los componentes del backend
  const fetchComponentes = useCallback(async () => {
    try {
      setLoading(true);
      const getAllComponents = new GetAllComponentsTemplate();
      // Obtener todos los componentes con un límite alto
      const result = await getAllComponents.execute(0, 1000);
      // Asegurar que result.data es un array
      const data = Array.isArray(result.data) ? result.data : [];
      setComponentes(data);
    } catch (error) {
      console.error('Error al obtener componentes:', error);
      setComponentes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar componentes al montar el componente
  useEffect(() => {
    fetchComponentes();
  }, [fetchComponentes]);

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

  // Función para truncar texto largo - responsive
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    // En móviles, truncar más agresivamente
    const isMobile = window.innerWidth <= 768;
    const mobileMaxLength = isMobile ? 25 : maxLength;
    return text.length > mobileMaxLength ? text.substring(0, mobileMaxLength) + '...' : text;
  };

  // Buscador universal para componentes
  const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('components', q));

  // Opciones de tipos de servicio (mismas que al crear componente) + "Todos"
  const serviceTypeOptions = useMemo(() => (
    ['Todos', 'Transporte', 'Ticket', 'Boleto', 'Tour', 'Hotel', 'Guia', 'Restaurant', 'Otros']
  ), []);

  // Estado para los filtros
  const [filters, setFilters] = useState({ serviceType: { value: null } });

  // Ordenar datos por tipo de servicio
  const sortedComponentes = useMemo(() => {
    const data = search ? (Array.isArray(results) ? results : []) : componentes;
    if (!Array.isArray(data)) return [];
    
    return [...data].sort((a, b) => {
      const typeA = a.serviceType || '';
      const typeB = b.serviceType || '';
      return typeA.localeCompare(typeB);
    });
  }, [search, results, componentes]);

  // Aplicar filtros sobre todos los datos ordenados
  const filteredComponentes = useMemo(() => {
    let data = sortedComponentes;
    
    // Filtrar por tipo de servicio si hay un filtro activo
    if (filters.serviceType?.value) {
      data = data.filter(comp => comp.serviceType === filters.serviceType.value);
    }
    
    return data;
  }, [sortedComponentes, filters]);

  // Paginar los datos filtrados
  const paginatedComponentes = useMemo(() => {
    const start = first;
    const end = start + rows;
    return filteredComponentes.slice(start, end);
  }, [filteredComponentes, first, rows]);

  // Total de registros filtrados
  const filteredTotalRecords = useMemo(() => {
    return filteredComponentes.length;
  }, [filteredComponentes]);

  // Función para manejar el cambio de página
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    setCurrentPage(event.page);
  };

  // Resetear paginación cuando cambian los filtros o búsqueda
  useEffect(() => {
    setFirst(0);
  }, [filters, search]);

  // Función para abrir modal de nuevo componente
  const handleNewComponent = () => {
    setEditingComponent(null);
    setShowModal(true);
    setIsModalOpen(true);
  };

  // Función para abrir modal de edición
  const handleEditComponent = (component) => {
    setEditingComponent(component);
    setShowModal(true);
    setIsModalOpen(true);
  };

  // Función para cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingComponent(null);
    setIsModalOpen(false);
  };

  // Función para guardar componente
  const handleSaveComponent = async (componentData) => {
    try {
      if (editingComponent) {
        // Actualizar componente existente
        await updateComponent.execute(editingComponent.id, componentData);
        console.log('Componente actualizado');
      } else {
        // Crear nuevo componente
        await createComponent.execute(componentData);
        console.log('Componente creado');
      }
      
      // Cerrar el modal
      setShowModal(false);
      setEditingComponent(null);
      setIsModalOpen(false);
      
      // Volver a la página original y recargar
      const pageToReturn = editingComponent ? currentPage : 0; // Si es nuevo, ir a página 1
      setFirst(pageToReturn * rows);
      setLoading(true); // Mostrar loading mientras se recarga
      await fetchComponentes(pageToReturn, rows);
      
      console.log(`Volviendo a la página ${pageToReturn + 1}`);
    } catch (error) {
      console.error('Error al guardar componente:', error);
      // Re-lanzar el error para que el modal lo maneje
      throw error;
    }
  };


  return (
    <div className="componentes">
      {/* Header con título y botón Nuevo */}
      <div className='componentes-header'>
        <h2>Componentes</h2>
        <Button 
          icon="pi pi-plus" 
          label="Nuevo" 
          size='small' 
          outlined
          onClick={handleNewComponent}
          disabled={!has('COMPONENTES','CREATE')}
        />
      </div>

      {/* Barra de búsqueda universal */}
      <div className='componentes-search'>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar componentes..." />
      </div>

      {/* Tabla de componentes */}
      <div className="card">
        <DataTable 
          className="componentes-table" 
          size="small" 
          value={paginatedComponentes} 
          loading={loading || searchLoading}
          emptyMessage="No se encontraron componentes"
          tableStyle={{ minWidth: '60%' }}
          paginator={false}
          filters={filters}
          onFilter={(e) => setFilters(e.filters)}
          filterDisplay='menu'
          scrollable={window.innerWidth <= 768}
          scrollHeight={window.innerWidth <= 768 ? "400px" : undefined}
        >
          <Column
            field="componentName"
            header="Nombre del componente"
            style={{ width: '35%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} title={rowData.componentName}>
                {truncateText(rowData.componentName, 30)}
              </div>
            )}
          />
          <Column
            field="serviceType"
            header="Tipo de servicio"
            style={{ width: '25%', textAlign: 'center' }}
            filterField='serviceType'
            filter
            filterMatchMode='equals'
            filterElement={(options) => (
              <Dropdown
                value={options.value ?? 'Todos'}
                options={serviceTypeOptions}
                onChange={(e) => {
                  const val = e.value === 'Todos' ? null : e.value;
                  options.filterApplyCallback(val);
                }}
                placeholder="Todos"
                className="p-column-filter"
              />
            )}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} title={rowData.serviceType}>
                {truncateText(rowData.serviceType, 15)}
              </div>
            )}
          />
          <Column
            field="description"
            header="Descripción"
            style={{ width: '34%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} title={rowData.description}>
                {truncateText(rowData.description, 35)}
              </div>
            )}
          />
          <Column
            header="Acción"
            style={{ width: '6%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
                {has('COMPONENTES','EDIT') && (
                  <i 
                    className="pi pi-pencil" 
                    title="Editar" 
                    style={{
                      cursor: 'pointer',
                      fontSize: window.innerWidth <= 768 ? '1rem' : '1.2rem',
                      padding: window.innerWidth <= 768 ? '4px' : '8px'
                    }}
                    onClick={() => handleEditComponent(rowData)}
                  />
                )}
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Footer con paginación */}
      <div className='componentes-footer'>
        <Paginator
          first={first}
          rows={rows}
          totalRecords={filteredTotalRecords}
          rowsPerPageOptions={[10]}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          className="custom-paginator"
        />
      </div>

      {/* Modal de Componente */}
      {showModal && (
        <ComponentModal
          onHide={handleCloseModal}
          component={editingComponent}
          onSave={handleSaveComponent}
        />
      )}
    </div>
  );
};

export default Componentes;
