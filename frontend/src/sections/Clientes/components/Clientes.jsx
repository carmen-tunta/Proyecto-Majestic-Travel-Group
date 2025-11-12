import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { InputText } from 'primereact/inputtext';
import { addLocale, locale } from 'primereact/api';
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
  const [rows, setRows] = useState(15);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({ pais: { value: '' } });

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
      cancel: 'Cancelar',
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      today: 'Hoy',
      weekHeader: 'Sem',
      firstDayOfWeek: 1,
      dateFormat: 'dd/mm/yy',
      weak: 'Débil',
      medium: 'Medio',
      strong: 'Fuerte',
      passwordPrompt: 'Ingrese una contraseña'
    });
    locale('es');
  }, []);

  useEffect(() => {
  const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setClientes([]);
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

  // Obtener los datos a mostrar (búsqueda o todos) - ordenados por país
  const baseData = useMemo(() => {
    const data = search ? (Array.isArray(results) ? results : []) : clientes;
    if (!Array.isArray(data)) return [];
    
    // Ordenar por país
    return [...data].sort((a, b) => {
      const paisA = a.pais || '';
      const paisB = b.pais || '';
      return paisA.localeCompare(paisB);
    });
  }, [search, results, clientes]);

  // Aplicar filtro de país
  const filteredData = useMemo(() => {
    if (!Array.isArray(baseData)) return [];
    
    let filtered = [...baseData];

    // Aplicar filtro de país si existe
    if (filters.pais && filters.pais.value && filters.pais.value.trim() !== '') {
      const filterValue = filters.pais.value.toLowerCase().trim();
      filtered = filtered.filter(cliente => {
        const pais = (cliente.pais || '').toLowerCase().trim();
        return pais.includes(filterValue);
      });
    }

    return filtered;
  }, [baseData, filters]);

  // Paginar los datos filtrados
  const paginatedData = useMemo(() => {
    if (!Array.isArray(filteredData)) return [];
    const start = first;
    const end = first + rows;
    return filteredData.slice(start, end);
  }, [filteredData, first, rows]);

  // Calcular total de registros después del filtro
  const totalRecords = useMemo(() => {
    return Array.isArray(filteredData) ? filteredData.length : 0;
  }, [filteredData]);

  // Resetear a la primera página cuando cambia la búsqueda o los filtros
  useEffect(() => {
    setFirst(0);
  }, [search, filters]);

  // Función para manejar el cambio de página
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  // Función para manejar cambios en los filtros del DataTable
  const handleFilter = (event) => {
    setFilters(event.filters);
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
          value={paginatedData} 
          loading={loading || searchLoading}
          emptyMessage="No se encontraron clientes"
          tableStyle={{ minWidth: '60%' }}
          paginator={false}
          onFilter={handleFilter}
          filters={filters}
          filterDisplay="menu"
        >
          <Column
            field="nombre"
            header={isMobile ? "Cliente" : "Nombre del cliente"}
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
            filterField="pais"
            filter
            filterPlaceholder="Filtrar por país"
            filterElement={(
              <InputText
                value={filters?.pais?.value || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, pais: { value: e.target.value } }))}
                placeholder="Filtrar por país"
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
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          className="custom-paginator"
        />
      </div>

    </div>
  );
};

export default Clientes;
