import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GetAllCotizaciones from '../../../modules/Cotizacion/application/GetAllCotizaciones';
import { Button } from 'primereact/button';
import { usePermissions } from '../../../contexts/PermissionsContext';
import '../styles/Cotizacion.css';
import SearchBar from '../../../components/SearchBar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useModal } from '../../../contexts/ModalContext';
import DatosViajeModal from './DatosViajeModal';

export default function Cotizaciones() {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [first, setFirst] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await new GetAllCotizaciones().execute();
        if (mounted) {
          setRows(Array.isArray(data) ? data : []);
          setTotalRecords(Array.isArray(data) ? data.length : 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((r) => r?.cliente?.nombre?.toLowerCase().includes(q.toLowerCase()));
  }, [rows, q]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRowsPerPage(event.rows);
  };

  // expandir todas las filas siempre para mostrar la línea de detalle
  useEffect(() => {
    if (Array.isArray(rows)) {
      const map = {};
      rows.forEach(r => { if (r?.id != null) map[r.id] = true; });
      setExpandedRows(map);
    }
  }, [rows]);

  const rowExpansionTemplate = (row) => (
    <div className="cotz-detail-row">
      <span className="cotz-det-label">Cotización:</span> {row?.cotizacion || row?.tipoCotizacion || ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">Agencia:</span> {row?.agencia || ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">País:</span> {row?.pais || ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">Idioma:</span> {row?.idioma || ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">Nro. pax:</span> {row?.nroPax ?? ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label">Nro. Niños(as):</span> {row?.nroNinos ?? ''} <span className="cotz-sep">|</span>
      <span className="cotz-det-label" style={{cursor: 'pointer'}} onClick={() => handleClickDatosViaje(row)}> <i className='pi pi-flag'/> Datos de viaje </span>
    </div>
  );

  const actionTemplate = (row) => (
    <span className="cotz-action">
      {has('COTIZACION','VIEW') && (
      <i className="pi pi-arrow-right cotz-action-icon" title="Editar" onClick={() => navigate(`/cotizaciones/${row.id}`)} />
      )}
    </span>
  );

  // Formatea fecha en día local evitando el parseo UTC de 'YYYY-MM-DD'
  function formatLocalDate(value) {
    if (!value) return '';
    try {
      // Si viene como 'YYYY-MM-DD', construir Date local (año, mes-1, día)
      const m = /^\d{4}-\d{2}-\d{2}$/.exec(value);
      let d;
      if (m) {
        const [y, mth, day] = value.split('-').map(Number);
        d = new Date(y, mth - 1, day, 12, 0, 0); // mediodía local para evitar cambio por DST
      } else {
        // Si viene ISO con tiempo, usar new Date normal
        d = new Date(value);
      }
      return d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' });
    } catch {
      return value;
    }
  }

  const [showModal, setShowModal] = useState(false);
  const { setIsModalOpen } = useModal();
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);

  const handleClickDatosViaje = (cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setShowModal(true);
    setIsModalOpen(true);
  }

  const handleModalClose = () => {
    setShowModal(false);
    setIsModalOpen(false);
    setSelectedCotizacion(null);
  };

  return (
    <div className="cotizaciones">
      <div className="cotizaciones-header">
        <h2>Cotización</h2>
        <Button
          icon="pi pi-plus"
          label="Nuevo"
          size="small"
          outlined
          onClick={() => has('COTIZACION','CREATE') && navigate('/cotizaciones/nuevo')}
          disabled={!has('COTIZACION','CREATE')}
        />
      </div>

      <div className="cotizaciones-search cotz-search-half">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar cliente" />
      </div>

      <div className="card">
          <DataTable
            className="cotizaciones-table"
            size="small"
            value={filtered}
            emptyMessage="Sin resultados"
            loading={loading}
            paginator
            first={first}
            rows={rowsPerPage}
            totalRecords={totalRecords}
            onPage={onPageChange}
            dataKey="id"
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            responsiveLayout="scroll"
            paginatorClassName="custom-paginator"
            breakpoints={{'960px': '80vw', '641px': '95vw'}}
          >
            <Column expander className="cotz-expander-col" />
            <Column header="Nombre del cliente" body={(r) => <span className="client-name">{r?.cliente?.nombre}</span>} sortable />
            <Column header="Categoría" body={(r) => (r?.categoria === 'Priv' ? 'Privado' : r?.categoria)} />
            <Column header="% Utilidad" body={(r) => (r?.utilidad != null ? `${Number(r.utilidad).toFixed(0)}%` : '')} />
            <Column header="Código reserva" body={(r) => (r?.codigoReserva || r?.codigo || '')} />
            <Column header="Fecha viaje" body={(r) => (r?.fechaViaje ? formatLocalDate(r.fechaViaje) : '')} sortable sortField="fechaViaje" />
            <Column header="Estado" field="estado" />
            <Column header="Acción" body={actionTemplate} />
          </DataTable>
      </div>

      {showModal && (
        <DatosViajeModal 
          visible={showModal}
          onHide={handleModalClose}
          cotizacion={selectedCotizacion}   
        />
      )}

    </div>
  );
}
