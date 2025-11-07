import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { useNotification } from '../../Notification/NotificationContext';
import '../styles/ComponentModal.css';

const ComponentModal = ({ onHide, component, onSave }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [componentName, setComponentName] = useState(component?.componentName || '');
  const [serviceType, setServiceType] = useState(component?.serviceType || '');
  const [description, setDescription] = useState(component?.description || '');

  // Opciones para el dropdown de tipo de servicio
  const serviceTypeOptions = [
    { label: 'Transporte', value: 'Transporte' },
    { label: 'Ticket', value: 'Ticket' },
    { label: 'Boleto', value: 'Boleto' },
    { label: 'Tour', value: 'Tour' },
    { label: 'Hotel', value: 'Hotel' },
    { label: 'Guia', value: 'Guia' },
    { label: 'Restaurant', value: 'Restaurant' },
    { label: 'Otros', value: 'Otros' }
  ];

  useEffect(() => {
    if (component) {
      setComponentName(component.componentName || '');
      setServiceType(component.serviceType || '');
      setDescription(component.description || '');
    }
  }, [component]);

  const handleSave = async () => {
    if (!componentName.trim() || !serviceType.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const componentData = {
        componentName: componentName.trim(),
        serviceType: serviceType.trim(),
        description: description.trim()
      };

      await onSave(componentData);
      
      // Mostrar notificación de éxito
      if (component) {
        showNotification('¡Componente actualizado con éxito!', 'success');
      } else {
        showNotification('¡Componente creado con éxito!', 'success');
      }
      
      onHide();
    } catch (error) {
      console.error('Error al guardar componente:', error);
      // Extraer el mensaje de error del response
      const errorMessage = error.message || 'Error al guardar el componente';
      setError(errorMessage);
      showNotification('Error al guardar el componente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setComponentName('');
    setServiceType('');
    setDescription('');
    setError('');
    onHide();
  };

  return (
    <div className="component-modal-overlay">
      <div className="component-modal">
        <div className='component-modal-header'>
          <h3>{component ? "Editar Componente" : "Nuevo Componente"}</h3>
          <i 
            className="pi pi-times" 
            style={{ cursor: "pointer", fontSize: "1.2rem", color: "#666" }}
            onClick={handleCancel}
          />
        </div>

        <div className="component-modal-content">
          <FloatLabel>
            <InputText 
              id="componentName" 
              className="p-inputtext-sm" 
              value={componentName} 
              onChange={e => setComponentName(e.target.value)}
              placeholder=" "
              required 
              style={{ width: '100%' }}
            />
            <label htmlFor="componentName">Nombre del componente</label>
          </FloatLabel>

          <FloatLabel>
            <Dropdown 
              id="serviceType" 
              className="p-inputtext-sm" 
              value={serviceType} 
              options={serviceTypeOptions}
              onChange={e => setServiceType(e.value)}
              placeholder="Selecciona un tipo de servicio"
              required 
              style={{ width: '100%' }}
            />
            <label htmlFor="serviceType">Tipo de servicio</label>
          </FloatLabel>

          <FloatLabel>
            <InputTextarea 
              id="description" 
              className="p-inputtext-sm" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe el componente..."
              style={{ width: '100%', resize: 'vertical' }}
            />
            <label htmlFor="description">Descripción del componente</label>
          </FloatLabel>

          {error && (
            <div className="error-message" style={{ 
              color: 'red', 
              fontSize: '14px', 
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          <div className="component-info-box">
            <i className="pi pi-info-circle" style={{ marginRight: '0.5rem'}}></i>
            <span>Los componentes son los items que se cotizan con los proveedores</span>
          </div>
        </div>

        <div className='component-modal-buttons'>
          <Button 
            label="Cancelar" 
            size='small' 
            outlined
            className='p-button-secondary'
            onClick={handleCancel}
          />
          <Button 
            label={component ? "Editar" : "Guardar"}
            size='small' 
            className='p-button-primary'
            onClick={handleSave}
            disabled={loading || !componentName.trim() || !serviceType.trim()}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponentModal;
