import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ProgressSpinner } from 'primereact/progressspinner';
import QuoteRequestRepository from '../../../modules/QuoteRequest/repository/QuoteRequestRepository';
import GetAllQuoteRequests from '../../../modules/QuoteRequest/application/GetAllQuoteRequests';
import '../styles/BandejaSolicitud.css';

// Componente separado para el contador que se actualiza automáticamente
const ExpirationCounter = ({ createdAt }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Actualizar cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60 segundos (1 minuto)

    return () => clearInterval(interval);
  }, []);

  const calculateExpiration = () => {
    if (!createdAt) {
      console.log('⚠️ No hay createdAt');
      return { text: 'N/A', minutes: 0 };
    }
    
    // Parsear la fecha. MySQL guarda en hora local del servidor (Perú)
    let timestamp = createdAt;
    if (typeof createdAt === 'string' && createdAt.includes(' ') && !createdAt.includes('T')) {
      timestamp = createdAt.replace(' ', 'T');
    }
    
    // Crear fecha asumiendo que es hora de Perú
    const created = new Date(timestamp);
    const now = currentTime;
    
    // Calcular diferencia en minutos
    const diffMinutes = Math.floor((now - created) / (1000 * 60));
    
    console.log('🕐 ExpirationCounter (Perú Time):', {
      createdAt: createdAt,
      created: created.toString(),
      now: now.toString(),
      diffMinutes: diffMinutes
    });
    
    // 45 minutos por defecto
    const totalMinutes = 45;
    const remainingMinutes = totalMinutes - diffMinutes;
    
    if (remainingMinutes <= 0) {
      return { text: '0 min.', minutes: 0 };
    }
    
    if (remainingMinutes > totalMinutes) {
      return { text: `${totalMinutes} min.`, minutes: totalMinutes };
    }
    
    return { text: `${remainingMinutes} min.`, minutes: remainingMinutes };
  };

  const { text, minutes } = calculateExpiration();
  
  const getExpirationClass = (mins) => {
    if (mins === 0) return 'expiration-expired';
    if (mins <= 5) return 'expiration-critical';
    if (mins <= 15) return 'expiration-warning';
    return 'expiration-normal';
  };

  return (
    <div className={`expiration-badge ${getExpirationClass(minutes)}`}>
      {text}
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
              icon={loadingActions.has(`attending-${rowData.id}`) ? "pi pi-spinner pi-spin" : "pi pi-check"}
              text
              className="action-button"
              disabled={loadingActions.has(`attending-${rowData.id}`)}
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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadingActions, setLoadingActions] = useState(new Set());
  const [lastFailedAction, setLastFailedAction] = useState(null);
  const [globalActionLoading, setGlobalActionLoading] = useState(false);

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
        pais: request.client?.pais || request.countryName || (request.countryCode ? getCountryFromCode(request.countryCode) : 'N/A'),
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

  // Helper para obtener país desde código telefónico
  const getCountryFromCode = (code) => {
    const countryMap = {
      '+34': 'España',
      '+51': 'Perú',
      '+1': 'Estados Unidos',
      '+52': 'México',
      '+54': 'Argentina',
      '+56': 'Chile',
      '+57': 'Colombia',
      '+58': 'Venezuela',
      '+591': 'Bolivia',
      '+593': 'Ecuador',
      '+595': 'Paraguay',
      '+598': 'Uruguay',
      '+55': 'Brasil',
      '+44': 'Reino Unido',
      '+33': 'Francia',
      '+49': 'Alemania',
      '+39': 'Italia',
      '+41': 'Suiza'
    };
    return countryMap[code] || 'N/A';
  };

  // Funciones helper para formatear datos
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    // Parsear timestamp como UTC y mostrar en hora de Lima
    let timestamp = dateString;
    if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
      timestamp = dateString.replace(' ', 'T') + 'Z'; // Forzar UTC
    }
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Sin fecha';
    // Parsear timestamp. Si viene sin zona (MySQL), tratarlo como UTC
    let timestamp = dateString;
    if (typeof dateString === 'string') {
      // Formato MySQL: "YYYY-MM-DD HH:mm:ss" → añadir Z para UTC
      if (dateString.includes(' ') && !dateString.includes('T') && !dateString.includes('Z')) {
        timestamp = dateString.replace(' ', 'T') + 'Z';
      }
      // Formato ISO sin Z: "YYYY-MM-DDTHH:mm:ss" → añadir Z
      else if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
        timestamp = dateString + 'Z';
      }
    }
    const date = new Date(timestamp);
    
    // Mostrar en hora de Lima (UTC-5)
    return date.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };


  const mapStatus = (status) => {
    const statusMap = {
      'recibido': 'Asignado',
      'en_progreso': 'Atendiendo',
      'cotizando': 'Cotizando',
      'liberado': 'Liberado',
      'sin_respuesta': 'Sin respuesta'
    };
    return statusMap[status] || status;
  };

  const expirationTemplate = (rowData) => {
    return <ExpirationCounter createdAt={rowData.createdAt} />;
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
    setGlobalActionLoading(true);
    
    try {
      const repository = new QuoteRequestRepository();
      const result = await repository.releaseRequest(requestId, currentUserId);
      updateRequestInList(requestId, {
        agentId: null,
        agente: '',
        estado: mapStatus(result.status)
      });
      setError('');
    } catch (error) {
      console.error('Error al liberar solicitud:', error);
      setError('Error al liberar solicitud: ' + error.message);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
      setGlobalActionLoading(false);
    }
  };

  const handleTakeRequest = async (requestId) => {
    const actionKey = `take-${requestId}`;
    setLoadingActions(prev => new Set([...prev, actionKey]));
    setGlobalActionLoading(true);
    
    try {
      const repository = new QuoteRequestRepository();
      const result = await repository.takeRequest(requestId, currentUserId);
      updateRequestInList(requestId, {
        agentId: result.agentId,
        agente: result.agent ? result.agent.username : '',
        estado: mapStatus(result.status)
      });
      setError('');
      setLastFailedAction(null);
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
      setGlobalActionLoading(false);
    }
  };

  const handleMarkAsQuoting = async (requestId) => {
    const actionKey = `quoting-${requestId}`;
    setLoadingActions(prev => new Set([...prev, actionKey]));
    setGlobalActionLoading(true);
    try {
      const repository = new QuoteRequestRepository();
      const result = await repository.markAsQuoting(requestId, currentUserId);
      updateRequestInList(requestId, {
        agentId: null,
        agente: '',
        estado: mapStatus(result.status)
      });
      setError('');
    } catch (error) {
      console.error('Error al marcar como cotizando:', error);
      setError('Error al marcar como cotizando: ' + error.message);
      setLastFailedAction({ type: 'cotizando', requestId });
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
      setGlobalActionLoading(false);
    }
  };

  const handleMarkAsNoResponse = async (requestId) => {
    const actionKey = `noresp-${requestId}`;
    setLoadingActions(prev => new Set([...prev, actionKey]));
    setGlobalActionLoading(true);
    try {
      const repository = new QuoteRequestRepository();
      const result = await repository.markAsNoResponse(requestId, currentUserId);
      updateRequestInList(requestId, {
        agentId: null,
        agente: '',
        estado: mapStatus(result.status)
      });
      setError('');
    } catch (error) {
      console.error('Error al marcar como sin respuesta:', error);
      setError('Error al marcar como sin respuesta: ' + error.message);
      setLastFailedAction({ type: 'sin_respuesta', requestId });
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
      setGlobalActionLoading(false);
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
      case 'atendiendo': {
        const actionKey = `attending-${requestId}`;
        setLoadingActions(prev => new Set([...prev, actionKey]));
        setGlobalActionLoading(true);
        try {
          const repository = new QuoteRequestRepository();
          const result = await repository.markAsAttending(requestId);
          updateRequestInList(requestId, {
            estado: mapStatus(result.status)
          });
          setError('');
        } catch (error) {
          console.error('Error al marcar como atendiendo:', error);
          setError('Error al marcar como atendiendo: ' + error.message);
          setLastFailedAction({ type: 'atendiendo', requestId });
        } finally {
          setLoadingActions(prev => {
            const newSet = new Set(prev);
            newSet.delete(actionKey);
            return newSet;
          });
          setGlobalActionLoading(false);
        }
        break;
      }
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
        case 'Asignado': return 'estado-asignado';
        case 'Atendiendo': return 'estado-atendiendo';
        case 'Cotizando': return 'estado-cotizando';
        case 'Sin respuesta': return 'estado-sin-respuesta';
        case 'Liberado': return 'estado-liberado';
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

      <div className="bandeja-content" style={{ position: 'relative' }}>
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

        {globalActionLoading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 5
          }}>
            <div style={{ textAlign: 'center' }}>
              <ProgressSpinner style={{ width: 40, height: 40 }} />
              <div style={{ marginTop: 8, color: '#334155', fontWeight: 600 }}>Aplicando cambio...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BandejaSolicitud;
