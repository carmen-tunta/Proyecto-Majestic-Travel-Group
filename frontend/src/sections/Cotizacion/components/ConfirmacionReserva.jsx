import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNotification } from '../../Notification/NotificationContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../styles/ConfirmacionReserva.css';

const ConfirmacionReserva = ({ cotizacionId, cotizacionData }) => {
  const baseUrl = process.env.REACT_APP_API_URL;
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [confirmacionData, setConfirmacionData] = useState(null);

  // Estados del formulario
  const [nombreCliente, setNombreCliente] = useState('');
  const [agencia, setAgencia] = useState('');
  const [fechaViaje, setFechaViaje] = useState('');
  const [numeroPasajeros, setNumeroPasajeros] = useState(1);
  const [bookingPor, setBookingPor] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [correo, setCorreo] = useState('');
  const [titulo, setTitulo] = useState('Confirmación de Reserva');
  const [estadoBooking, setEstadoBooking] = useState('Confirmado');
  const [direccion, setDireccion] = useState('Calle Garcilaso - Nro 265 / Oficina 10 - Segundo Piso. Cusco Perú');
  const [telefono, setTelefono] = useState('+51 912 920 103');

  // Cargar datos de la confirmación
  useEffect(() => {
    loadConfirmacion();
  }, [cotizacionId]);

  // Auto-llenar campos con datos de la cotización
  useEffect(() => {
    if (cotizacionData) {
      if (!nombreCliente && cotizacionData.cliente?.nombre) {
        setNombreCliente(cotizacionData.cliente.nombre);
      }
      if (!agencia && cotizacionData.agencia) {
        setAgencia(cotizacionData.agencia);
      }
      if (!fechaViaje && cotizacionData.fechaViaje) {
        const fecha = new Date(cotizacionData.fechaViaje);
        setFechaViaje(formatFecha(fecha));
      }
      if (numeroPasajeros === 1 && cotizacionData.nroPax) {
        setNumeroPasajeros(cotizacionData.nroPax);
      }
      // Auto-llenar whatsapp del cliente
      if (!whatsapp && cotizacionData.cliente?.whatsapp) {
        setWhatsapp(cotizacionData.cliente.whatsapp);
      }
      // Auto-llenar correo del usuario que creó la cotización
      if (!correo && cotizacionData.creadoPor?.email) {
        setCorreo(cotizacionData.creadoPor.email);
      }
      // Auto-llenar booking por con el nombre del usuario que creó la cotización
      if (!bookingPor && cotizacionData.creadoPor?.nombre) {
        setBookingPor(cotizacionData.creadoPor.nombre);
      } else if (!bookingPor && cotizacionData.creadoPor?.username) {
        setBookingPor(cotizacionData.creadoPor.username);
      }
    }
  }, [cotizacionData]);

  const loadConfirmacion = async () => {
    if (!cotizacionId) return;

    setLoadingData(true);
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${baseUrl}/confirmacion-reserva/${cotizacionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setConfirmacionData(data);
          setNombreCliente(data.nombreCliente || '');
          setAgencia(data.agencia || '');
          setFechaViaje(data.fechaViaje ? formatFecha(new Date(data.fechaViaje)) : '');
          setNumeroPasajeros(data.numeroPasajeros || 1);
          setBookingPor(data.bookingPor || '');
          setWhatsapp(data.whatsapp || '');
          setCorreo(data.correo || '');
          setTitulo(data.titulo || 'Confirmación de Reserva');
          setEstadoBooking(data.estadoBooking || 'Confirmado');
          setDireccion(data.direccion || 'Calle Garcilaso - Nro 265 / Oficina 10 - Segundo Piso. Cusco Perú');
          setTelefono(data.telefono || '+51 912 920 103');
        }
      }
    } catch (error) {
      console.error('Error al cargar confirmación:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatFecha = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[d.getMonth()]} ${d.getDate()} de ${String(d.getFullYear()).slice(-2)}`;
  };

  const handleSaveConfirmacion = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('authToken');
      const formData = new FormData();

      formData.append('nombreCliente', nombreCliente);
      formData.append('agencia', agencia);
      formData.append('fechaViaje', new Date(fechaViaje).toISOString().split('T')[0]);
      formData.append('numeroPasajeros', numeroPasajeros.toString());
      formData.append('bookingPor', bookingPor);
      formData.append('whatsapp', whatsapp);
      formData.append('correo', correo);
      formData.append('titulo', titulo);
      formData.append('estadoBooking', estadoBooking);
      formData.append('direccion', direccion);
      formData.append('telefono', telefono);

      const response = await fetch(`${baseUrl}/confirmacion-reserva/${cotizacionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        showNotification('Confirmación de reserva guardada exitosamente', 'success');
        loadConfirmacion();
      } else {
        showNotification('Error al guardar la confirmación de reserva', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al guardar la confirmación de reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Obtener itinerario de la cotización
  const getItinerario = () => {
    if (!cotizacionData || !cotizacionData.servicios) return [];

    const todosLosComponentes = [];

    // Recolectar todos los componentes de todos los servicios
    cotizacionData.servicios.forEach((servicio) => {
      const nombreServicio = servicio.service?.name || 'Servicio sin nombre';
      
      if (servicio.componentes && servicio.componentes.length > 0) {
        servicio.componentes.forEach((comp) => {
          // Obtener el nombre del componente
          const nombreComponente = comp.isExtra 
            ? comp.nombreExtra 
            : comp.component?.componentName || 'Componente';
          
          todosLosComponentes.push({
            nombreServicio,
            nombreComponente,
            scheduledAt: comp.scheduledAt,
            fechaOrden: comp.scheduledAt ? new Date(comp.scheduledAt).getTime() : Infinity, // Los sin fecha van al final
          });
        });
      }
    });

    // Ordenar por fecha (primero los que tienen fecha, luego los que no)
    todosLosComponentes.sort((a, b) => a.fechaOrden - b.fechaOrden);

    // Crear el itinerario con numeración de días
    const itinerario = todosLosComponentes.map((comp, index) => ({
      dia: index + 1,
      fecha: comp.scheduledAt ? formatFecha(new Date(comp.scheduledAt)) : '',
      actividad: `${comp.nombreServicio}: ${comp.nombreComponente}`,
    }));

    return itinerario;
  };

  if (loadingData) {
    return (
      <div className="confirmacion-loading">
        <ProgressSpinner />
        <p>Cargando confirmación de reserva...</p>
      </div>
    );
  }

  return (
    <div className="confirmacion-reserva-container">
      <div className="confirmacion-header">
        <h3>Confirmación de Reserva</h3>
        <Button
          label="Guardar"
          icon="pi pi-save"
          size="small"
          onClick={handleSaveConfirmacion}
          loading={loading}
          disabled={loading}
        />
      </div>

      {/* Vista previa */}
      <div className="confirmacion-preview">
        <div className="confirmacion-page">
          {/* Header completo: Logo, Título y Estado */}
          <div className="confirmacion-header-completo">
            <div className="confirmacion-logo-left">
              <img 
                src={`${process.env.PUBLIC_URL}/logo_grande.png`} 
                alt="Logo MTG" 
                className="confirmacion-logo-small" 
              />
            </div>
            <h2 className="confirmacion-titulo-center">{titulo}</h2>
            <div className="confirmacion-estado-right">
              <span className="estado-label">Estado del booking</span>
              <span className="estado-value">{estadoBooking}</span>
            </div>
          </div>

          {/* Información principal en dos columnas */}
          <div className="confirmacion-info-section">
            <div className="confirmacion-info-column">
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{nombreCliente}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Agencia:</span>
                <span className="info-value">{agencia}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Fecha de viaje:</span>
                <span className="info-value">{fechaViaje}</span>
              </div>
            </div>
            <div className="confirmacion-info-column">
              <div className="info-row">
                <span className="info-label">Booking por:</span>
                <span className="info-value">{bookingPor}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Whatsapp:</span>
                <span className="info-value">{whatsapp}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Correo:</span>
                <span className="info-value">{correo}</span>
              </div>
            </div>
          </div>

          {/* Pasajeros */}
          <div className="confirmacion-pasajeros">
            <h4>{numeroPasajeros} Pasajero{numeroPasajeros > 1 ? 's' : ''}</h4>
            <ul>
              {cotizacionData?.pasajeros && cotizacionData.pasajeros.length > 0 ? (
                cotizacionData.pasajeros.map((pasajero, i) => (
                  <li key={i}>{pasajero.nombre}</li>
                ))
              ) : (
                Array.from({ length: numeroPasajeros }, (_, i) => (
                  <li key={i}>Nombre del pasajero {i + 1}</li>
                ))
              )}
            </ul>
          </div>

          {/* Itinerario */}
          <div className="confirmacion-itinerario">
            <h4>Itinerario</h4>
            <DataTable value={getItinerario()} size="small" emptyMessage="Sin itinerario">
              <Column field="dia" header="Nº" style={{ width: '10%' }} />
              <Column field="fecha" header="FECHA" style={{ width: '25%' }} />
              <Column field="actividad" header="SERVICIOS/ACTIVIDADES" style={{ width: '65%' }} />
            </DataTable>
          </div>

          {/* Footer */}
          <div className="confirmacion-footer">
            <div className="footer-icon">
              <i className="pi pi-map-marker" />
              <span>{direccion}</span>
            </div>
            <div className="footer-icon">
              <i className="pi pi-phone" />
              <span>{telefono}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionReserva;

