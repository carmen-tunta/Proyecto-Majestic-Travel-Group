import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import SearchBar from '../../../components/SearchBar';
import GetAllCotizaciones from '../../../modules/Cotizacion/application/GetAllCotizaciones';
import '../../Cotizacion/styles/Cotizacion.css';
import '../styles/CotizacionReporte.css';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const CotizacionReporte = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [first, setFirst] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    anio: { value: null },
    categoria: { value: null },
    mes: { value: null },
    estado: { value: null },
    origen: { value: null }
  });
  const [expandedRows, setExpandedRows] = useState({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await new GetAllCotizaciones().execute();
      const mapped = (Array.isArray(data) ? data : []).map((r) => {
        const fecha = r?.fechaViaje ? parseToDate(r.fechaViaje) : null;
        const anio = fecha ? fecha.getFullYear() : '';
        const mesIdx = fecha ? fecha.getMonth() : null;
        return {
          id: r?.id,
          anio,
          categoria: r?.categoria || '',
          mesInicio: mesIdx != null ? MONTHS[mesIdx] : '',
          mesIndex: mesIdx,
          estado: r?.estado || '',
          nombreCotizacion: r?.nombreCotizacion || '',
          origen: r?.agencia || '',
          codigoReserva: r?.codigoReserva || r?.codigo || '',
          lugarRecojo: r?.lugarRecojo || '',
          idioma: r?.idioma || '',
          nAdultos: r?.nroAdultos ?? '',
          nNinos: r?.nroNinos ?? '',
          nBebes: r?.nroBebes ?? '',
          nPax: r?.nroPax ?? null,
          comentario: r?.comentario || r?.nota || '',
          clienteNombre: r?.cliente?.nombre || '',
          nacionalidad: r?.pais || '',
          utilidad: r?.utilidad != null ? Number(r.utilidad) : null,
          fechaViaje: r?.fechaViaje || '',
          categoriaNormalized: r?.categoria === 'Priv' ? 'Privado' : (r?.categoria || '')
        };
      });
      setRows(mapped);
    } catch (e) {
      console.error('Error loading cotizaciones (reporte):', e);
      setError(e.message || 'Error al cargar cotizaciones');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setFirst(0); }, [filters, q]);
  useEffect(() => {
    // Expandir todas las filas como en la vista original
    const map = {};
    filtered.forEach(r => { if (r?.id != null) map[r.id] = true; });
    setExpandedRows(map);
  }, [/* eslint-disable-line */ rows, filters, q]);

  const anioOptions = useMemo(() => {
    const set = new Set();
    rows.forEach(r => { if (r.anio) set.add(r.anio); });
    return [{ label: 'Todos', value: null }, ...Array.from(set).sort().map(a => ({ label: String(a), value: a }))];
  }, [rows]);

  const categoriaOptions = useMemo(() => {
    const set = new Set();
    rows.forEach(r => { if (r.categoria) set.add(r.categoria); });
    return [{ label: 'Todos', value: null }, ...Array.from(set).sort().map(a => ({ label: a, value: a }))];
  }, [rows]);

  const mesOptions = useMemo(() => {
    return [{ label: 'Todos', value: null }, ...MONTHS.map((m, i) => ({ label: m, value: i }))];
  }, []);

  const estadoOptions = useMemo(() => {
    const set = new Set();
    rows.forEach(r => { if (r.estado) set.add(r.estado); });
    return [{ label: 'Todos', value: null }, ...Array.from(set).sort().map(a => ({ label: a, value: a }))];
  }, [rows]);

  const origenOptions = useMemo(() => {
    const set = new Set();
    rows.forEach(r => { if (r.origen) set.add(r.origen); });
    return [{ label: 'Todos', value: null }, ...Array.from(set).sort().map(a => ({ label: a, value: a }))];
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows
      .filter(r => {
        if (filters.anio.value != null && r.anio !== filters.anio.value) return false;
        if (filters.categoria.value && r.categoria !== filters.categoria.value) return false;
        if (filters.mes.value != null && r.mesIndex !== filters.mes.value) return false;
        if (filters.estado.value && r.estado !== filters.estado.value) return false;
        if (filters.origen.value && r.origen !== filters.origen.value) return false;
        if (!term) return true;
          return [r.clienteNombre, r.nombreCotizacion, r.origen, r.codigoReserva, r.lugarRecojo, r.idioma, r.estado]
          .some(v => (v || '').toLowerCase().includes(term));
      })
        .sort((a, b) => a.clienteNombre.localeCompare(b.clienteNombre));
  }, [rows, filters, q]);

  // Agrupación visual removida por solicitud; mantenemos orden por categoría

  const totalRecords = filtered.length;
  const onPageChange = (e) => { setFirst(e.first); setRowsPerPage(e.rows); };
  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: { value } }));

  // Detalle expandido por fila (mismo estilo que Cotización original)
  const rowExpansionTemplate = (r) => (
    <div className="cotz-detail-row">
      <span className="cotz-det-label">Cotización:</span> {r?.nombreCotizacion || ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">Nacionalidad:</span> {r?.nacionalidad || ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">Idioma del tour:</span> {r?.idioma || ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">Nro. pax:</span> {r?.nPax ?? r?.nAdultos ?? ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">Nro. Niños(as):</span> {r?.nNinos ?? ''}
    </div>
  );

  return (
    <div className="cotizaciones">
      <div className="cotizaciones-header">
        <h2>Reporte: Cotización</h2>
        <Button icon="pi pi-refresh" label="Actualizar" size="small" outlined onClick={fetchData} />
      </div>

      <div className="cotizaciones-search cotz-search-half">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar cliente, código, origen..." />
      </div>
      {/* Filtros integrados en cabecera de la tabla (como Clientes/Bandeja) */}

      <div className="card">
        <DataTable
          className="cotizaciones-table cotz-report"
          size="small"
          value={filtered}
          emptyMessage="No hay registros"
          loading={loading}
          paginator
          first={first}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPage={onPageChange}
          paginatorClassName="custom-paginator"
          dataKey="id"
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column expander className="cotz-expander-col" />
          <Column 
            header="Nombre del cliente" 
            body={(r) => <span className="client-name" data-label="Cliente">{r?.clienteNombre}</span>} 
          />
          <Column 
            header="Categoría"
            body={(r) => <span data-label="Categoría">{r?.categoriaNormalized}</span>}
            filter
            filterElement={
              <Dropdown value={filters.categoria.value} options={categoriaOptions} onChange={(e) => handleFilterChange('categoria', e.value)} placeholder="Todos" showClear className="p-column-filter" />
            }
          />
          <Column header="% Utilidad" body={(r) => <span data-label="% Utilidad">{r?.utilidad != null ? `${Number(r.utilidad).toFixed(0)}%` : ''}</span>} />
          <Column header="Código reserva" body={(r) => <span data-label="Código">{r?.codigoReserva || ''}</span>} />
          <Column 
            header="Año"
            field="anio"
            filter
            filterElement={
              <Dropdown value={filters.anio.value} options={anioOptions} onChange={(e) => handleFilterChange('anio', e.value)} placeholder="Todos" showClear className="p-column-filter" />
            }
          />
          <Column 
            header="Mes"
            field="mesInicio"
            filter
            filterElement={
              <Dropdown value={filters.mes.value} options={mesOptions} onChange={(e) => handleFilterChange('mes', e.value)} placeholder="Todos" showClear className="p-column-filter" />
            }
          />
          <Column 
            header="Estado"
            body={(r) => <span data-label="Estado">{r?.estado || ''}</span>}
            filter
            filterElement={
              <Dropdown value={filters.estado.value} options={estadoOptions} onChange={(e) => handleFilterChange('estado', e.value)} placeholder="Todos" showClear className="p-column-filter" />
            }
          />
          <Column 
            header="Origen"
            field="origen"
            filter
            filterElement={
              <Dropdown value={filters.origen.value} options={origenOptions} onChange={(e) => handleFilterChange('origen', e.value)} placeholder="Todos" showClear className="p-column-filter" />
            }
          />
        </DataTable>
      </div>
    </div>
  );
};

function parseToDate(value) {
  if (!value) return null;
  // 'YYYY-MM-DD' => parse as local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y,m,d] = value.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  return new Date(value);
}

// Fecha local legible como en la vista original de Cotización
function formatLocalDate(value) {
  if (!value) return '';
  try {
    const m = /^\d{4}-\d{2}-\d{2}$/.exec(value);
    let d;
    if (m) {
      const [y, mth, day] = value.split('-').map(Number);
      d = new Date(y, mth - 1, day, 12, 0, 0);
    } else {
      d = new Date(value);
    }
    return d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' });
  } catch {
    return value;
  }
}

export default CotizacionReporte;
