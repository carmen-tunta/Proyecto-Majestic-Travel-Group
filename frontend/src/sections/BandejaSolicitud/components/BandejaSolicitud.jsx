import React, { useState, useEffect, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import QuoteRequestRepository from '../../../modules/QuoteRequest/repository/QuoteRequestRepository';
import GetAllQuoteRequests from '../../../modules/QuoteRequest/application/GetAllQuoteRequests';
import '../styles/BandejaSolicitud.css';

// Componente separado para el contador que se actualiza automáticamente
const ExpirationCounter = ({ createdAt, currentTime }) => {
  const expiration = useMemo(() => {
    if (!createdAt) return 'N/A';
    
    // Convertir ambas fechas a hora de Perú para cálculo correcto
    const created = new Date(createdAt);
    const now = new Date(currentTime);
    
    // Convertir a hora de Perú (America/Lima)
    const createdPeru = new Date(created.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const nowPeru = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    
    const diffMinutes = Math.floor((nowPeru - createdPeru) / (1000 * 60));
    
    // Debug: ver qué está pasando con las fechas
    console.log('ExpirationCounter calculation (Perú):', {
      createdAt: createdAt,
      createdPeru: createdPeru,
      nowPeru: nowPeru,
      diffMinutes: diffMinutes,
      currentTime: currentTime
    });
    
    // 45 minutos por defecto
    const totalMinutes = 45;
    
    // Si la fecha de creación es futura o hay error, mostrar tiempo completo
    if (diffMinutes < 0 || diffMinutes > totalMinutes) {
      console.log('Fecha futura o error, usando tiempo completo');
      return `${totalMinutes} min.`;
    }
    
    const remainingMinutes = totalMinutes - diffMinutes;
    
    if (remainingMinutes <= 0) {
      return '0 min.';
    } else {
      return `${remainingMinutes} min.`;
    }
  }, [createdAt, currentTime]);

  const minutes = parseInt(expiration.replace(' min.', '').replace('N/A', '0'));
  
  const getExpirationClass = (mins) => {
    if (mins === 0) return 'expiration-expired';
    if (mins <= 5) return 'expiration-critical';
    if (mins <= 15) return 'expiration-warning';
    return 'expiration-normal';
  };

  return (
    <div className={`expiration-badge ${getExpirationClass(minutes)}`}>
      {expiration}
    </div>
  );
};

// Componente para el botón de acción con su propio OverlayPanel
const ActionButton = ({ rowData, currentUserId, loadingActions, onAction }) => {
  const overlayRef = useRef(null);

  const handleActionClick = (actionType) => {
    onAction(actionType, rowData.id);
    overlayRef.current.hide();
  };

  const isAssignedToCurrentUser = rowData.agentId === currentUserId;
  const hasAgent = rowData.agentId !== null && rowData.agentId !== undefined;
  const noActionsAvailable = hasAgent && !isAssignedToCurrentUser;

  return (
    <>
      <Button
        icon="pi pi-ellipsis-v"
        text
        size="small"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          overlayRef.current.toggle(e);
        }}
      />
      
      <OverlayPanel ref={overlayRef} appendTo={typeof document !== 'undefined' ? document.body : undefined}>
        <div className="action-menu">
          {!hasAgent && currentUserId && (
            <div className="menu-title">Tomar solicitud</div>
          )}
          
          {isAssignedToCurrentUser && (
            <Button
              label="Atendiendo"
              icon="pi pi-check"
              text
              className="action-button"
              onClick={() => handleActionClick('atendiendo')}
            />
          )}
          
          {isAssignedToCurrentUser && (
            <Button
              label="Liberar"
              icon={loadingActions.has(`release-${rowData.id}`) ? "pi pi-spinner pi-spin" : "pi pi-unlock"}
              text
              className="action-button"
              disabled={loadingActions.has(`release-${rowData.id}`)}
              onClick={() => handleActionClick('release')}
            />
          )}
          
          {isAssignedToCurrentUser && (
            <Button
              label="Cotizando"
              icon="pi pi-dollar"
              text
              className="action-button"
              onClick={() => handleActionClick('cotizando')}
            />
          )}
          
          {isAssignedToCurrentUser && (
            <Button
              label="Sin respuesta"
              icon="pi pi-times"
              text
              className="action-button"
              onClick={() => handleActionClick('sin_respuesta')}
            />
          )}
          
          {!hasAgent && currentUserId && (
            <Button
              label="Tomar solicitud"
              icon={loadingActions.has(`take-${rowData.id}`) ? "pi pi-spinner pi-spin" : "pi pi-hand"}
              text
              className="action-button"
              disabled={loadingActions.has(`take-${rowData.id}`)}
              onClick={() => handleActionClick('take')}
            />
          )}

          {noActionsAvailable && (
            <div style={{ padding: 8, color: '#6b7280' }}>Sin acciones disponibles</div>
          )}
        </div>
      </OverlayPanel>
    </>
  );
};

const BandejaSolicitud = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const [currentTime, setCurrentTime] = useState(() => {
    // Inicializar con hora de Perú
    const peruTime = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' });
    return new Date(peruTime);
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadingActions, setLoadingActions] = useState(new Set());
  const [lastFailedAction, setLastFailedAction] = useState(null);

  // Obtener ID del usuario actual
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Decodificar el token JWT para obtener el user ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub || payload.userId || payload.id);
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }, []);

  // Cargar datos del backend
  useEffect(() => {
    loadQuoteRequests();
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar tiempo cada minuto para el contador de expiración
  useEffect(() => {
    const interval = setInterval(() => {
      // Usar hora de Perú
      const peruTime = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' });
      setCurrentTime(new Date(peruTime));
    }, 60000); // Actualizar cada 60 segundos (1 minuto)

    return () => clearInterval(interval);
  }, []);

  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const repository = new QuoteRequestRepository();
      const useCase = new GetAllQuoteRequests(repository);
      const result = await useCase.execute(currentPage, 10);
      
      // Mapear los datos del backend al formato esperado por el frontend
      const mappedRequests = result.data?.map(request => ({
        id: request.id,
        cliente: request.passengerName,
        pais: request.client?.pais || 'N/A',
        telefono: `${request.countryCode} ${request.whatsapp}`,
        email: request.email,
        mensaje: request.message || 'Sin mensaje adicional',
        fechaViaje: request.travelDate ? formatDate(request.travelDate) : 'Sin fecha',
        fechaSolicitud: formatDateTime(request.createdAt || new Date()),
        agente: request.agent ? request.agent.username : '',
        venceEn: '45 min.', // Se calculará dinámicamente en el template
        estado: mapStatus(request.status),
        servicios: request.services?.map(s => s.service?.name) || [],
        createdAt: request.createdAt, // Agregar para el template de expiración
        agentId: request.agentId // Agregar para los botones de acción
      })) || [];

      console.log('Mapped requests:', mappedRequests);
      setRequests(mappedRequests);
      setTotalRecords(result.total || 0);
    } catch (err) {
      setError(err.message || 'Error al cargar las solicitudes');
      console.error('Error loading quote requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funciones helper para formatear datos
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const mapStatus = (status) => {
    const statusMap = {
      'recibido': 'Solicitado',
      'en_progreso': 'Atendiendo',
      'cotizando': 'Cotizando',
      'liberado': 'Liberado',
      'sin_respuesta': 'Sin respuesta'
    };
    return statusMap[status] || status;
  };

  const expirationTemplate = (rowData) => {
    return <ExpirationCounter createdAt={rowData.createdAt} currentTime={currentTime} />;
  };

  // Función optimizada para actualizar solo una solicitud específica
  const updateRequestInList = (requestId, updatedData) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId ? { ...request, ...updatedData } : request
      )
    );
  };

  // Funciones optimizadas para manejar acciones de asignación
  const handleReleaseRequest = async (requestId) => {
    const actionKey = `release-${requestId}`;
    setLoadingActions(prev => new Set([...prev, actionKey]));
    
    try {
      const repository = new QuoteRequestRepository();
      const result = await repository.releaseRequest(requestId, currentUserId);
      updateRequestInList(requestId, {
        agentId: null,
        agente: '',
        estado: mapStatus(result.status)
      });
    } catch (error) {
      console.error('Error al liberar solicitud:', error);
      setError('Error al liberar solicitud: ' + error.message);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  const handleTakeRequest = async (requestId) => {
    const actionKey = `take-${requestId}`;
    setLoadingActions(prev => new Set([...prev, actionKey]));
    
    try {
      const repository = new QuoteRequestRepository();
      const result = await repository.takeRequest(requestId, currentUserId);
      updateRequestInList(requestId, {
        agentId: result.agentId,
        agente: result.agent ? result.agent.username : '',
        estado: mapStatus(result.status)
      });
    } catch (error) {
      console.error('Error al tomar solicitud:', error);
      setError('Error al tomar solicitud: ' + error.message);
      setLastFailedAction({ type: 'take', requestId });
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  const handleMarkAsQuoting = async (requestId) => {
    try {
      const repository = new QuoteRequestRepository();
      const result = await repository.markAsQuoting(requestId, currentUserId);
      updateRequestInList(requestId, {
        agentId: null, // Ya no está asignada
        agente: '',
        estado: mapStatus(result.status)
      });
    } catch (error) {
      console.error('Error al marcar como cotizando:', error);
      setError('Error al marcar como cotizando: ' + error.message);
    }
  };

  const handleMarkAsNoResponse = async (requestId) => {
    try {
      const repository = new QuoteRequestRepository();
      const result = await repository.markAsNoResponse(requestId, currentUserId);
      updateRequestInList(requestId, {
        agentId: null, // Ya no está asignada
        agente: '',
        estado: mapStatus(result.status)
      });
    } catch (error) {
      console.error('Error al marcar como sin respuesta:', error);
      setError('Error al marcar como sin respuesta: ' + error.message);
    }
  };

  // Función unificada para manejar todas las acciones
  const handleAction = async (actionType, requestId) => {
    switch (actionType) {
      case 'release':
        await handleReleaseRequest(requestId);
        break;
      case 'take':
        await handleTakeRequest(requestId);
        break;
      case 'cotizando':
        await handleMarkAsQuoting(requestId);
        break;
      case 'sin_respuesta':
        await handleMarkAsNoResponse(requestId);
        break;
      default:
        console.log('Acción no reconocida:', actionType);
    }
  };

  // Función para reintentar la última acción fallida
  const handleRetry = async () => {
    if (lastFailedAction) {
      setError(''); // Limpiar error
      await handleAction(lastFailedAction.type, lastFailedAction.requestId);
      setLastFailedAction(null);
    }
  };


  const clienteTemplate = (rowData) => {
    return (
      <div className="cliente-info">
        <div className="cliente-nombre">{rowData.cliente}</div>
        <div className="cliente-datos">{rowData.pais}: {rowData.telefono}</div>
      </div>
    );
  };

  const emailTemplate = (rowData) => {
    return (
      <div className="email-info">
        <div className="email-direccion">{rowData.email}</div>
        <div className="email-mensaje">{rowData.mensaje}</div>
      </div>
    );
  };

  const serviciosTemplate = (rowData) => {
    if (!rowData.servicios || rowData.servicios.length === 0) {
      return (
        <div className="servicios-info">
          <div className="servicio-item">No hay servicios solicitados</div>
        </div>
      );
    }
    return (
      <div className="servicios-info">
        {rowData.servicios.map((servicio, index) => (
          <div key={index} className="servicio-item">• {servicio}</div>
        ))}
      </div>
    );
  };

  const rowExpansionTemplate = (data) => {
    return (
      <div className="expanded-content">
        <div className="services-section">
          <h4>Servicios solicitados:</h4>
          {serviciosTemplate(data)}
        </div>
      </div>
    );
  };

  const estadoTemplate = (rowData) => {
    const getEstadoClass = (estado) => {
      switch (estado) {
        case 'Atendiendo': return 'estado-atendiendo';
        case 'Liberado': return 'estado-liberado';
        case 'Solicitado': return 'estado-solicitado';
        default: return 'estado-default';
      }
    };

    return (
      <div className={`estado-badge ${getEstadoClass(rowData.estado)}`}>
        {rowData.estado}
      </div>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <ActionButton 
        rowData={rowData}
        currentUserId={currentUserId}
        loadingActions={loadingActions}
        onAction={handleAction}
      />
    );
  };

  return (
    <div className="bandeja-solicitud">
      <div className="bandeja-header">
        <h1>Bandeja de solicitud</h1>
        <div className="bandeja-search">
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar"
            className="search-input"
          />
        </div>
      </div>

      <div className="bandeja-content">
        {loading && (
          <div className="loading-container">
            <ProgressSpinner />
            <p>Cargando solicitudes...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p>Error: {error}</p>
            <Button 
              label="Reintentar" 
              onClick={lastFailedAction ? handleRetry : loadQuoteRequests}
              className="p-button-primary"
            />
          </div>
        )}

        {!loading && !error && (
          <DataTable
            value={requests}
            className="requests-table"
            responsiveLayout="scroll"
            paginator
            rows={10}
            first={currentPage * 10}
            totalRecords={totalRecords}
            onPage={(e) => setCurrentPage(e.page)}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} solicitudes"
            emptyMessage="No hay solicitudes disponibles"
            expandedRows={expandedRows}
            onRowToggle={(e) => {
              console.log('Row toggle event:', e);
              setExpandedRows(e.data);
            }}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="id"
            expandableRowGroups={false}
          >
          <Column expander style={{ width: '3rem' }} />
          <Column field="cliente" header="Cliente" body={clienteTemplate} />
          <Column field="email" header="Correo" body={emailTemplate} />
          <Column field="fechaViaje" header="Fecha probable de viaje" />
          <Column field="fechaSolicitud" header="Fecha solicitada" />
          <Column field="agente" header="Agente" />
          <Column field="venceEn" header="Vence en" body={expirationTemplate} />
          <Column field="estado" header="Estado Solicitud" body={estadoTemplate} />
          <Column body={actionTemplate} header="" style={{ width: '50px' }} />
          </DataTable>
        )}
      </div>
    </div>
  );
};

export default BandejaSolicitud;
