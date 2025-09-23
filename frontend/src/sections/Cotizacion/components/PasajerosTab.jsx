import React, { useState, useEffect } from 'react';
import { useNotification } from '../../Notification/NotificationContext';
import PasajeroModal from './PasajeroModal';
import PasajeroRepository from '../../../modules/Pasajeros/repository/PasajeroRepository';
import GetPasajerosByCotizacion from '../../../modules/Pasajeros/application/GetPasajerosByCotizacion';
import DeletePasajero from '../../../modules/Pasajeros/application/DeletePasajero';
import '../styles/PasajerosTab.css';
import { Button } from 'primereact/button';

export default function PasajerosTab({ cotizacionId, cotizacionNombre }) {
  const { showNotification } = useNotification();
  
  const [pasajeros, setPasajeros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPasajero, setEditingPasajero] = useState(null);

  // Instanciar repositorio y casos de uso
  const pasajeroRepository = new PasajeroRepository();
  const getPasajerosByCotizacion = new GetPasajerosByCotizacion(pasajeroRepository);
  const deletePasajero = new DeletePasajero(pasajeroRepository);

  // Cargar pasajeros de la cotización
  const loadPasajeros = async () => {
    if (!cotizacionId) return;
    
    try {
      setLoading(true);
      const pasajerosData = await getPasajerosByCotizacion.execute(cotizacionId);
      setPasajeros(pasajerosData || []);
    } catch (error) {
      console.error('Error al cargar pasajeros:', error);
      showNotification(error.message || 'Error al cargar pasajeros', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasajeros();
  }, [cotizacionId]);

  const handleCreatePasajero = () => {
    setEditingPasajero(null);
    setShowModal(true);
  };

  const handleEditPasajero = (pasajero) => {
    setEditingPasajero(pasajero);
    setShowModal(true);
  };

  const handleDeletePasajero = async (pasajero) => {
    if (!window.confirm(`¿Estás seguro de eliminar al pasajero ${pasajero.nombre}?`)) {
      return;
    }

    try {
      await deletePasajero.execute(pasajero.id, pasajero.hasDocument());
      
      showNotification('Pasajero eliminado correctamente', 'success');
      loadPasajeros();
    } catch (error) {
      console.error('Error al eliminar pasajero:', error);
      showNotification(error.message || 'Error al eliminar pasajero', 'error');
    }
  };

  const handleModalSave = () => {
    loadPasajeros();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPasajero(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="pasajeros-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando pasajeros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pasajeros-tab">
      <div className="pasajeros-header">
        <div className="pasajeros-title">
          <h3>Pasajeros de la Cotización</h3>
          <p className="cotizacion-info">
            {cotizacionNombre && `Cotización: ${cotizacionNombre}`}
          </p>
        </div>
        <Button 
          onClick={handleCreatePasajero}
          label='Nuevo'
          icon='pi pi-plus'
          outlined
        />
      </div>

      {pasajeros.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="pi pi-users"></i>
          </div>
          <h4>No hay pasajeros registrados</h4>
          <p>Agrega el primer pasajero para esta cotización</p>
          <button 
            className="btn-primary"
            onClick={handleCreatePasajero}
          >
            Agregar Pasajero
          </button>
        </div>
      ) : (
        <div className="pasajeros-list">
          {pasajeros.map((pasajero) => (
            <div key={pasajero.id} className="pasajero-card">
              <div className="pasajero-info">
                <div className="pasajero-header">
                  <h4 className="pasajero-nombre">{pasajero.nombre}</h4>
                  <div className="pasajero-actions">
                    <button
                      type="button"
                      className="action-btn edit-btn"
                      onClick={() => handleEditPasajero(pasajero)}
                      title="Editar pasajero"
                      aria-label="Editar pasajero"
                    >
                      <i className="pi pi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() => handleDeletePasajero(pasajero)}
                      title="Eliminar pasajero"
                      aria-label="Eliminar pasajero"
                    >
                      <i className="pi pi-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className="pasajero-details">
                  <div className="detail-item">
                    <span className="detail-label">País:</span>
                    <span className="detail-value">{pasajero.pais}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Documento:</span>
                    <span className="detail-value">{pasajero.descripcionDocumento}</span>
                  </div>
                  {pasajero.nombreArchivo && (
                    <div className="detail-item">
                      <span className="detail-label">Archivo:</span>
                      <span className="detail-value file-info">
                        <i className="pi pi-file"></i>
                        {pasajero.nombreArchivo}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PasajeroModal
        isOpen={showModal}
        onClose={handleCloseModal}
        cotizacionId={cotizacionId}
        pasajero={editingPasajero}
        onSave={handleModalSave}
      />
    </div>
  );
}
