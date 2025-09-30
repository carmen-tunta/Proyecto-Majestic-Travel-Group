import React, { useState, useEffect } from 'react';
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

const BandejaSolicitud = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const overlayRef = useRef(null);

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
        pais: request.client?.pais || 'N/A',
        telefono: `${request.countryCode} ${request.whatsapp}`,
        email: request.email,
        mensaje: request.message || 'Sin mensaje adicional',
        fechaViaje: request.travelDate ? formatDate(request.travelDate) : 'Sin fecha',
        fechaSolicitud: formatDateTime(request.createdAt || new Date()),
        agente: request.agentId ? `Agente ${request.agentId}` : '',
        venceEn: calculateExpiration(request.createdAt),
        estado: mapStatus(request.status),
        servicios: request.services?.map(s => s.service?.name) || []
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
    return date.toLocaleString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateExpiration = (createdAt) => {
    if (!createdAt) return 'N/A';
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffMinutes >= 60) {
      return '0 min.';
    } else {
      return `${60 - diffMinutes} min.`;
    }
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
      <Button
        icon="pi pi-ellipsis-v"
        text
        size="small"
        onClick={(e) => {
          setSelectedRequest(rowData);
          overlayRef.current.toggle(e);
        }}
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
            <Button label="Reintentar" onClick={loadQuoteRequests} />
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
          <Column field="venceEn" header="Vence en" />
          <Column field="estado" header="Estado Solicitud" body={estadoTemplate} />
          <Column body={actionTemplate} header="" style={{ width: '50px' }} />
          </DataTable>
        )}
      </div>

      <OverlayPanel ref={overlayRef}>
        <div className="action-menu">
          <Button
            label="Tomar solicitud"
            icon="pi pi-hand-up"
            text
            className="action-button"
            onClick={() => {
              console.log('Tomar solicitud', selectedRequest);
              overlayRef.current.hide();
            }}
          />
          <Button
            label="Atendiendo"
            icon="pi pi-check"
            text
            className="action-button"
            onClick={() => {
              console.log('Atendiendo', selectedRequest);
              overlayRef.current.hide();
            }}
          />
          <Button
            label="Liberar"
            icon="pi pi-unlock"
            text
            className="action-button"
            onClick={() => {
              console.log('Liberar', selectedRequest);
              overlayRef.current.hide();
            }}
          />
          <Button
            label="Cotizando"
            icon="pi pi-dollar"
            text
            className="action-button"
            onClick={() => {
              console.log('Cotizando', selectedRequest);
              overlayRef.current.hide();
            }}
          />
          <Button
            label="Sin respuesta"
            icon="pi pi-times"
            text
            className="action-button"
            onClick={() => {
              console.log('Sin respuesta', selectedRequest);
              overlayRef.current.hide();
            }}
          />
        </div>
      </OverlayPanel>
    </div>
  );
};

export default BandejaSolicitud;
