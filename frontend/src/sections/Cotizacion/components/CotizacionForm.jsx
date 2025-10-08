import React, { use, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { TabMenu } from 'primereact/tabmenu';

import { InputText } from 'primereact/inputtext';

import { Dropdown } from 'primereact/dropdown';

import { Calendar } from 'primereact/calendar';

import AssignProveedorModal from './AssignProveedorModal';

import { Button } from 'primereact/button';

import { AutoComplete } from 'primereact/autocomplete';

import { DataTable } from 'primereact/datatable';

import { Column } from 'primereact/column';

import { InputNumber } from 'primereact/inputnumber';

import { Calendar as PrimeCalendar } from 'primereact/calendar';

import { Dialog } from 'primereact/dialog';

import { addLocale } from 'primereact/api';

import { FloatLabel } from 'primereact/floatlabel';

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

import ConfirmacionReserva from './ConfirmacionReserva';
import '../styles/Cotizacion.css';

import '../styles/CotizacionForm.css';

import '../../Proveedores/styles/DetallesProveedores.css';

import { categorias, estados, agencias, paises, idiomas } from '../constants/options';

import { RadioButton } from 'primereact/radiobutton';

import { ProgressSpinner } from 'primereact/progressspinner';

import { ConfirmDialog } from 'primereact/confirmdialog';

import CotizacionRepository from '../../../modules/Cotizacion/repository/CotizacionRepository';

// Modal de asignación de proveedores

import { usePermissions } from '../../../contexts/PermissionsContext';



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

  const [priceDrafts, setPriceDrafts] = useState({});

  const [clientQuery, setClientQuery] = useState('');

  const [clientResults, setClientResults] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);

  const [activeIndex, setActiveIndex] = useState(0);

  // Estado del modal Asignar Proveedor

  const [provModalOpen, setProvModalOpen] = useState(false);

  const [provComponentId, setProvComponentId] = useState(null);

  const [provServiceType, setProvServiceType] = useState('');

  const [provDate, setProvDate] = useState('');

  const [provCscId, setProvCscId] = useState(null);



  // Modal para seleccionar fecha/hora de un componente

  const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);

  const [dateTimeTarget, setDateTimeTarget] = useState({ cscId: null, value: null });

  const [dateTimeDraft, setDateTimeDraft] = useState(null);



  const [loading, setLoading] = useState(false);

  const [loadingCotizacion, setLoadingCotizacion] = useState(false);

  const [loadingServices, setLoadingServices] = useState(null);

  const [visibleDialog, setVisibleDialog] = useState(false);

  const [dialogType, setDialogType] = useState(null);

  const [componentToDelete, setComponentToDelete] = useState(null);

  const [serviceToDelete, setServiceToDelete] = useState(null);



  // Helpers de fechas (usar día/hora LOCAL para evitar desfases por zona horaria)

  function toLocalDateString(date) {

    if (!date) return '';

    const d = new Date(date);

    const y = d.getFullYear();

    const m = String(d.getMonth() + 1).padStart(2, '0');

    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;

  }

  function toLocalDateTimeString(date) {

    if (!date) return null;

    const d = new Date(date);

    const y = d.getFullYear();

    const m = String(d.getMonth() + 1).padStart(2, '0');

    const day = String(d.getDate()).padStart(2, '0');

    const hh = String(d.getHours()).padStart(2, '0');

    const mm = String(d.getMinutes()).padStart(2, '0');

    const ss = String(d.getSeconds()).padStart(2, '0');

    // Sin sufijo Z: se interpreta como hora local por el backend/JS

    return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;

  }

  function fromLocalDateStringToDate(value) {

    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {

      const [y, m, d] = value.split('-').map(Number);

      return new Date(y, m - 1, d, 12, 0, 0); // mediodía local, evita desplazamientos

    }

    return new Date(value);

  }



  // Modal para buscar y agregar (servicio / componente)

  // Eliminado SelectAddModal: agregamos directamente desde el buscador principal



  const [form, setForm] = useState({

    nombreCotizacion: '',

    categoria: null,

    fechaViaje: '',

    estado: null,

    agencia: null,

    pais: null,

    idioma: null,

    utilidad: 18,

    nroPax: null,

    nroNinos: null,

    codigoReserva: '',

    observacion: ''

  });



  useEffect(() => {

    (async () => {

      if (routeId) {

        try {

          setLoadingCotizacion(true);

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

              fechaViaje: found.fechaViaje || '',

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

        } catch (e) { 

          console.error(e); 

        } finally {

          setLoadingCotizacion(false);

        }

      }

    })();

  }, [routeId]);



  const { has } = usePermissions();



  useEffect(() => {

    const id = setTimeout(async () => {

      if (clientQuery) {

        try { const res = await apiService.searchClients(clientQuery); setClientResults(res); } catch (e) { setClientResults([]); }

      } else { setClientResults([]); }

    }, 300);

    return () => clearTimeout(id);

  }, [clientQuery]);

  // Si el estado cambia a algo diferente de "Finalizado" y estamos en la pestaña de confirmación, volver a la primera pestaña

  useEffect(() => {

    if (activeIndex === 2 && form.estado !== 'Finalizado') {

      setActiveIndex(0);

    }

  }, [form.estado, activeIndex]);



  // AutoComplete completeMethod for search suggestions (PrimeReact)

  async function handleComplete(e) {

    const query = (e.query || '').trim();

    if (!cotizacionId || !query) { setSuggestions([]); return; }

    setIsSearching(true);

    try {

      const res = searchType === 'service' ? await apiService.searchServices(query) : await apiService.searchComponents(query);

      const list = Array.isArray(res) ? res.slice(0, 8).map(r => ({ ...r, label: r.name || r.componentName })) : [];

      setSuggestions(list);

    } catch {

      setSuggestions([]);

    } finally {

      setIsSearching(false);

    }

  }



  async function refreshDetalle(id) {

    try { const det = await new GetCotizacionDetalle().execute(id); setDetalle(det); } catch { }

  }



  async function onSave() {

    if (!selectedClient) { showNotification('Selecciona un cliente', 'error'); return; }

    if (!form.fechaViaje) { showNotification('Fecha de viaje requerida', 'error'); return; }

    try {

      setLoadingCotizacion(true);

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

    } catch (e) { 

      showNotification(e.message || 'Error al guardar', 'error'); 

    } finally {

      setLoadingCotizacion(false);

    }

  }



  async function onAdd() {

    if (!cotizacionId) { showNotification('Guarda la cotización primero', 'error'); return; }

    try {

      setLoading(true);

      if (searchType === 'service') {

        setLoadingServices('new');

        const item = selectedSuggestion || suggestions[0];

        if (!item) { showNotification('Selecciona un servicio', 'error'); return; }

        const added = await new AddServiceToCotizacion().execute(cotizacionId, { serviceId: item.id });

        // Optimistic: añadir el servicio devuelto sin volver a cargar todo

        setDetalle(prev => {

          if (!prev) return prev;

          const servicios = [ ...(prev.servicios || []), added ];

          return { ...prev, servicios };

        });

        setSearchQuery(''); setSuggestions([]); setSelectedSuggestion(null);

      } else {

        if (!selectedCS) { showNotification('Selecciona un servicio en la lista para agregar componentes', 'error'); return; }

        setLoadingServices(selectedCS);

        const item = selectedSuggestion; // usar solo selección explícita

        if (item && item.id) {

          const updated = await new AddComponentsToCotizacionService().execute(selectedCS, [item.id]);

          // Optimistic: reemplazar el servicio actualizado

          setDetalle(prev => {

            if (!prev) return prev;

            const servicios = (prev.servicios || []).map(s => s.id === updated.id ? updated : s);

            return { ...prev, servicios };

          });

        } else {

          // Crear componente extra con el texto buscado

          const nombre = (searchQuery || '').trim();

          if (!nombre) { showNotification('Escribe el nombre del componente', 'error'); return; }

          const csc = await new AddExtraComponentToCotizacionService().execute(selectedCS, { nombre });

          // Optimistic: agregar el nuevo componente extra a la lista

          setDetalle(prev => {

            if (!prev) return prev;

            const servicios = (prev.servicios || []).map(s => s.id === selectedCS ? { ...s, componentes: [ ...(s.componentes || []), csc ] } : s);

            return { ...prev, servicios };

          });

        }

        setSearchQuery(''); setSuggestions([]); setSelectedSuggestion(null);

      }

    } catch (e) { 

      showNotification(e.message || 'No se pudo agregar', 'error'); 

    } finally {

      setLoadingServices(null);

      setLoading(false);

    }

  }



  // Nota: totalServicios es la suma de precios de todos los componentes seleccionados.

  // El costo por pasajero se calcula en base a nroPax (adultos), pero para asignación de proveedor

  // multiplicamos el costo unitario por el total de pasajeros (adultos + niños).

  const costoPorPasajero = (detalle?.servicios || []).reduce((acc, s) => acc + (s.componentes || []).reduce((a, c) => a + (Number(c.precio) || 0), 0), 0);

  const totalPaxResumen = (Number(form.nroPax) || 0) + (Number(form.nroNinos) || 0);

  const precioUtilidad = totalPaxResumen * costoPorPasajero * (Number(form.utilidad || 0) / 100);

  const costoFinal = totalPaxResumen * costoPorPasajero;

  const precioVenta = costoFinal + precioUtilidad;



  // Handlers para notas y precios (servicio y componente)

  // Se quitó el precio a nivel servicio según requerimiento



  // Abrir modal y pasar props

  function handleOpenAsignarProveedor(ci, service) {

    if (!ci?.component?.id) {

      showNotification('Este componente no está vinculado a un registro de Component', 'error');

      return;

    }

    // Validar fecha-hora programada en la nota del componente o futura propiedad; usamos ci.scheduledAt si existe

    if (!ci.scheduledAt) {

      showNotification('Asigna fecha y hora del componente antes de elegir proveedor', 'error');

      return;

    }

    setProvComponentId(ci.component.id);

  setProvServiceType(ci.component?.serviceType || service?.service?.name || '-');

    setProvDate(ci.scheduledAt || '');

    setProvCscId(ci.id);

    setProvModalOpen(true);

  }



  function formatFechaHoraCorta(iso) {

    if (!iso) return '';

    try {

      // Parseo robusto: si viene 'YYYY-MM-DD', crear como fecha local; si trae hora, confiar en Date

      let d;

      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {

        const [y, m, day] = iso.split('-').map(Number);

        d = new Date(y, m - 1, day, 12, 0, 0);

      } else {

        d = new Date(iso);

      }

      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      return `${dias[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} ${meses[d.getMonth()]} ${String(d.getFullYear()).slice(-2)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

    } catch { return iso; }

  }



  async function openDateTimePicker(ci) {

    setDateTimeTarget({ cscId: ci.id, value: ci.scheduledAt || null });

    setDateTimeDraft(ci.scheduledAt ? new Date(ci.scheduledAt) : new Date());

    setDateTimeModalOpen(true);

  }



  // Guardar sólo cuando el usuario presione Guardar en el modal

  async function handleDateTimeSave() {

    try {

      // Guardar como fecha-hora LOCAL para evitar que el backend lo interprete en UTC

      const iso = toLocalDateTimeString(dateTimeDraft);

      await new UpdateCotizacionServiceComponent().execute(dateTimeTarget.cscId, { scheduledAt: iso });

      // Optimistic: reflejar cambio en la UI sin recargar todo

      setDetalle(prev => {

        if (!prev) return prev;

        const servicios = (prev.servicios || []).map(s => ({

          ...s,

          componentes: (s.componentes || []).map(c => c.id === dateTimeTarget.cscId ? { ...c, scheduledAt: iso } : c)

        }));

        return { ...prev, servicios };

      });

      setDateTimeModalOpen(false);

      showNotification('Fecha y hora guardadas', 'success');

    } catch (err) {

      showNotification(err.message || 'No se pudo guardar fecha/hora', 'error');

    }

  }



  async function handleNoteSave(componentItemId, value) {

    try {

      const trimmed = (value ?? '').trim();

      const payload = { nota: trimmed.length ? trimmed : null };

      await new UpdateCotizacionServiceComponent().execute(componentItemId, payload);

      setDetalle((prev) => {

        if (!prev) return prev;

        const servicios = (prev.servicios || []).map(s => ({

          ...s,

          componentes: (s.componentes || []).map(c => c.id === componentItemId ? { ...c, nota: payload.nota || '' } : c)

        }));

        return { ...prev, servicios };

      });

    } catch (e) {

      showNotification(e.message || 'No se pudo guardar la nota', 'error');

    }

  }



  // Celda de Nota con estado local y debounce para mejor performance al escribir

  const NoteCell = React.memo(function NoteCell({ cscId, initial }) {

    const [val, setVal] = useState(initial || '');

    const tRef = React.useRef(null);

    useEffect(() => { setVal(initial || ''); }, [initial, cscId]);

    const schedule = (next) => {

      if (tRef.current) clearTimeout(tRef.current);

      tRef.current = setTimeout(() => { void handleNoteSave(cscId, next); }, 2000);

    };

    return (

      <div

        onClick={(e) => e.stopPropagation()}

        onMouseDown={(e) => e.stopPropagation()}

        onMouseUp={(e) => e.stopPropagation()}

        style={{ minWidth: 220 }}

      >

        <InputText

          value={val}

          onChange={(e) => { const v = e.target.value; setVal(v); schedule(v); }}

          onKeyDown={(e) => e.stopPropagation()}

          onKeyUp={(e) => e.stopPropagation()}

          onFocus={(e) => e.stopPropagation()}

          onBlur={() => handleNoteSave(cscId, val)}

          placeholder="Escribe una nota..."

          className="p-inputtext-sm"

          style={{ width: '100%' }}

        />

      </div>

    );

  });



  const updateCotizacionServiceComponent = new UpdateCotizacionServiceComponent();



  async function handleComponentPriceBlur(componentItemId, value) {

    const precio = Number(value);

    if (Number.isNaN(precio)) { showNotification('Precio inválido', 'error'); return; }

    try {

      await updateCotizacionServiceComponent.execute(componentItemId, { precio });

      setDetalle(prev => {

        if (!prev) return prev;

        const servicios = (prev.servicios || []).map(s => ({

          ...s,

          componentes: (s.componentes || []).map(c =>

            c.id === componentItemId ? { ...c, precio } : c

          )

        }));

        return { ...prev, servicios };

      });

      setPriceDrafts(d => { const nd = { ...d }; delete nd[componentItemId]; return nd; });

    } catch (e) { showNotification(e.message || 'No se pudo guardar el precio', 'error'); }

  }



  useEffect(() => {

    if (cotizacionId) {

      const payload = { 

        costo: costoFinal, 

        precioUtilidad: precioUtilidad, 

        precioVenta: precioVenta ,

        saldo: precioVenta - (Number(detalle?.adelanto) || 0)

      };

      new UpdateCotizacion().execute(cotizacionId, payload);

    }

  }, [costoFinal, precioUtilidad, precioVenta]);



  



  const handleDeleteService = async (serviceId) => {

    try {

      setLoadingServices(serviceId);

      await new DeleteCotizacionService().execute(serviceId);

      setDetalle(prev => {

        if (!prev) return prev;

        const servicios = (prev.servicios || []).filter(x => x.id !== serviceId);

        return { ...prev, servicios };

      });

    } catch (e) {

      showNotification(e.message || 'No se pudo eliminar el servicio', 'error');

    } finally {

      setLoadingServices(null);

      setServiceToDelete(null);

      setDialogType('');

      setVisibleDialog(false);

    }

  }



  const handleDeleteComponent = async (componentItemId, serviceId) => {

    try {

      setLoadingServices(serviceId);

      await new DeleteCotizacionServiceComponent().execute(componentItemId).then(() => {

        setDetalle(prev => {

          if (!prev) return prev;

          const servicios = (prev.servicios || []).map(svc => ({

            ...svc,

          componentes: (svc.componentes || []).filter(c => c.id !== componentItemId)

        }));

        return { ...prev, servicios };

      });

    });

    } catch (e) {

      showNotification(e.message || 'No se pudo eliminar el componente', 'error');

    } finally {

      setLoadingServices(null);

      setComponentToDelete(null);

      setDialogType('');

      setVisibleDialog(false);

    }

  }



  const reject = () => {

      setComponentToDelete(null);

      setServiceToDelete(null);

      setDialogType('');

      setVisibleDialog(false);

  };



  // Items for TabMenu to mirror Proveedores tabs

  const items = [

    { label: 'Cotización' },

    { label: 'Nombre de pasajeros', disabled: !cotizacionId },

    // Solo mostrar 'Confirmación de reserva' si el estado es 'Finalizado'
    ...(form.estado === 'Finalizado' ? [{ label: 'Confirmación de reserva', disabled: !cotizacionId }] : []),
  ];



  const iconComponents = {

     'Transporte': 'pi pi-car',

     'Boleto': 'pi pi-map',

     'Ticket': 'pi pi-ticket',

     'Tour': 'pi pi-globe',

     'Hotel': 'pi pi-building',

     'Guia': 'pi pi-user-plus',

     'Restaurant': 'pi pi-shop',

  };





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

  

        {loadingCotizacion ? (

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '2rem', minHeight: 120 }}>

                <ProgressSpinner />

            </div>

        ) : (

          <div className="form-card">

            <div className="row">

              <div className="label">Año: <b>{anio}</b></div>

              <div className="label">File: <b>{numeroFile || ''}</b></div>

              <div className="row-spacer"></div>

              <button className="link-btn right-btn" onClick={onSave} disabled={cotizacionId ? !has('COTIZACION','EDIT') : !has('COTIZACION','CREATE')}>{cotizacionId ? 'Actualizar' : 'Guardar para continuar'}</button>

            </div>



            <div className="form-grid row1-grid">

              <div>

                <div className="search-select client-search-wrap">

                  <FloatLabel>

                    <InputText id="cliente" value={clientQuery} onChange={e => { setClientQuery(e.target.value); setSelectedClient(null); }} />

                    <label htmlFor="cliente">Nombre del cliente</label>

                  </FloatLabel>

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

                <FloatLabel>

                  <Dropdown inputId="categoria" value={form.categoria} options={categorias} onChange={e => setForm(f => ({ ...f, categoria: e.value }))} />

                  <label htmlFor="categoria">Categoría</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <Calendar

                    inputId="fechaViaje"

                    value={form.fechaViaje ? fromLocalDateStringToDate(form.fechaViaje) : null}

                    onChange={e => setForm(f => ({ ...f, fechaViaje: e.value ? toLocalDateString(e.value) : '' }))}

                    dateFormat="D dd M y"

                    locale="es"

                  />

                  <label htmlFor="fechaViaje">Fecha de viaje</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <Dropdown inputId="estado" value={form.estado} options={estados} onChange={e => setForm(f => ({ ...f, estado: e.value }))} />

                  <label htmlFor="estado">Estado</label>

                </FloatLabel>

              </div>

            </div>



            <div className="form-grid row2-grid">

              <div>

                <FloatLabel>

                  <InputText id="nombreCotizacion" value={form.nombreCotizacion} onChange={e => setForm(f => ({ ...f, nombreCotizacion: e.target.value }))} />

                  <label htmlFor="nombreCotizacion">Nombre de cotización</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <Dropdown inputId="agencia" value={form.agencia} options={agencias} onChange={e => setForm(f => ({ ...f, agencia: e.value }))} />

                  <label htmlFor="agencia">Agencia</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputText id="codigoReserva" value={form.codigoReserva} onChange={e => setForm(f => ({ ...f, codigoReserva: e.target.value }))} />

                  <label htmlFor="codigoReserva">Código de reserva</label>

                </FloatLabel>

              </div>

            </div>



            <div className="form-grid row3-grid">

              <div>

                <FloatLabel>

                  <Dropdown inputId="pais" value={form.pais} options={paises} onChange={e => setForm(f => ({ ...f, pais: e.value }))} />

                  <label htmlFor="pais">País</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <Dropdown inputId="idioma" value={form.idioma} options={idiomas} onChange={e => setForm(f => ({ ...f, idioma: e.value }))} />

                  <label htmlFor="idioma">Idioma</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputText id="nroPax" type="number" min="1" value={form.nroPax} onChange={e => setForm(f => ({ ...f, nroPax: e.target.value }))} />

                  <label htmlFor="nroPax">Nro. Paxs</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputText id="nroNinos" type="number" min="0" value={form.nroNinos} onChange={e => setForm(f => ({ ...f, nroNinos: e.target.value }))} />

                  <label htmlFor="nroNinos">Nro Niños(as)</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputText id="utilidad" type="number" min="0" max="100" value={form.utilidad} onChange={e => setForm(f => ({ ...f, utilidad: e.target.value }))} />

                  <label htmlFor="utilidad">% de utilidad</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputText id="observacion" value={form.observacion} onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} />

                  <label htmlFor="observacion">Observación</label>

                </FloatLabel>

              </div>

            </div>

          </div>

        )}



          <div className="center">CONSTRUIR EXPERIENCIAS</div>



          {cotizacionId && (

            <div className="form-card" style={{ marginTop: 16 }}>

              {detalle?.servicios?.length > 0 ? (

                <div>

                  {detalle.servicios.map(s => (

                    <div key={s.id} className={`cotz-service-card ${selectedCS === s.id ? 'selected' : ''}`} onClick={() => setSelectedCS(s.id)}>

                      {loadingServices === s.id ? (

                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}>

                              <ProgressSpinner />

                          </div>

                      ) : (

                      <>

                        <div className="cotz-service-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                            {has('COTIZACION','DELETE') && (

                              <i className="pi pi-trash" style={{ cursor: 'pointer'}} aria-label="Eliminar servicio"

                                onClick={(e) => {

                                  if (loading) return;

                                  e.stopPropagation();

                                  setDialogType('service');

                                  setServiceToDelete(s.id);

                                  setVisibleDialog(true);

                                }} 

                              />

                            )}

                            <div className="cotz-service-title">{s.service?.name}</div>

                          </div>

                          {selectedCS === s.id && <span className="cotz-select-hint">Seleccionado para agregar componentes</span>}

                        </div>



                        <div className="componentes-list">

                          {(s.componentes || [])

                          .slice()

                          .sort((a, b) => {

                            const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;

                            const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;

                            return dateA - dateB;

                          })

                          .map(rowData => (

                            <div key={rowData.id} className="componente-card" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>

                              

                              <div style={{ display: 'flex', alignItems: 'center', width: '25%' }}>

                                {has('COTIZACION','DELETE') && (

                                  <i style={{ width: '1.5rem', marginLeft: '2rem', cursor: 'pointer' }} className="pi pi-trash" 

                                    onClick={(e) => {

                                      if (loading) return;

                                      e.stopPropagation();

                                      setDialogType('component');

                                      setComponentToDelete({ cscId: rowData.id, serviceId: s.id });

                                      setVisibleDialog(true);

                                    }}

                                  />

                                )}

                                <div style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); openDateTimePicker(rowData); }}>

                                  {rowData.scheduledAt

                                    ? <span className="muted">{formatFechaHoraCorta(rowData.scheduledAt)}</span>

                                    : <span className="muted">Fecha y hora</span>

                                  }

                                </div>

                              </div>



                              <div style={{ fontWeight: 600, width: '40%'}}>

                                <i className={iconComponents[rowData.component?.serviceType] || 'pi pi-cog'} style={{ marginRight: '0.5rem' }} />{rowData.component?.componentName || rowData.nombreExtra}

                                <div style={{ marginLeft: '1.5rem', display: 'flex', alignItems: 'center', marginTop: '0.25rem', cursor: 'pointer', width: 'fit-content' }} onClick={(e) => { e.stopPropagation(); handleOpenAsignarProveedor(rowData, s); }}>

                                  {rowData.proveedor?.name

                                    ? <span className="muted" style={{ fontSize: 12 }}>{rowData.proveedor.name}</span>

                                    : <span className="muted" style={{ fontSize: 12 }} onClick={(e) => { e.stopPropagation(); handleOpenAsignarProveedor(rowData, s); }}>Asignar proveedor</span>

                                  }

                                </div>

                              

                              

                              </div>

                              

                              

                              <div style={{ width: '35%' }}>

                                <NoteCell cscId={rowData.id} initial={rowData.nota || ''} />

                              </div>

                              <div>

                                <InputNumber inputClassName="price-input" value={priceDrafts[rowData.id] ?? Number(rowData.precio || 0)} mode="decimal" minFractionDigits={2} maxFractionDigits={2}

                                  onValueChange={(e) => setPriceDrafts(d => ({ ...d, [rowData.id]: e.value }))}

                                  onKeyUp={(e) => e.stopPropagation()}

                                  onKeyDown={(e) => e.stopPropagation()}

                                  onBlur={(e) => handleComponentPriceBlur(rowData.id, priceDrafts[rowData.id] ?? e.target.value)}

                                />

                              </div>

                            </div>

                          ))}

                        </div>

                      </>

                      )

                      }

                    </div>

                  ))}

                </div>

              ) : (

                <div style={{ color: '#8891a6' }}>Aún no hay servicios agregados</div>

              )}



              <div className="cotz-builder">

                <div className='cotz-builder-left'>

                  <div className="cotz-searchline" style={{ marginBottom: '1rem' }}>

                    <label htmlFor="service">Buscar servicio</label>

                    <RadioButton

                        inputId="service"

                        name="serviceType"

                        value="service"

                        onChange={() => 

                          { setSearchType('service');

                            setSearchQuery(''); 

                            setSelectedSuggestion(null); 

                            setSuggestions([]); 

                          }}

                        checked={searchType === 'service'}

                    /> 

                    <label htmlFor="gender-f">Buscar componente</label>

                    <RadioButton

                        inputId="component"

                        name="serviceType"

                        value="component"

                        onChange={() => 

                          { setSearchType('component');

                            setSearchQuery(''); 

                            setSelectedSuggestion(null); 

                            setSuggestions([]); 

                          }}

                        checked={searchType === 'component'}

                    />

                  

                  </div>

                  <div className="cotz-searchbar" style={{ gap: 8 }}>

                    <AutoComplete

                      value={searchQuery}

                      suggestions={suggestions}

                      completeMethod={handleComplete}

                      field="label"

                      placeholder="Ingresar criterio de búsqueda"

                      onChange={(e) => { setSearchQuery(e.value); setSelectedSuggestion(null); }}

                      onSelect={(e) => { setSelectedSuggestion(e.value); setSearchQuery(e.value?.label || ''); }}

                      forceSelection={false}

                      dropdown

                      style={{ width: '60%', marginRight: 8 }}

                      inputClassName="p-inputtext"

                      disabled={loading || loadingCotizacion}

                    />

                    <Button label="Agregar" className="p-button-outlined" onClick={onAdd} disabled={loading || loadingCotizacion || !has('COTIZACION','CREATE')} />

                    {isSearching && <span className="search-status">Buscando…</span>}

                  </div>

                </div>

                <div className="totals-card">

                  <div className="totals-row">

                    <span>Costo por pasajero</span><span>{costoPorPasajero.toFixed(2)}</span>

                  </div>

                  <div className="totals-row">

                    <span>Utilidad {Number(form.utilidad || 0)}%</span><span>{Number(precioUtilidad).toFixed(2)}</span>

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


      {activeIndex === 2 && cotizacionId && form.estado === 'Finalizado' && (
        <ConfirmacionReserva
          cotizacionId={cotizacionId}
          cotizacionData={detalle}
        />
      )}
      <AssignProveedorModal

        visible={provModalOpen}

        onHide={() => setProvModalOpen(false)}

        cscId={provCscId}

        componentId={provComponentId}

  // Total de pasajeros para costos de proveedor: adultos + niños

  pax={(Number(form.nroPax) || 0) + (Number(form.nroNinos) || 0) || 1}

        serviceType={provServiceType}

        date={provDate}

        onAssigned={({ cscId, proveedor, precio }) => setDetalle(prev => {

          if (!prev) return prev;

          const servicios = (prev.servicios || []).map(s => ({

            ...s,

            componentes: (s.componentes || []).map(c => c.id === cscId ? { ...c, proveedor, precio } : c)

          }));

          return { ...prev, servicios };

        })}

      />



      <ConfirmDialog

          group="declarative"  

          visible={visibleDialog} 

          onHide={() => setVisibleDialog(false)} 

          message={dialogType === 'component' ? "¿Estás seguro de que deseas eliminar este componente del servicio?" 

              : dialogType === 'service' ? "¿Estás seguro de que deseas eliminar este servicio de la cotización?" : ''}

          header="Confirmación" 

          icon="pi pi-exclamation-triangle" 

          accept={() => {

              if (dialogType === 'component' && componentToDelete) handleDeleteComponent(componentToDelete.cscId, componentToDelete.serviceId);

              else if (dialogType === 'service' && serviceToDelete) handleDeleteService(serviceToDelete);

          }}

          reject={() => reject()} 

          acceptLabel="Si"

          rejectLabel="No"

      />



  {/* SelectAddModal eliminado: agregamos directamente desde el buscador principal */}



      {/* Modal para seleccionar fecha/hora del componente */}

      <Dialog

        header="Seleccionar fecha y hora"

        visible={dateTimeModalOpen}

        modal

        onHide={() => setDateTimeModalOpen(false)}

        footer={

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>

            <Button label="Cancelar" className="p-button-text" onClick={() => setDateTimeModalOpen(false)} />

            <Button label="Guardar" icon="pi pi-check" onClick={handleDateTimeSave} />

          </div>

        }

      >

        <PrimeCalendar

          value={dateTimeDraft}

          onChange={(e) => setDateTimeDraft(e.value)}

          showTime

          hourFormat="24"

          inline

          style={{ width: '100%' }}

        />

      </Dialog>

    </div>

  );

}
