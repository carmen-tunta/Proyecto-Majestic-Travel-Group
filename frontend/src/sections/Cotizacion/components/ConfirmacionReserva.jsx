import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNotification } from '../../Notification/NotificationContext';
import { ProgressSpinner } from 'primereact/progressspinner';
import '../styles/ConfirmacionReservaEditor.css';

const ConfirmacionReserva = ({ cotizacionId, cotizacionData }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Sistema de páginas: la primera es fija (confirmación), las demás son editables
  const [editablePages, setEditablePages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    setLoadingData(false);
  }, [cotizacionId, cotizacionData]);

  const formatFecha = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[d.getMonth()]} ${d.getDate()} de ${String(d.getFullYear()).slice(-2)}`;
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
          const nombreComponente = comp.isExtra 
            ? comp.nombreExtra 
            : comp.component?.componentName || 'Componente';
          
          todosLosComponentes.push({
            nombreServicio,
            nombreComponente,
            scheduledAt: comp.scheduledAt,
            fechaOrden: comp.scheduledAt ? new Date(comp.scheduledAt).getTime() : Infinity,
          });
        });
      }
    });

    todosLosComponentes.sort((a, b) => a.fechaOrden - b.fechaOrden);

    const itinerario = todosLosComponentes.map((comp, index) => ({
      dia: index + 1,
      fecha: comp.scheduledAt ? formatFecha(new Date(comp.scheduledAt)) : '',
      actividad: `${comp.nombreServicio}: ${comp.nombreComponente}`,
    }));

    return itinerario;
  };

  // Funciones para manejar páginas editables
  const addNewPage = () => {
    const newPage = {
      id: Date.now(),
      blocks: []
    };
    setEditablePages([...editablePages, newPage]);
    setCurrentPageIndex(editablePages.length + 1);
  };

  const addRowBlock = () => {
    if (currentPageIndex === 0) return;
    
    const newBlock = {
      id: Date.now(),
      type: 'row',
      titulo: 'Titulo',
      contenido: 'Contenido'
    };
    const updatedPages = [...editablePages];
    updatedPages[currentPageIndex - 1].blocks.push(newBlock);
    setEditablePages(updatedPages);
  };

  const addDoubleBlock = () => {
    if (currentPageIndex === 0) return;
    
    const newBlock = {
      id: Date.now(),
      type: 'double',
      col1: { titulo: 'Titulo', contenido: 'Contenido' },
      col2: { titulo: 'Titulo', contenido: 'Contenido' }
    };
    const updatedPages = [...editablePages];
    updatedPages[currentPageIndex - 1].blocks.push(newBlock);
    setEditablePages(updatedPages);
  };

  const updateBlock = (blockId, field, value, column = null) => {
    const updatedPages = [...editablePages];
    const block = updatedPages[currentPageIndex - 1].blocks.find(b => b.id === blockId);
    if (block) {
      if (column) {
        block[column][field] = value;
      } else {
        block[field] = value;
      }
      setEditablePages(updatedPages);
    }
  };

  const deleteBlock = (blockId) => {
    const updatedPages = [...editablePages];
    updatedPages[currentPageIndex - 1].blocks = updatedPages[currentPageIndex - 1].blocks.filter(b => b.id !== blockId);
    setEditablePages(updatedPages);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      showNotification('Documento guardado correctamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al guardar el documento', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="confirmacion-loading">
        <ProgressSpinner />
        <p>Cargando confirmación de reserva...</p>
      </div>
    );
  }

  const totalPages = 1 + editablePages.length;
  const isFirstPage = currentPageIndex === 0;
  const currentEditablePage = !isFirstPage ? editablePages[currentPageIndex - 1] : null;

  return (
    <div className="confirmacion-editor-container">
      {/* Header con botón guardar */}
      <div className="confirmacion-editor-header">
        <h3>Confirmación de Reserva</h3>
        <Button
          label="Guardar"
          icon="pi pi-save"
          size="small"
          onClick={handleSave}
          loading={loading}
          disabled={loading}
        />
      </div>

      {/* Página actual */}
      <div className="confirmacion-page">
        {/* Contenido */}
        <div className="confirmacion-page-content">
          {isFirstPage ? (
            /* PÁGINA 1: Confirmación de Reserva con datos */
            <>
              {/* Header con logo, título y estado en una sola fila */}
              <div className="confirmacion-header-principal">
                <div className="confirmacion-logo-container">
                  <img src="/logo_grande.png" alt="Logo" className="confirmacion-logo" />
                </div>
                <div className="confirmacion-titulo-container">
                  <h2>Confirmación de Reserva</h2>
                </div>
                <div className="confirmacion-estado-container">
                  <div className="estado-label">Estado del booking</div>
                  <div className="estado-value">Confirmado</div>
                </div>
              </div>

              {/* Información principal en dos columnas */}
              <div className="confirmacion-info-section">
                <div className="confirmacion-info-column">
                  <div className="info-row">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{cotizacionData?.cliente?.nombre || ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Agencia:</span>
                    <span className="info-value">{cotizacionData?.agencia || ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Fecha de viaje:</span>
                    <span className="info-value">{cotizacionData?.fechaViaje ? formatFecha(new Date(cotizacionData.fechaViaje)) : ''}</span>
                  </div>
                </div>
                <div className="confirmacion-info-column">
                  <div className="info-row">
                    <span className="info-label">Booking por:</span>
                    <span className="info-value">{cotizacionData?.creadoPor?.nombre || cotizacionData?.creadoPor?.username || ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Whatsapp:</span>
                    <span className="info-value">{cotizacionData?.cliente?.whatsapp || ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Correo:</span>
                    <span className="info-value">{cotizacionData?.creadoPor?.email || ''}</span>
                  </div>
                </div>
              </div>

              {/* Pasajeros */}
              <div className="confirmacion-pasajeros">
                <h4>{cotizacionData?.nroPax || 1} Pasajero{(cotizacionData?.nroPax || 1) > 1 ? 's' : ''}</h4>
                <ul>
                  {cotizacionData?.pasajeros && cotizacionData.pasajeros.length > 0 ? (
                    cotizacionData.pasajeros.map((pasajero, i) => (
                      <li key={i}>{pasajero.nombre}</li>
                    ))
                  ) : (
                    Array.from({ length: cotizacionData?.nroPax || 1 }, (_, i) => (
                      <li key={i}>Nombre del pasajero {i + 1}</li>
                    ))
                  )}
                </ul>
              </div>

              {/* Itinerario */}
              <div className="confirmacion-itinerario">
                <h4>Itinerario</h4>
                <DataTable value={getItinerario()} size="small" emptyMessage="Sin itinerario">
                  <Column field="dia" header="DÍA" style={{ width: '10%' }} />
                  <Column field="fecha" header="FECHA" style={{ width: '25%' }} />
                  <Column field="actividad" header="SERVICIOS/ACTIVIDADES" style={{ width: '65%' }} />
                </DataTable>
              </div>
            </>
          ) : (
            /* PÁGINAS EDITABLES con bloques */
            <>
              {/* Logo en páginas editables */}
              <div className="confirmacion-logo-container">
                <img src="/logo_grande.png" alt="Logo" className="confirmacion-logo" />
              </div>
              
              {currentEditablePage && currentEditablePage.blocks.map((block) => (
                <div key={block.id} className="confirmacion-block">
                <Button
                  icon="pi pi-times"
                  className="p-button-rounded p-button-danger p-button-text confirmacion-block-delete"
                  onClick={() => deleteBlock(block.id)}
                  size="small"
                />
                
                {block.type === 'row' && (
                  <div className="confirmacion-block-row">
                    <InputText
                      value={block.titulo}
                      onChange={(e) => updateBlock(block.id, 'titulo', e.target.value)}
                      className="confirmacion-titulo-input"
                    />
                    <InputTextarea
                      value={block.contenido}
                      onChange={(e) => updateBlock(block.id, 'contenido', e.target.value)}
                      className="confirmacion-contenido-input"
                      rows={3}
                    />
                  </div>
                )}

                {block.type === 'double' && (
                  <div className="confirmacion-block-double">
                    <div className="confirmacion-block-column">
                      <InputText
                        value={block.col1.titulo}
                        onChange={(e) => updateBlock(block.id, 'titulo', e.target.value, 'col1')}
                        className="confirmacion-titulo-input"
                      />
                      <InputTextarea
                        value={block.col1.contenido}
                        onChange={(e) => updateBlock(block.id, 'contenido', e.target.value, 'col1')}
                        className="confirmacion-contenido-input"
                        rows={3}
                      />
                    </div>
                    <div className="confirmacion-block-column">
                      <InputText
                        value={block.col2.titulo}
                        onChange={(e) => updateBlock(block.id, 'titulo', e.target.value, 'col2')}
                        className="confirmacion-titulo-input"
                      />
                      <InputTextarea
                        value={block.col2.contenido}
                        onChange={(e) => updateBlock(block.id, 'contenido', e.target.value, 'col2')}
                        className="confirmacion-contenido-input"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
              ))}
            </>
          )}
        </div>

        {/* Footer con dirección y whatsapp */}
        <div className="confirmacion-page-footer">
          <div className="footer-item">
            <i className="pi pi-map-marker" />
            <span>Calle Garcilaso - Nro 265 / Oficina 10 - Segundo Piso. Cusco Perú</span>
          </div>
          <div className="footer-item">
            <i className="pi pi-whatsapp" />
            <span>+51 912 920 103</span>
          </div>
        </div>
      </div>

      {/* Controles en el pie */}
      <div className="confirmacion-controls">
        <Button
          icon="pi pi-file"
          label="Nuevo"
          onClick={addNewPage}
          className="p-button-outlined"
          size="small"
        />
        <Button
          icon="pi pi-th-large"
          label="Fila"
          onClick={addRowBlock}
          className="p-button-outlined"
          size="small"
          disabled={isFirstPage}
        />
        <Button
          icon="pi pi-clone"
          label="Doble"
          onClick={addDoubleBlock}
          className="p-button-outlined"
          size="small"
          disabled={isFirstPage}
        />
      </div>

      {/* Indicador de páginas */}
      {totalPages > 1 && (
        <div className="confirmacion-pages-indicator">
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              label={`${index + 1}`}
              onClick={() => setCurrentPageIndex(index)}
              className={index === currentPageIndex ? 'p-button-primary' : 'p-button-outlined'}
              size="small"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfirmacionReserva;

