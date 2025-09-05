import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import ComponentModal from './ComponentModal';
import "../styles/Componentes.css";
import SearchBar from '../../../components/SearchBar';
import useSearch from '../../../hooks/useSearch';
import { apiService } from '../../../services/apiService';

const Componentes = () => {
  const [componentes, setComponentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  // Función para obtener los componentes del backend
  const fetchComponentes = async (page = 0, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3080/components?page=${page}&limit=${pageSize}`);
      if (response.ok) {
        const data = await response.json();
        setComponentes(data.data || data); // Ajustar según la respuesta del backend
        setTotalRecords(data.total || data.length);
      } else {
        console.error('Error al obtener componentes');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar componentes al montar el componente
  useEffect(() => {
    fetchComponentes();
  }, []);

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Buscador universal para componentes
  const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('components', q));

  // Función para manejar el cambio de página
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchComponentes(event.page, event.rows);
  };

  // Función para abrir modal de nuevo componente
  const handleNewComponent = () => {
    setEditingComponent(null);
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const handleEditComponent = (component) => {
    setEditingComponent(component);
    setShowModal(true);
  };

  // Función para cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingComponent(null);
  };

  // Función para guardar componente
  const handleSaveComponent = async (componentData) => {
    try {
      const url = editingComponent 
        ? `http://localhost:3080/components/${editingComponent.id}`
        : 'http://localhost:3080/components';
      
      const method = editingComponent ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(componentData),
      });

      if (response.ok) {
        // Recargar la lista de componentes
        await fetchComponentes();
        console.log(editingComponent ? 'Componente actualizado' : 'Componente creado');
      } else {
        console.error('Error al guardar componente');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
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
          value={search ? results : componentes} 
          loading={loading || searchLoading}
          emptyMessage="No se encontraron componentes"
          tableStyle={{ minWidth: '60%' }}
          paginator={false}
          first={first}
          rows={rows}
        >
          <Column
            field="componentName"
            header="Nombre del componente"
            style={{ width: '35%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                padding: '8px', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {rowData.componentName}
              </div>
            )}
          />
          <Column
            field="serviceType"
            header="Tipo de servicio"
            style={{ width: '25%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                padding: '8px', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {rowData.serviceType}
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
                padding: '8px', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {truncateText(rowData.description, 50)}
              </div>
            )}
          />
          <Column
            header="Acción"
            style={{ width: '6%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
                <i 
                  className="pi pi-pencil" 
                  title="Editar" 
                  style={{color:'#1976d2', cursor: 'pointer'}}
                  onClick={() => handleEditComponent(rowData)}
                />
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
          totalRecords={totalRecords}
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
