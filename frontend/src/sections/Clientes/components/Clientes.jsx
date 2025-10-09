import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import SearchBar from '../../../components/SearchBar';
import useSearch from '../../../hooks/useSearch';
import { apiService } from '../../../services/apiService';
import { usePermissions } from '../../../contexts/PermissionsContext';
import ClientRepository from '../../../modules/Clients/repository/ClientRepository';
import GetAllClients from '../../../modules/Clients/application/GetAllClients';
import "../styles/Clientes.css";

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Función para obtener los clientes del backend
  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      // Instancia del caso de uso dentro del callback
      const clientRepository = new ClientRepository();
      const getAllClients = new GetAllClients(clientRepository);
      const response = await getAllClients.execute();
      // El backend devuelve un array directo
      setClientes(Array.isArray(response) ? response : []);
      setTotalRecords(Array.isArray(response) ? response.length : 0);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setClientes([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Función para formatear fechas en formato "Lun 01 Dic 25"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    
    return `${dayName} ${day} ${month} ${year}`;
  };

  // Buscador universal para clientes
  const { search, setSearch, results, loading: searchLoading } = useSearch(
    (q) => apiService.universalSearch('clients', q),
    () => fetchClientes()
  );

  // Función para manejar el cambio de página
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    // Por ahora no hay paginación en el backend, solo actualizamos el estado local
  };

  const { has } = usePermissions();
  // Función para abrir página de nuevo cliente
  const handleNewClient = () => {
    navigate('/clientes/nuevo');
  };

  // Función para abrir página de edición de cliente
  const handleEditClient = (client) => {
    navigate(`/clientes/${client.id}`);
  };


  return (
    <div className="clientes">
      {/* Header con título y botón Nuevo */}
      <div className='clientes-header'>
        <h2>Clientes</h2>
        <Button 
          icon="pi pi-plus" 
          label="Nuevo" 
          size='small' 
          outlined
          onClick={handleNewClient}
          disabled={!has('CLIENTES','CREATE')}
        />
      </div>

      {/* Barra de búsqueda universal */}
      <div className='clientes-search'>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar clientes..." />
      </div>

      {/* Tabla de clientes */}
      <div className="card">
        <DataTable 
          className="clientes-table" 
          size="small" 
          value={search ? results : clientes} 
          loading={loading || searchLoading}
          emptyMessage="No se encontraron clientes"
          tableStyle={{ minWidth: '60%' }}
          paginator={false}
          first={first}
          rows={rows}
        >
          <Column
            field="nombre"
            header="Nombre del cliente"
            style={{ width: '20%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {rowData.nombre}
              </div>
            )}
          />
          <Column
            field="pais"
            header="País"
            style={{ width: '15%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {rowData.pais}
              </div>
            )}
          />
          <Column
            field="lenguaNativa"
            header="Nacionalidad"
            style={{ width: '15%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {rowData.lenguaNativa}
              </div>
            )}
          />
          <Column
            field="whatsapp"
            header="Whatsapp"
            style={{ width: '15%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {rowData.whatsapp}
              </div>
            )}
          />
          <Column
            field="correo"
            header="Correo"
            style={{ width: '20%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {truncateText(rowData.correo, 25)}
              </div>
            )}
          />
          <Column
            field="fechaRegistro"
            header="F. registro"
            style={{ width: '12%', textAlign: 'center', minWidth: '100px' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {formatDate(rowData.fechaRegistro)}
              </div>
            )}
          />
          <Column
            field="estado"
            header="Estado"
            style={{ width: '10%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ 
                textAlign: 'center', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {rowData.estado || 'Registrado'}
              </div>
            )}
          />
          <Column
            header="Acción"
            style={{ width: '5%', textAlign: 'center' }}
            body={(rowData) => (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
                {has('CLIENTES','VIEW') && (
                  <i 
                    className="pi pi-arrow-right" 
                    title="Ver detalles" 
                    style={{cursor: 'pointer'}}
                    onClick={() => handleEditClient(rowData)}
                  />
                )}
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Footer con paginación */}
      <div className='clientes-footer'>
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

    </div>
  );
};

export default Clientes;
