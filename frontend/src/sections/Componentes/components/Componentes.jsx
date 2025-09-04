import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import ComponentModal from './ComponentModal';
import "../styles/Componentes.css";
import { GetAllComponentsTemplate } from '../../../modules/ComponentsTemplate/application/GetAllComponentsTemplate';
import { CreateComponentsTemplate } from '../../../modules/ComponentsTemplate/application/CreateComponentsTemplate';
import { UpdateComponentsTemplate } from '../../../modules/ComponentsTemplate/application/UpdateComponentsTemplate';
import { useModal } from '../../../contexts/ModalContext';

const Componentes = () => {
  const [componentes, setComponentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { setIsModalOpen } = useModal();

  // Instancias de los casos de uso
  const createComponent = new CreateComponentsTemplate();
  const updateComponent = new UpdateComponentsTemplate();

  // Función para obtener los componentes del backend
  const fetchComponentes = useCallback(async (page = 0, pageSize = 10) => {
    try {
      setLoading(true);
      const getAllComponents = new GetAllComponentsTemplate();
      const result = await getAllComponents.execute(page, pageSize);
      setComponentes(result.data);
      setTotalRecords(result.total);
    } catch (error) {
      console.error('Error al obtener componentes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar componentes al montar el componente
  useEffect(() => {
    fetchComponentes();
  }, [fetchComponentes]);

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Función para manejar el cambio de página
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    setCurrentPage(event.page); // Guardar la página actual
    fetchComponentes(event.page, event.rows);
  };

  // Función para abrir modal de nuevo componente
  const handleNewComponent = () => {
    setEditingComponent(null);
    setShowModal(true);
    setIsModalOpen(true);
    console.log('Modal abierto - isModalOpen: true');
  };

  // Función para abrir modal de edición
  const handleEditComponent = (component) => {
    setEditingComponent(component);
    setShowModal(true);
    setIsModalOpen(true);
    console.log('Modal abierto - isModalOpen: true');
  };

  // Función para cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingComponent(null);
    setIsModalOpen(false);
    console.log('Modal cerrado - isModalOpen: false');
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
