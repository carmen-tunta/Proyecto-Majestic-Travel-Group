import React, { use, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { TabMenu } from 'primereact/tabmenu';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

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

  const [manualDateTimeInput, setManualDateTimeInput] = useState('');



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

    fechaLlegada: '',

    fechaSalida: '',

    estado: null,

    agencia: null,

    pais: null,

    idioma: null,

    utilidad: 18,

    nroPax: null,

    nroAdultos: null,

    nroNinos: null,

    nroBebes: null,

    codigoReserva: '',

    lugarRecojo: '',

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

              fechaLlegada: found.fechaLlegada || '',

              fechaSalida: found.fechaSalida || '',

              estado: found.estado,

              agencia: found.agencia,

              pais: found.pais,

              idioma: found.idioma,

              utilidad: found.utilidad,

              nroPax: found.nroPax,

              nroAdultos: found.nroAdultos,

              nroNinos: found.nroNinos,

              nroBebes: found.nroBebes,

              codigoReserva: found.codigoReserva,

              lugarRecojo: found.lugarRecojo || '',

              observacion: found.comentario || ''

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

  // Si el estado cambia a algo diferente de "Finalizado" o "Cotización enviada" y estamos en la pestaña de confirmación, volver a la primera pestaña
  useEffect(() => {

    if (activeIndex === 2 && (form.estado !== 'Finalizado' && form.estado !== 'Cotización enviada')) {

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

        fechaLlegada: form.fechaLlegada || undefined,

        fechaSalida: form.fechaSalida || undefined,

        estado: form.estado,

        agencia: form.agencia,

        pais: form.pais,

        idioma: form.idioma,

        nroPax: Number(form.nroPax),

        nroAdultos: Number(form.nroAdultos) || 0,

        nroNinos: Number(form.nroNinos) || 0,

        nroBebes: Number(form.nroBebes) || 0,

        lugarRecojo: form.lugarRecojo || undefined,

        comentario: form.observacion || undefined,

        anio,

      };

      const saved = cotizacionId ? await new UpdateCotizacion().execute(cotizacionId, payload) : await new CreateCotizacion().execute(payload);

      setNumeroFile(saved.numeroFile);

      const id = saved.id ?? saved.cotizacionId ?? cotizacionId;

      setCotizacionId(id);

      await refreshDetalle(id);

      showNotification(cotizacionId ? 'Cotización actualizada' : 'Cotización guardada', 'success');



      // Si el estado es "Cotización enviada", activar el tab de Confirmación de reserva
      if (form.estado === 'Cotización enviada') {
        setActiveIndex(2);
      } else if (!cotizacionId) {
        // Si es una nueva cotización, cambiar a la pestaña de pasajeros
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



  // Nota: separamos componentes compartidos (precio por pasajero) y privados (precio por servicio)

  // para calcular correctamente el costo base y su distribución por pasajero.

  const totalesComponentes = (detalle?.servicios || []).reduce((acc, servicio) => {

    (servicio.componentes || []).forEach((comp) => {

      const precio = Number(comp.precio) || 0;

      if (comp.isShared === false || comp.isShared === 0 || comp.isShared === '0') {

        acc.privados += precio;

      } else {

        acc.compartidos += precio;

      }

    });

    return acc;

  }, { compartidos: 0, privados: 0 });

  const totalPaxResumen = Number(form.nroPax) || 0;

  const costoBase = (totalesComponentes.compartidos * totalPaxResumen) + totalesComponentes.privados;

  const costoPorPasajero = totalPaxResumen > 0

    ? costoBase / totalPaxResumen

    : totalesComponentes.compartidos + totalesComponentes.privados;

  // Cálculo simplificado: costo total es la suma de todos los precios de componentes
  const costoTotal = (detalle?.servicios || []).reduce((acc, servicio) => {
    (servicio.componentes || []).forEach((comp) => {
      acc += Number(comp.precio) || 0;
    });
    return acc;
  }, 0);
  const precioUtilidad = costoTotal * (Number(form.utilidad || 0) / 100);
  const precioVenta = costoTotal + precioUtilidad;



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



  // Formatear fecha/hora a string legible (dd/mm/yyyy HH:mm)
  function formatDateTimeToString(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // Formatear número con punto como separador decimal
  function formatNumberWithDot(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return '0.00';
    return Number(value).toFixed(decimals).replace(',', '.');
  }

  // Formatear automáticamente mientras el usuario escribe solo números
  // Maneja mejor el cursor y permite borrar carácter por carácter
  // Valida límites: días <= 31, meses <= 12, horas <= 23, minutos <= 59
  function formatDateTimeInput(value, previousValue, cursorPosition) {
    // Si el usuario está borrando (valor anterior es más largo), permitir borrar
    if (previousValue && value.length < previousValue.length) {
      // Remover caracteres no numéricos del valor actual
      const currentNumbers = value.replace(/\D/g, '');
      const previousNumbers = previousValue.replace(/\D/g, '');
      
      // Si se borró un número, mantener el formato pero sin ese número
      if (currentNumbers.length < previousNumbers.length) {
        return formatNumbersToDate(currentNumbers);
      }
    }
    
    // Remover todo excepto números
    let numbers = value.replace(/\D/g, '');
    
    // Validar y limitar valores mientras se escribe
    numbers = validateAndLimitNumbers(numbers);
    
    return formatNumbersToDate(numbers);
  }

  // Validar y limitar números según su posición
  function validateAndLimitNumbers(numbers) {
    if (numbers.length === 0) return '';
    
    let validated = numbers.split('');
    
    // Día (primeros 2 dígitos) - máximo 31
    if (validated.length >= 1) {
      const day1 = parseInt(validated[0]);
      if (day1 > 3) {
        validated[0] = '3';
      }
    }
    
    if (validated.length >= 2) {
      const day = parseInt(validated[0] + validated[1]);
      if (day > 31) {
        validated[0] = '3';
        validated[1] = '1';
      }
    }
    
    // Mes (dígitos 3-4) - máximo 12
    if (validated.length >= 3) {
      const month1 = parseInt(validated[2]);
      if (month1 > 1) {
        validated[2] = '1';
      }
    }
    
    if (validated.length >= 4) {
      const month = parseInt(validated[2] + validated[3]);
      if (month > 12) {
        validated[2] = '1';
        validated[3] = '2';
      }
    }
    
    // Hora (dígitos 9-10) - máximo 23
    if (validated.length >= 9) {
      const hour1 = parseInt(validated[8]);
      if (hour1 > 2) {
        validated[8] = '2';
      }
    }
    
    if (validated.length >= 10) {
      const hour = parseInt(validated[8] + validated[9]);
      if (hour > 23) {
        validated[8] = '2';
        validated[9] = '3';
      }
    }
    
    // Minutos (dígitos 11-12) - máximo 59
    if (validated.length >= 11) {
      const minute1 = parseInt(validated[10]);
      if (minute1 > 5) {
        validated[10] = '5';
      }
    }
    
    if (validated.length >= 12) {
      const minutes = parseInt(validated[10] + validated[11]);
      if (minutes > 59) {
        validated[10] = '5';
        validated[11] = '9';
      }
    }
    
    return validated.join('');
  }

  // Función auxiliar para formatear números a fecha
  function formatNumbersToDate(numbers) {
    let formatted = '';
    
    // Día (2 dígitos)
    if (numbers.length >= 2) {
      formatted += numbers.substring(0, 2);
    } else if (numbers.length > 0) {
      formatted += numbers.substring(0, 1);
    }
    if (numbers.length > 0) formatted += '/';
    
    // Mes (2 dígitos)
    if (numbers.length >= 4) {
      formatted += numbers.substring(2, 4);
    } else if (numbers.length > 2) {
      formatted += numbers.substring(2, 3);
    }
    if (numbers.length > 2) formatted += '/';
    
    // Año (4 dígitos)
    if (numbers.length >= 8) {
      formatted += numbers.substring(4, 8);
    } else if (numbers.length > 4) {
      formatted += numbers.substring(4);
    }
    if (numbers.length > 4) formatted += ' ';
    
    // Hora (2 dígitos)
    if (numbers.length >= 10) {
      formatted += numbers.substring(8, 10);
    } else if (numbers.length > 8) {
      formatted += numbers.substring(8, 9);
    }
    if (numbers.length > 8) formatted += ':';
    
    // Minutos (2 dígitos)
    if (numbers.length >= 12) {
      formatted += numbers.substring(10, 12);
    } else if (numbers.length > 10) {
      formatted += numbers.substring(10, 11);
    }
    
    return formatted;
  }

  // Parsear el input formateado automáticamente a Date
  function parseFormattedDateTimeInput(value) {
    if (!value || !value.trim()) return null;
    
    // Remover espacios y obtener solo números
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length < 8) return null; // Necesitamos al menos día, mes y año
    
    const day = parseInt(numbers.substring(0, 2), 10);
    const month = parseInt(numbers.substring(2, 4), 10);
    const year = parseInt(numbers.substring(4, 8), 10);
    const hours = numbers.length >= 10 ? parseInt(numbers.substring(8, 10), 10) : 0;
    const minutes = numbers.length >= 12 ? parseInt(numbers.substring(10, 12), 10) : 0;
    
    // Validar valores
    if (isNaN(day) || day < 1 || day > 31) return null;
    if (isNaN(month) || month < 1 || month > 12) return null;
    if (isNaN(year) || year < 1900 || year > 2100) return null;
    if (isNaN(hours) || hours > 23) return null;
    if (isNaN(minutes) || minutes > 59) return null;
    
    return new Date(year, month - 1, day, hours, minutes);
  }

  // Parsear string manual a Date (acepta formatos: dd/mm/yyyy HH:mm, dd/mm/yyyy, etc.)
  function parseDateTimeString(value) {
    if (!value || !value.trim()) return null;
    
    const trimmed = value.trim();
    
    // Formato: dd/mm/yyyy HH:mm
    const match1 = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})$/);
    if (match1) {
      const [, day, month, year, hours, minutes] = match1.map(Number);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return new Date(year, month - 1, day, hours || 0, minutes || 0);
      }
    }
    
    // Formato: dd/mm/yyyy
    const match2 = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match2) {
      const [, day, month, year] = match2.map(Number);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return new Date(year, month - 1, day, 0, 0);
      }
    }
    
    // Formato: yyyy-mm-dd HH:mm
    const match3 = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/);
    if (match3) {
      const [, year, month, day, hours, minutes] = match3.map(Number);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return new Date(year, month - 1, day, hours || 0, minutes || 0);
      }
    }
    
    // Formato: yyyy-mm-dd
    const match4 = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match4) {
      const [, year, month, day] = match4.map(Number);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return new Date(year, month - 1, day, 0, 0);
      }
    }
    
    // Intentar parsear como Date nativo
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    return null;
  }

  async function openDateTimePicker(ci) {

    setDateTimeTarget({ cscId: ci.id, value: ci.scheduledAt || null });

    // Solo establecer fecha/hora si ya existe una fecha programada
    if (ci.scheduledAt) {
      const initialDate = new Date(ci.scheduledAt);
      setDateTimeDraft(initialDate);
      setManualDateTimeInput(formatDateTimeToString(initialDate));
    } else {
      // Si no hay fecha, dejar vacío
      setDateTimeDraft(null);
      setManualDateTimeInput('');
    }

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

        costo: costoTotal, 

        precioUtilidad: precioUtilidad, 

        precioVenta: precioVenta ,

        saldo: precioVenta - (Number(detalle?.adelanto) || 0)

      };

      new UpdateCotizacion().execute(cotizacionId, payload);

    }

  }, [costoTotal, precioUtilidad, precioVenta]);



  



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
    ...((form.estado === 'Finalizado' || form.estado === 'Cotización enviada') ? [{ label: 'Confirmación de reserva', disabled: !cotizacionId }] : []),
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

                  <label htmlFor="fechaViaje">Fecha de Inicio del servicio</label>

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

                  <label htmlFor="agencia">Origen</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputText id="codigoReserva" value={form.codigoReserva} onChange={e => setForm(f => ({ ...f, codigoReserva: e.target.value }))} />

                  <label htmlFor="codigoReserva">Código de reserva</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputText id="lugarRecojo" value={form.lugarRecojo} onChange={e => setForm(f => ({ ...f, lugarRecojo: e.target.value }))} />

                  <label htmlFor="lugarRecojo">Lugar de recojo</label>

                </FloatLabel>

              </div>

            </div>



            <div className="form-grid row3-grid">

              <div>

                <FloatLabel>

                  <Dropdown filter inputId="pais" value={form.pais} options={paises} onChange={e => setForm(f => ({ ...f, pais: e.value }))} />

                  <label htmlFor="pais">Nacionalidad</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <Dropdown inputId="idioma" value={form.idioma} options={idiomas} onChange={e => setForm(f => ({ ...f, idioma: e.value }))} />

                  <label htmlFor="idioma">Idioma del tour</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputNumber 
                    id="nroPax" 
                    value={form.nroPax} 
                    onValueChange={e => setForm(f => ({ ...f, nroPax: e.value }))} 
                    min={1}
                    mode="decimal"
                    minFractionDigits={0}
                    maxFractionDigits={0}
                  />

                  <label htmlFor="nroPax">N° Pax</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputNumber 
                    id="nroAdultos" 
                    value={form.nroAdultos} 
                    onValueChange={e => setForm(f => ({ ...f, nroAdultos: e.value }))} 
                    min={0}
                    mode="decimal"
                    minFractionDigits={0}
                    maxFractionDigits={0}
                  />

                  <label htmlFor="nroAdultos">N° adultos</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputNumber 
                    id="nroNinos" 
                    value={form.nroNinos} 
                    onValueChange={e => setForm(f => ({ ...f, nroNinos: e.value }))} 
                    min={0}
                    mode="decimal"
                    minFractionDigits={0}
                    maxFractionDigits={0}
                  />

                  <label htmlFor="nroNinos">N° niños(as)</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputNumber 
                    id="nroBebes" 
                    value={form.nroBebes} 
                    onValueChange={e => setForm(f => ({ ...f, nroBebes: e.value }))} 
                    min={0}
                    mode="decimal"
                    minFractionDigits={0}
                    maxFractionDigits={0}
                  />

                  <label htmlFor="nroBebes">Nº bebés</label>

                </FloatLabel>

              </div>

              <div>

                <FloatLabel>

                  <InputText id="utilidad" type="number" min="0" max="100" value={form.utilidad} onChange={e => setForm(f => ({ ...f, utilidad: e.target.value }))} />

                  <label htmlFor="utilidad">% de utilidad</label>

                </FloatLabel>

              </div>

            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>

              <div>

                <FloatLabel>

                  <InputTextarea 
                    id="observacion" 
                    value={form.observacion} 
                    onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} 
                    rows={1}
                    autoResize
                    style={{ width: '100%' }}
                  />

                  <label htmlFor="observacion">Comentario o Nota</label>

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

                                <InputNumber inputClassName="price-input" value={priceDrafts[rowData.id] ?? Number(rowData.precio || 0)} mode="decimal" minFractionDigits={2} maxFractionDigits={2} locale="en-US"

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

                    <span>Costo total</span><span>{formatNumberWithDot(costoTotal, 2)}</span>

                  </div>

                  <div className="totals-row">

                    <span>Utilidad {Number(form.utilidad || 0)}%</span><span>{formatNumberWithDot(precioUtilidad, 2)}</span>

                  </div>

                  <div className="totals-row bold">

                    <span>Precio de venta</span><span>{formatNumberWithDot(precioVenta, 2)}</span>

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


      {activeIndex === 2 && cotizacionId && (form.estado === 'Finalizado' || form.estado === 'Cotización enviada') && (
        <ConfirmacionReserva
          cotizacionId={cotizacionId}
          cotizacionData={detalle ? { ...detalle, estado: form.estado } : null}
        />
      )}
      <AssignProveedorModal

        visible={provModalOpen}

        onHide={() => setProvModalOpen(false)}

        cscId={provCscId}

        componentId={provComponentId}

  // Total de pasajeros para costos de proveedor

  pax={Number(form.nroPax) || 1}

        serviceType={provServiceType}

        date={provDate}

        onAssigned={({ cscId, proveedor, precio, isShared }) => setDetalle(prev => {

          if (!prev) return prev;

          const servicios = (prev.servicios || []).map(s => ({

            ...s,

            componentes: (s.componentes || []).map(c => c.id === cscId ? { ...c, proveedor, precio, isShared } : c)

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

        className="date-time-modal"

        onHide={() => setDateTimeModalOpen(false)}

        footer={

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>

            <Button label="Cancelar" className="p-button-text" onClick={() => setDateTimeModalOpen(false)} />

            <Button label="Guardar" icon="pi pi-check" onClick={handleDateTimeSave} />

          </div>

        }

      >

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>

          {/* Input manual para fecha y hora */}
          <div>
            <label htmlFor="manualDateTime" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#424242' }}>
              Escribir fecha y hora manualmente
            </label>
            <InputText
              id="manualDateTime"
              value={manualDateTimeInput}
              onChange={(e) => {
                const input = e.target;
                const previousValue = manualDateTimeInput;
                const cursorPosition = input.selectionStart;
                const inputValue = e.target.value;
                
                // Contar números antes del cursor
                const beforeCursor = inputValue.substring(0, cursorPosition);
                const numbersBeforeCursor = beforeCursor.replace(/\D/g, '').length;
                
                // Formatear automáticamente mientras escribe solo números
                const formatted = formatDateTimeInput(inputValue, previousValue, cursorPosition);
                setManualDateTimeInput(formatted);
                
                // Calcular nueva posición del cursor basada en números escritos
                setTimeout(() => {
                  let newCursorPos = 0;
                  let numbersCount = 0;
                  
                  for (let i = 0; i < formatted.length; i++) {
                    if (/\d/.test(formatted[i])) {
                      numbersCount++;
                      if (numbersCount > numbersBeforeCursor) {
                        newCursorPos = i;
                        break;
                      }
                    }
                    if (numbersCount === numbersBeforeCursor && !/\d/.test(formatted[i + 1])) {
                      newCursorPos = i + 1;
                      break;
                    }
                  }
                  
                  if (newCursorPos === 0 && numbersBeforeCursor === 0) {
                    newCursorPos = 0;
                  } else if (newCursorPos === 0) {
                    newCursorPos = formatted.length;
                  }
                  
                  input.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
                
                // Intentar parsear y actualizar el calendario
                const parsed = parseFormattedDateTimeInput(formatted);
                if (parsed) {
                  setDateTimeDraft(parsed);
                }
              }}
              onBlur={(e) => {
                // Si el input no es válido al perder el foco, restaurar el valor formateado
                const parsed = parseFormattedDateTimeInput(e.target.value);
                if (!parsed && dateTimeDraft) {
                  setManualDateTimeInput(formatDateTimeToString(dateTimeDraft));
                } else if (parsed) {
                  // Asegurar que el formato esté completo
                  setManualDateTimeInput(formatDateTimeToString(parsed));
                }
              }}
              placeholder="dd/mm/yyyy HH:mm"
              style={{ width: '100%', padding: '0.35rem', textAlign: 'left' }}
            />
          
          </div>

          {/* Separador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0.3rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
            <span style={{ color: '#6b7280', fontSize: '0.65rem' }}>O</span>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
          </div>

          {/* Calendario */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#424242' }}>
              Seleccionar del calendario
            </label>
            <Calendar

              value={dateTimeDraft}

              onChange={(e) => {
                setDateTimeDraft(e.value);
                if (e.value) {
                  setManualDateTimeInput(formatDateTimeToString(e.value));
                }
              }}

              showTime={true}

              hourFormat="24"

              inline={true}

              locale="es"

              dateFormat="dd/mm/yy"

              timeOnly={false}

            />
          </div>

        </div>

      </Dialog>


    </div>

  );

}
