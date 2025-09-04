import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import ComponentModal from './ComponentModal';
import "../styles/Componentes.css";

const Componentes = () => {
  const [componentes, setComponentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  // Función para obtener los componentes del backend
  const fetchComponentes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3080/components');
      if (response.ok) {
        const data = await response.json();
        setComponentes(data);
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

  // Función para manejar el cambio de página
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
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

      {/* Barra de búsqueda */}
      <div className='componentes-search'>
        <div className="p-input-icon-left">
          <i className="pi pi-search"/>
          <InputText type="text" placeholder="Buscar..." className='p-inputtext-sm'/>
        </div>
      </div>

      {/* Tabla de componentes */}
      <div className="card">
        <DataTable 
          className="componentes-table" 
          size="small" 
          value={componentes} 
          loading={loading}
          emptyMessage="No se encontraron componentes"
          tableStyle={{ minWidth: '60%' }}
          paginator={false}
          first={first}
          rows={rows}
        >
          <Column
            field="componentName"
            header="Nombre del componente"
            style={{ width: '30%' }}
          />
          <Column
            field="serviceType"
            header="Tipo de servicio"
            style={{ width: '20%' }}
          />
          <Column
            field="description"
            header="Descripción"
            style={{ width: '44%' }}
            body={(rowData) => truncateText(rowData.description, 60)}
          />
          <Column
            header="Acción"
            style={{ width: '6%' }}
            body={(rowData) => (
              <span style={{ display: 'flex', justifyContent: 'center' }}>
                <i 
                  className="pi pi-pencil" 
                  title="Editar" 
                  style={{color:'#1976d2', cursor: 'pointer'}}
                  onClick={() => handleEditComponent(rowData)}
                />
              </span>
            )}
          />
        </DataTable>
      </div>

      {/* Footer con paginación */}
      <div className='componentes-footer'>
        <Paginator
          first={first}
          rows={rows}
          totalRecords={componentes.length}
          rowsPerPageOptions={[5, 10, 20, 50]}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
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
