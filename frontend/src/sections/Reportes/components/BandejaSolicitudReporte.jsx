import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import SearchBar from '../../../components/SearchBar';
import QuoteRequestRepository from '../../../modules/QuoteRequest/repository/QuoteRequestRepository';
import GetAllQuoteRequests from '../../../modules/QuoteRequest/application/GetAllQuoteRequests';
import '../../BandejaSolicitud/styles/BandejaSolicitud.css';
import '../styles/BandejaSolicitudReporte.css';

const UNASSIGNED_LABEL = 'Sin asignar';
const FETCH_LIMIT = 200;

const BandejaSolicitudReporte = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [first, setFirst] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filters, setFilters] = useState({ estado: { value: null }, agente: { value: null } });

  const loadQuoteRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const repository = new QuoteRequestRepository();
      const useCase = new GetAllQuoteRequests(repository);
      const result = await useCase.execute(0, FETCH_LIMIT);
      const mappedRequests = result.data?.map((request) => ({
        id: request.id,
        cliente: request.passengerName,
        pais: request.client?.pais || request.countryName || (request.countryCode ? getCountryFromCode(request.countryCode) : 'N/A'),
        telefono: [request.countryCode, request.whatsapp].filter(Boolean).join(' '),
        email: request.email,
        mensaje: request.message || 'Sin mensaje adicional',
        fechaViaje: request.travelDate ? formatDate(request.travelDate) : 'Sin fecha',
        fechaSolicitud: formatDateTime(request.createdAt || new Date()),
        agente: request.agent ? request.agent.username : UNASSIGNED_LABEL,
        estado: mapStatus(request.status)
      })) || [];
      setRequests(mappedRequests);
    } catch (err) {
      console.error('Error loading quote requests (reporte):', err);
      setError(err.message || 'Error al cargar las solicitudes');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuoteRequests(); }, [loadQuoteRequests]);
  useEffect(() => { setFirst(0); }, [filters, searchTerm]);

  const estadoOptions = useMemo(() => {
    const unique = new Set();
    requests.forEach((r) => r.estado && unique.add(r.estado));
    return [{ label: 'Todos', value: null }, ...Array.from(unique).map(e => ({ label: e, value: e }))];
  }, [requests]);

  const agenteOptions = useMemo(() => {
    const unique = new Set();
    requests.forEach((r) => unique.add(r.agente || UNASSIGNED_LABEL));
    return [{ label: 'Todos', value: null }, ...Array.from(unique).map(a => ({ label: a, value: a }))];
  }, [requests]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return requests
      .filter((r) => {
        if (filters.estado.value && r.estado !== filters.estado.value) return false;
        if (filters.agente.value && r.agente !== filters.agente.value) return false;
        if (!q) return true;
        return [r.cliente, r.pais, r.telefono, r.email].some(v => (v || '').toLowerCase().includes(q));
      })
      .sort((a, b) => {
        const A = a.agente || UNASSIGNED_LABEL;
        const B = b.agente || UNASSIGNED_LABEL;
        const cmp = A.localeCompare(B);
        if (cmp !== 0) return cmp;
        return (a.fechaSolicitud || '').localeCompare(b.fechaSolicitud || '');
      });
  }, [requests, filters, searchTerm]);

  // Agrupación visual removida por solicitud; mantenemos orden por agente

  const paginated = useMemo(() => filtered.slice(first, first + rowsPerPage), [filtered, first, rowsPerPage]);
  const totalRecords = filtered.length;

  const onPageChange = (e) => { setFirst(e.first); setRowsPerPage(e.rows); };
  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: { value } }));

  // Sin cabecera de grupo

  const clienteTemplate = (row) => (
    <div className="cliente-info">
      <div className="cliente-nombre">{row.cliente}</div>
      <div className="cliente-datos">{row.pais}</div>
    </div>
  );

  const emailTemplate = (row) => (
    <div className="email-info">
      <div className="email-direccion">{row.email}</div>
      <div className="email-mensaje">{row.mensaje}</div>
    </div>
  );

  const estadoTemplate = (row) => {
    const cls = {
      'Asignado': 'estado-asignado',
      'Atendiendo': 'estado-atendiendo',
      'Cotizando': 'estado-cotizando',
      'Sin respuesta': 'estado-sin-respuesta',
      'Liberado': 'estado-liberado'
    }[row.estado] || 'estado-default';
    return <div className={`estado-badge ${cls}`}>{row.estado}</div>;
  };

  return (
    <div className="bandeja-solicitud">
      <div className="bandeja-header">
        <h2>Reporte: Bandeja de solicitud</h2>
        <div className="bandeja-header-desktop">
          <Button icon="pi pi-refresh" onClick={loadQuoteRequests} size="small" outlined tooltip="Actualizar" tooltipOptions={{ position: 'bottom' }} />
        </div>
        <div className="bandeja-header-controls">
          <Button icon="pi pi-refresh" onClick={loadQuoteRequests} size="small" outlined tooltip="Actualizar" tooltipOptions={{ position: 'bottom' }} />
          <div className="bandeja-search">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar..." />
          </div>
        </div>
      </div>

      <div className="bandeja-content" style={{ position: 'relative' }}>
        {loading && (
          <div className="loading-container">
            <ProgressSpinner />
            <p>Cargando solicitudes...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-container">
            <p>{error}</p>
            <Button label="Reintentar" onClick={loadQuoteRequests} className="p-button-primary" />
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="bandeja-search bandeja-search-desktop">
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar..." />
            </div>

            <DataTable
              value={paginated}
              className="requests-table bandeja-report-table"
              responsiveLayout="scroll"
              emptyMessage="No hay solicitudes"
              rowGroupMode="subheader"
              groupRows
              sortField="agente"
              sortOrder={1}
              rowGroupHeaderTemplate={(data) => (
                <div className="grupo-agente-header">
                  <span className="grupo-agente-nombre">{data.agente || UNASSIGNED_LABEL}</span>
                </div>
              )}
            >
              <Column
                field="agente"
                header="Agente"
                body={(row) => row.agente}
                filter
                filterElement={
                  <Dropdown
                    value={filters.agente.value}
                    options={agenteOptions}
                    onChange={(e) => handleFilterChange('agente', e.value)}
                    placeholder="Todos"
                    showClear
                    className="p-column-filter"
                  />
                }
              />
              <Column field="cliente" header="Cliente" body={clienteTemplate} />
              <Column field="pais" header="País" />
              <Column field="telefono" header="Whatsapp" />
              <Column field="email" header="Correo" body={emailTemplate} />
              <Column field="fechaViaje" header="Fecha probable de viaje" />
              <Column field="fechaSolicitud" header="Fecha solicitada" />
              <Column
                field="estado"
                header="Estado solicitud"
                body={estadoTemplate}
                filter
                filterElement={
                  <Dropdown
                    value={filters.estado.value}
                    options={estadoOptions}
                    onChange={(e) => handleFilterChange('estado', e.value)}
                    placeholder="Todos"
                    showClear
                    className="p-column-filter"
                  />
                }
              />
            </DataTable>

            <div className="bandeja-footer">
              <Paginator
                first={first}
                rows={rowsPerPage}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                rowsPerPageOptions={[10, 15, 20, 30]}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                className="custom-paginator"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function getCountryFromCode(code) {
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
}

function formatDate(dateString) {
  if (!dateString) return 'Sin fecha';
  let ts = dateString;
  if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
    ts = dateString.replace(' ', 'T') + 'Z';
  }
  const date = new Date(ts);
  return date.toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
}

function formatDateTime(dateString) {
  if (!dateString) return 'Sin fecha';
  let ts = dateString;
  if (typeof dateString === 'string') {
    if (dateString.includes(' ') && !dateString.includes('T') && !dateString.includes('Z')) {
      ts = dateString.replace(' ', 'T') + 'Z';
    } else if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
      ts = dateString + 'Z';
    }
  }
  const date = new Date(ts);
  return date.toLocaleString('es-PE', { timeZone: 'America/Lima', weekday: 'short', day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
}

function mapStatus(status) {
  const map = { recibido: 'Asignado', en_progreso: 'Atendiendo', cotizando: 'Cotizando', liberado: 'Liberado', sin_respuesta: 'Sin respuesta' };
  return map[status] || status;
}

export default BandejaSolicitudReporte;
