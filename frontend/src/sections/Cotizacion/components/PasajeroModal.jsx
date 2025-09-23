import React, { useState, useEffect } from 'react';
import { useNotification } from '../../Notification/NotificationContext';
import PasajeroRepository from '../../../modules/Pasajeros/repository/PasajeroRepository';
import CreatePasajero from '../../../modules/Pasajeros/application/CreatePasajero';
import CreatePasajeroWithFile from '../../../modules/Pasajeros/application/CreatePasajeroWithFile';
import UpdatePasajero from '../../../modules/Pasajeros/application/UpdatePasajero';
import UpdatePasajeroWithFile from '../../../modules/Pasajeros/application/UpdatePasajeroWithFile';
import '../styles/PasajeroModal.css';
import { Button } from 'primereact/button';

const paises = ['Perú', 'Bolivia', 'Chile', 'Argentina', 'Brasil', 'Ecuador', 'Colombia', 'España', 'Estados Unidos', 'Francia'];

export default function PasajeroModal({ 
  isOpen, 
  onClose, 
  cotizacionId, 
  pasajero = null, 
  onSave 
}) {
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    nombre: '',
    pais: paises[0],
    descripcionDocumento: '',
    archivo: null,
    nombreArchivo: ''
  });

  const [loading, setLoading] = useState(false);
  const [archivoPreview, setArchivoPreview] = useState(null);

  // Instanciar repositorio y casos de uso
  const pasajeroRepository = new PasajeroRepository();
  const createPasajero = new CreatePasajero(pasajeroRepository);
  const createPasajeroWithFile = new CreatePasajeroWithFile(pasajeroRepository);
  const updatePasajero = new UpdatePasajero(pasajeroRepository);
  const updatePasajeroWithFile = new UpdatePasajeroWithFile(pasajeroRepository);

  // Cargar datos del pasajero si está editando
  useEffect(() => {
    if (pasajero) {
      setFormData({
        nombre: pasajero.nombre || '',
        pais: pasajero.pais || paises[0],
        descripcionDocumento: pasajero.descripcionDocumento || '',
        archivo: null,
        nombreArchivo: pasajero.nombreArchivo || ''
      });
      setArchivoPreview(pasajero.nombreArchivo ? pasajero.nombreArchivo : null);
    } else {
      // Reset form for new pasajero
      setFormData({
        nombre: '',
        pais: paises[0],
        descripcionDocumento: '',
        archivo: null,
        nombreArchivo: ''
      });
      setArchivoPreview(null);
    }
  }, [pasajero, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, archivo: file }));
      setArchivoPreview(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      let result;
      const pasajeroData = {
        cotizacionId,
        nombre: formData.nombre,
        pais: formData.pais,
        descripcionDocumento: formData.descripcionDocumento
      };

      if (formData.archivo) {
        // Crear con archivo
        if (pasajero) {
          result = await updatePasajeroWithFile.execute(pasajero.id, pasajeroData, formData.archivo);
        } else {
          result = await createPasajeroWithFile.execute(pasajeroData, formData.archivo);
        }
      } else {
        // Crear sin archivo
        if (pasajero) {
          result = await updatePasajero.execute(pasajero.id, pasajeroData);
        } else {
          result = await createPasajero.execute(pasajeroData);
        }
      }

      showNotification(
        pasajero ? 'Pasajero actualizado correctamente' : 'Pasajero creado correctamente', 
        'success'
      );
      
      onSave(result);
      onClose();
    } catch (error) {
      console.error('Error al guardar pasajero:', error);
      showNotification(error.message || 'Error al guardar pasajero', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="pasajero-modal">
        <div className="pasajero-modal-header">
          <h3>{pasajero ? 'Editar Pasajero' : 'Nuevo Pasajero'}</h3>
          <button 
            type="button" 
            className="close-button" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <i className="pi pi-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pasajero-modal-form">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="nombre">Nombre *</label>
              <input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Nombre completo del pasajero"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="pais">País *</label>
              <select
                id="pais"
                value={formData.pais}
                onChange={(e) => handleInputChange('pais', e.target.value)}
              >
                {paises.map(pais => (
                  <option key={pais} value={pais}>{pais}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="descripcion">Descripción del Documento *</label>
            <input
              id="descripcion"
              type="text"
              value={formData.descripcionDocumento}
              onChange={(e) => handleInputChange('descripcionDocumento', e.target.value)}
              placeholder="Ej: Pasaporte peruano, DNI argentino, etc."
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="archivo">
              Documento {!pasajero && '(Opcional)'}
            </label>
            <div className="file-upload-container">
              <input
                id="archivo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="archivo" className="file-label">
                {archivoPreview ? archivoPreview : 'Seleccionar archivo (PDF, JPG, PNG)'}
              </label>
            </div>
            {archivoPreview && (
              <div className="file-info">
                <span className="file-name">{archivoPreview}</span>
                <button 
                  type="button" 
                  className="remove-file"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, archivo: null }));
                    setArchivoPreview(null);
                  }}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button 
              type="button" 
              onClick={onClose}
              label='Cancelar'
              disabled={loading}
              outlined
            />
            <Button 
              type="submit" 
              disabled={loading}
              label={loading ? 'Guardando...' : (pasajero ? 'Actualizar' : 'Crear')}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
