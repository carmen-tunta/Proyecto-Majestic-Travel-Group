import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import SearchBar from '../../../components/SearchBar';
import AddServiceToCotizacion from '../../../modules/Cotizacion/application/AddServiceToCotizacion';
import AddComponentsToCotizacionService from '../../../modules/Cotizacion/application/AddComponentsToCotizacionService';
import { apiService } from '../../../services/apiService';

export default function SelectAddModal({ visible, onHide, mode = 'service', cotizacionId, csId, onAdded, showNotification }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const isService = mode === 'service';

  // Buscar con debounce
  useEffect(() => {
    if (!visible) { setQuery(''); setResults([]); setSelected(null); return; }
    let active = true;
    const t = setTimeout(async () => {
      if (!query) { if (active) setResults([]); return; }
      setIsSearching(true);
      try {
        const res = isService ? await apiService.searchServices(query) : await apiService.searchComponents(query);
        if (active) setResults(Array.isArray(res) ? res : []);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setIsSearching(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(t); };
  }, [query, visible, mode]);

  // Autoseleccionar primera fila cuando llegan resultados
  useEffect(() => {
    if (visible && results.length > 0 && !selected) {
      setSelected(results[0]);
    }
  }, [results, visible]);

  const highlight = useMemo(() => (text) => {
    const t = String(text || '');
    const q = String(query || '').trim();
    if (!q) return t;
    const escQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escQ})`, 'ig');
    const parts = t.split(re);
    return parts.map((chunk, i) => (re.test(chunk) ? <b key={i}>{chunk}</b> : <span key={i}>{chunk}</span>));
  }, [query]);

  async function handleAdd() {
    try {
      let item = selected;
      if (!item && results.length > 0) item = results[0];
      if (!item) { showNotification && showNotification('Selecciona un elemento', 'error'); return; }
      if (isService) {
        if (!cotizacionId) { showNotification && showNotification('Guarda la cotización primero', 'error'); return; }
        await new AddServiceToCotizacion().execute(cotizacionId, { serviceId: item.id });
      } else {
        if (!csId) { showNotification && showNotification('Selecciona un servicio en la lista para agregar componentes', 'error'); return; }
        await new AddComponentsToCotizacionService().execute(csId, [item.id]);
      }
      onAdded && onAdded();
      onHide();
    } catch (e) {
      showNotification && showNotification(e.message || 'No se pudo agregar', 'error');
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <Dialog
      header={isService ? 'Agregar servicio' : 'Agregar componente'}
      visible={visible}
      modal
      style={{ width: 720, maxWidth: '95vw' }}
      onHide={onHide}
    >
      <div style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }} onKeyDown={onKeyDown}>
        <div style={{ flex: 1 }}>
          <SearchBar value={query} onChange={setQuery} placeholder={isService ? 'Buscar servicios...' : 'Buscar componentes...'} />
        </div>
        <button className="btn-primary" onClick={handleAdd} disabled={!selected && results.length === 0}>Agregar</button>
      </div>

      <DataTable
        value={results}
        loading={isSearching}
        selectionMode="single"
        selection={selected}
        onSelectionChange={(e) => setSelected(e.value)}
        onRowDoubleClick={(e) => { setSelected(e.data); handleAdd(); }}
        size="small"
        scrollable
        scrollHeight="320px"
        emptyMessage={query ? 'Sin resultados' : 'Empieza a escribir para buscar'}
        stripedRows
      >
        {isService ? (
          <>
            <Column header="Nombre del servicio" style={{ width: '70%' }} body={(row) => <span>{highlight(row.name)}</span>} />
            <Column header="Ciudad" style={{ width: '30%' }} body={(row) => <span>{highlight(row.city)}</span>} />
          </>
        ) : (
          <>
            <Column header="Nombre del componente" style={{ width: '70%' }} body={(row) => <span>{highlight(row.componentName)}</span>} />
            <Column header="Tipo de servicio" style={{ width: '30%' }} body={(row) => <span>{highlight(row.serviceType)}</span>} />
          </>
        )}
      </DataTable>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button className="btn-outline" onClick={onHide}>Cerrar</button>
      </div>
    </Dialog>
  );
}
