import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TabMenu } from 'primereact/tabmenu';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import { apiService } from '../../../services/apiService';
import CreateCotizacion from '../../../modules/Cotizacion/application/CreateCotizacion';
import UpdateCotizacion from '../../../modules/Cotizacion/application/UpdateCotizacion';
import GetCotizacionDetalle from '../../../modules/Cotizacion/application/GetCotizacionDetalle';
import GetAllCotizaciones from '../../../modules/Cotizacion/application/GetAllCotizaciones';
import AddServiceToCotizacion from '../../../modules/Cotizacion/application/AddServiceToCotizacion';
import AddComponentsToCotizacionService from '../../../modules/Cotizacion/application/AddComponentsToCotizacionService';
import AddExtraComponentToCotizacionService from '../../../modules/Cotizacion/application/AddExtraComponentToCotizacionService';
import UpdateCotizacionServiceComponent from '../../../modules/Cotizacion/application/UpdateCotizacionServiceComponent';
import DeleteCotizacionService from '../../../modules/Cotizacion/application/DeleteCotizacionService';
import DeleteCotizacionServiceComponent from '../../../modules/Cotizacion/application/DeleteCotizacionServiceComponent';
import { useNotification } from '../../Notification/NotificationContext';
import PasajerosTab from './PasajerosTab';
import '../styles/Cotizacion.css';
import '../styles/CotizacionForm.css';
import '../../Proveedores/styles/DetallesProveedores.css';
import { categorias, estados, agencias, paises, idiomas } from '../constants/options';

// (formatFecha eliminado: ya usamos Calendar con locale 'es')

// opciones compartidas importadas desde constants/options

// Registrar locale 'es' de PrimeReact antes del primer render del Calendar
addLocale('es', {
  firstDayOfWeek: 1,
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  today: 'Hoy',
  clear: 'Limpiar'
});

export default function CotizacionForm() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { showNotification } = useNotification();

  const [anio, setAnio] = useState(new Date().getFullYear());
  const [cotizacionId, setCotizacionId] = useState(null);
  const [numeroFile, setNumeroFile] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [searchType, setSearchType] = useState('service');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCS, setSelectedCS] = useState(null);
  const [clientQuery, setClientQuery] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [form, setForm] = useState({
    nombreCotizacion: '',
    categoria: categorias[0],
    fechaViaje: '',
    estado: estados[0],
    agencia: agencias[0],
    pais: paises[0],
    idioma: idiomas[0],
    utilidad: 18,
    nroPax: 1,
    nroNinos: 0,
    codigoReserva: '',
    observacion: ''
  });

  useEffect(() => {
    (async () => {
      if (routeId) {
        try {
          const list = await new GetAllCotizaciones().execute();
          const found = (list || []).find(c => String(c.id) === String(routeId));
          if (found) {
            setCotizacionId(found.id);
            setNumeroFile(found.numeroFile || '');
            setAnio(found.anio || new Date().getFullYear());
            setForm(f => ({
              ...f,
              nombreCotizacion: found.nombreCotizacion || '',
              categoria: found.categoria,
              // dejamos fechaViaje vacía para evitar formato no ISO en input
              estado: found.estado,
              agencia: found.agencia,
              pais: found.pais,
              idioma: found.idioma,
              utilidad: found.utilidad,
              nroPax: found.nroPax,
              nroNinos: found.nroNinos,
              codigoReserva: found.codigoReserva
            }));
            setSelectedClient(found.cliente || null);
            setClientQuery(found.cliente?.nombre || '');
            const det = await new GetCotizacionDetalle().execute(found.id);
            setDetalle(det);
          }
        } catch (e) { /* noop */ }
      }
    })();
  }, [routeId]);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (clientQuery) {
        try { const res = await apiService.searchClients(clientQuery); setClientResults(res); } catch (e) { setClientResults([]); }
      } else { setClientResults([]); }
    }, 300);
    return () => clearTimeout(id);
  }, [clientQuery]);

  useEffect(() => {
    let active = true;
    const h = setTimeout(async () => {
      if (!cotizacionId || !searchQuery) { setSuggestions([]); return; }
      setIsSearching(true);
      try {
        const res = searchType === 'service' ? await apiService.searchServices(searchQuery) : await apiService.searchComponents(searchQuery);
        if (active) { setSuggestions(Array.isArray(res) ? res.slice(0, 8) : []); setSelectedSuggestion(null); }
      } catch { if (active) setSuggestions([]); }
      finally { if (active) setIsSearching(false); }
    }, 300);
    return () => { active = false; clearTimeout(h); };
  }, [searchQuery, searchType, cotizacionId]);

  async function refreshDetalle(id) {
    try { const det = await new GetCotizacionDetalle().execute(id); setDetalle(det); } catch { }
  }

  async function onSave() {
    if (!selectedClient) { showNotification('Selecciona un cliente', 'error'); return; }
    if (!form.fechaViaje) { showNotification('Fecha de viaje requerida', 'error'); return; }
    try {
      const payload = {
        clienteId: selectedClient.id,
        nombreCotizacion: form.nombreCotizacion || undefined,
        categoria: form.categoria,
        utilidad: Number(form.utilidad),
        codigoReserva: form.codigoReserva || Math.random().toString(36).slice(2, 10).toUpperCase(),
        fechaViaje: form.fechaViaje, // enviar ISO
        estado: form.estado,
        agencia: form.agencia,
        pais: form.pais,
        idioma: form.idioma,
        nroPax: Number(form.nroPax),
        nroNinos: Number(form.nroNinos) || 0,
        anio,
      };
      const saved = cotizacionId ? await new UpdateCotizacion().execute(cotizacionId, payload) : await new CreateCotizacion().execute(payload);
      setNumeroFile(saved.numeroFile);
      const id = saved.id ?? saved.cotizacionId ?? cotizacionId;
      setCotizacionId(id);
      await refreshDetalle(id);
      showNotification(cotizacionId ? 'Cotización actualizada' : 'Cotización guardada', 'success');

      // Si es una nueva cotización, cambiar a la pestaña de pasajeros
      if (!cotizacionId) {
        setActiveIndex(1);
      }
    } catch (e) { showNotification(e.message || 'Error al guardar', 'error'); }
  }

  async function onAdd() {
    if (!cotizacionId) { showNotification('Guarda la cotización primero', 'error'); return; }
    try {
      if (searchType === 'service') {
        const item = selectedSuggestion || suggestions[0];
        if (!item) { showNotification('Selecciona un servicio', 'error'); return; }
        await new AddServiceToCotizacion().execute(cotizacionId, { serviceId: item.id });
        await refreshDetalle(cotizacionId);
        setSearchQuery(''); setSuggestions([]); setSelectedSuggestion(null);
      } else {
        if (!selectedCS) { showNotification('Selecciona un servicio en la lista para agregar componentes', 'error'); return; }
        const item = selectedSuggestion; // usar solo selección explícita
        if (item && item.id) {
          await new AddComponentsToCotizacionService().execute(selectedCS, [item.id]);
        } else {
          // Crear componente extra con el texto buscado
          const nombre = (searchQuery || '').trim();
          if (!nombre) { showNotification('Escribe el nombre del componente', 'error'); return; }
          await new AddExtraComponentToCotizacionService().execute(selectedCS, { nombre });
        }
        await refreshDetalle(cotizacionId);
        setSearchQuery(''); setSuggestions([]); setSelectedSuggestion(null);
      }
    } catch (e) { showNotification(e.message || 'No se pudo agregar', 'error'); }
  }

  const totalServicios = (detalle?.servicios || []).reduce((acc, s) => acc + (s.componentes || []).reduce((a, c) => a + (Number(c.precio) || 0), 0), 0);
  const costoPorPasajero = form.nroPax ? totalServicios / Number(form.nroPax) : 0;
  const precioVenta = totalServicios * (1 + Number(form.utilidad || 0) / 100);

  // Handlers para notas y precios (servicio y componente)
  // Se quitó el precio a nivel servicio según requerimiento

  async function handleComponentAddNote(componentItemId) {
    const nota = window.prompt('Agregar nota para el componente');
    if (nota === null) return;
    try {
      await new UpdateCotizacionServiceComponent().execute(componentItemId, { nota });
      await refreshDetalle(cotizacionId);
    } catch (e) { showNotification(e.message || 'No se pudo guardar la nota', 'error'); }
  }

  async function handleComponentPriceBlur(componentItemId, value) {
    const precio = Number(value);
    if (Number.isNaN(precio)) { showNotification('Precio inválido', 'error'); return; }
    try {
      await new UpdateCotizacionServiceComponent().execute(componentItemId, { precio });
      await refreshDetalle(cotizacionId);
    } catch (e) { showNotification(e.message || 'No se pudo guardar el precio', 'error'); }
  }

  // Items for TabMenu to mirror Proveedores tabs
  const items = [
    { label: 'Cotización' },
    { label: 'Nombre de pasajeros', disabled: !cotizacionId },
  ];

  return (
    <div className="menu-edition">
      <div className="header">
        <div className="header-icon">
          <i className="pi pi-arrow-left" onClick={() => navigate(-1)}></i>
          <div>Cotizaciones</div>
        </div>
        <div className="proveedor-name">{form.nombreCotizacion || selectedClient?.nombre || ''}</div>
      </div>

      <TabMenu
        model={items}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      />

      {activeIndex === 0 && (
        <>
          <div className="form-card">
            <div className="row">
              <div className="label">Año: <b>{anio}</b></div>
              <div className="label">File: <b>{numeroFile || ''}</b></div>
              <div className="row-spacer"></div>
              <button className="link-btn right-btn" onClick={onSave}>{cotizacionId ? 'Actualizar' : 'Guardar para continuar'}</button>
            </div>

            <div className="form-grid row1-grid">
              <div>
                <div className="search-select client-search-wrap">
                  <InputText value={clientQuery} onChange={e => { setClientQuery(e.target.value); setSelectedClient(null); }} placeholder="Nombre del cliente" />
                  <span className="pi pi-search right-icon" />
                  {clientQuery && !selectedClient && (
                    <div className="dropdown">
                      {clientResults.length > 0 ? (
                        clientResults.map(c => (
                          <div key={c.id} className="option" onClick={() => { setSelectedClient(c); setClientQuery(c.nombre); setClientResults([]); }}>
                            {c.nombre}
                          </div>
                        ))
                      ) : (
                        <div className="option disabled">Sin resultados</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Dropdown value={form.categoria} options={categorias} onChange={e => setForm(f => ({ ...f, categoria: e.value }))} placeholder="Privado, compartido, vip" />
              </div>
              <div>
                <Calendar value={form.fechaViaje ? new Date(form.fechaViaje) : null} onChange={e => setForm(f => ({ ...f, fechaViaje: e.value ? e.value.toISOString().slice(0, 10) : '' }))} dateFormat="D dd M y" locale="es" placeholder="Fecha de viaje" />
              </div>
              <div>
                <Dropdown value={form.estado} options={estados} onChange={e => setForm(f => ({ ...f, estado: e.value }))} placeholder="Estado" />
              </div>
            </div>

            <div className="form-grid row2-grid">
              <div>
                <InputText value={form.nombreCotizacion} onChange={e => setForm(f => ({ ...f, nombreCotizacion: e.target.value }))} placeholder="Nombre de cotización" />
              </div>
              <div>
                <Dropdown value={form.agencia} options={agencias} onChange={e => setForm(f => ({ ...f, agencia: e.value }))} placeholder="Agencia" />
              </div>
              <div>
                <InputText value={form.codigoReserva} onChange={e => setForm(f => ({ ...f, codigoReserva: e.target.value }))} placeholder="Código de reserva" />
              </div>
            </div>

            <div className="form-grid row3-grid">
              <div>
                <Dropdown value={form.pais} options={paises} onChange={e => setForm(f => ({ ...f, pais: e.value }))} placeholder="País" />
              </div>
              <div>
                <Dropdown value={form.idioma} options={idiomas} onChange={e => setForm(f => ({ ...f, idioma: e.value }))} placeholder="Idioma" />
              </div>
              <div>
                <InputText type="number" min="1" value={form.nroPax} onChange={e => setForm(f => ({ ...f, nroPax: e.target.value }))} placeholder="Nro. Paxs" />
              </div>
              <div>
                <InputText type="number" min="0" value={form.nroNinos} onChange={e => setForm(f => ({ ...f, nroNinos: e.target.value }))} placeholder="Nro Niños(as)" />
              </div>
              <div>
                <InputText type="number" min="0" max="100" value={form.utilidad} onChange={e => setForm(f => ({ ...f, utilidad: e.target.value }))} placeholder="% de utilidad" />
              </div>
              <div>
                <InputText value={form.observacion} onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} placeholder="Observación" />
              </div>
            </div>
          </div>

          <div className="center">CONSTRUIR EXPERIENCIAS</div>

          {cotizacionId && (
            <div className="form-card" style={{ marginTop: 16 }}>
              {detalle?.servicios?.length > 0 ? (
                <div>
                  {detalle.servicios.map(s => (
                    <div key={s.id} onClick={() => setSelectedCS(s.id)} className={`cotz-service-card ${selectedCS === s.id ? 'selected' : ''}`}>
                      <div className="cotz-service-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button title="Eliminar servicio" className="btn-icon" onClick={(e) => { e.stopPropagation(); new DeleteCotizacionService().execute(s.id).then(() => refreshDetalle(cotizacionId)); }}>
                            🗑️
                          </button>
                          <div className="cotz-service-title">{s.service?.name}</div>
                        </div>
                      </div>
                      {s.componentes?.map(ci => (
                        <div key={ci.id} className="cotz-component-row">
                          <button title="Eliminar componente" className="btn-icon" onClick={(e) => { e.stopPropagation(); new DeleteCotizacionServiceComponent().execute(ci.id).then(() => refreshDetalle(cotizacionId)); }}>
                            🗑️
                          </button>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="label-muted">Fecha y hora</span>
                              <span className="muted" style={{ fontSize: 12 }}>(definir)</span>
                            </div>
                            <div style={{ fontWeight: 600 }}>{ci.component?.componentName || ci.nombreExtra}</div>
                            <button className="btn-outline btn-sm" style={{ marginTop: 4 }} onClick={(e) => { e.stopPropagation(); /* asignar proveedor - placeholder */ }}>Asignar proveedor</button>
                            {ci.nota && (
                              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{ci.nota}</div>
                            )}
                          </div>
                          <button className="btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); handleComponentAddNote(ci.id); }}>Agregar nota</button>
                          <input
                            defaultValue={Number(ci.precio || 0).toFixed(2)}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) => handleComponentPriceBlur(ci.id, e.target.value)}
                            placeholder="0.00"
                            className="price-input"
                          />
                        </div>
                      ))}
                      {selectedCS === s.id && (
                        <div className="cotz-select-hint">Seleccionado para agregar componentes</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#8891a6' }}>Aún no hay servicios agregados</div>
              )}

              <div className="cotz-builder">
                <div>
                  <div className="cotz-searchline">
                    <label><input type="radio" name="searchType" checked={searchType === 'service'} onChange={() => setSearchType('service')} /> Buscar servicio</label>
                    <label><input type="radio" name="searchType" checked={searchType === 'component'} onChange={() => setSearchType('component')} /> Buscar componente</label>
                  </div>
                  <div className="cotz-searchbar">
                    <span className="icon pi pi-search" style={{ position: 'absolute', left: 10, top: 9, opacity: .6 }} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={'Ingresar criterio de búsqueda'} style={{ flex: 1, padding: '8px 30px', border: '1px solid #cfd6e4', borderRadius: 6 }} />
                    <button
                      className="btn-outline"
                      onClick={onAdd}
                      disabled={
                        searchType === 'service'
                          ? (!suggestions.length && !selectedSuggestion)
                          : (searchQuery.trim().length === 0)
                      }
                    >Agregar</button>
                    {isSearching && <div className="search-status">Buscando…</div>}
                    {suggestions.length > 0 && (
                      <div className="dropdown" style={{ top: '2.4rem' }}>
                        {suggestions.map(s => (
                          <div key={s.id} className="option" onClick={() => { setSelectedSuggestion(s); setSearchQuery((s.name || s.componentName || '').toString()); }}>
                            {s.name || s.componentName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="totals-card">
                  <div className="totals-row">
                    <span>Costo por pasajero</span><span>{costoPorPasajero.toFixed(2)}</span>
                  </div>
                  <div className="totals-row">
                    <span>Utilidad {Number(form.utilidad || 0)}%</span><span>{(totalServicios * Number(form.utilidad || 0) / 100).toFixed(2)}</span>
                  </div>
                  <div className="totals-row bold">
                    <span>Precio de venta</span><span>{precioVenta.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeIndex === 1 && cotizacionId && (
        <PasajerosTab
          cotizacionId={cotizacionId}
          cotizacionNombre={form.nombreCotizacion || `Cotización ${numeroFile}`}
        />
      )}
    </div>
  );
}
