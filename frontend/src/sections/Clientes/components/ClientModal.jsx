import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { apiService } from '../../../services/apiService';
import '../styles/ClientModal.css';

const ClientModal = ({ visible, onHide, onClientCreated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    ciudad: '',
    direccion: '',
    whatsapp: '',
    correo: '',
    fechaNacimiento: null,
    lenguaNativa: '',
    tipoDocumento: '',
    numeroDocumento: '',
    mercado: '',
    rubro: '',
    genero: 'Masculino',
    estado: 'Cotización'
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('detalles');

  // Opciones para los dropdowns
  const paises = [
    { label: 'Perú', value: 'Perú' },
    { label: 'Colombia', value: 'Colombia' },
    { label: 'Ecuador', value: 'Ecuador' },
    { label: 'Chile', value: 'Chile' },
    { label: 'Argentina', value: 'Argentina' },
    { label: 'Brasil', value: 'Brasil' },
    { label: 'México', value: 'México' },
    { label: 'Estados Unidos', value: 'Estados Unidos' },
    { label: 'España', value: 'España' },
    { label: 'Francia', value: 'Francia' },
    { label: 'Italia', value: 'Italia' },
    { label: 'Alemania', value: 'Alemania' },
    { label: 'Reino Unido', value: 'Reino Unido' },
    { label: 'Canadá', value: 'Canadá' },
    { label: 'Australia', value: 'Australia' }
  ];

  const lenguasNativas = [
    { label: 'Español', value: 'Español' },
    { label: 'Inglés', value: 'Inglés' },
    { label: 'Portugués', value: 'Portugués' },
    { label: 'Francés', value: 'Francés' },
    { label: 'Italiano', value: 'Italiano' },
    { label: 'Alemán', value: 'Alemán' },
    { label: 'Chino', value: 'Chino' },
    { label: 'Japonés', value: 'Japonés' },
    { label: 'Coreano', value: 'Coreano' },
    { label: 'Ruso', value: 'Ruso' }
  ];

  const tiposDocumento = [
    { label: 'DNI', value: 'DNI' },
    { label: 'Pasaporte', value: 'Pasaporte' },
    { label: 'Cédula', value: 'Cédula' },
    { label: 'RUC', value: 'RUC' },
    { label: 'Carné de extranjería', value: 'Carné de extranjería' }
  ];

  const mercados = [
    { label: 'Nacional', value: 'Nacional' },
    { label: 'Internacional', value: 'Internacional' },
    { label: 'Regional', value: 'Regional' },
    { label: 'Local', value: 'Local' }
  ];

  const rubros = [
    { label: 'Turismo', value: 'Turismo' },
    { label: 'Negocios', value: 'Negocios' },
    { label: 'Educación', value: 'Educación' },
    { label: 'Salud', value: 'Salud' },
    { label: 'Tecnología', value: 'Tecnología' },
    { label: 'Finanzas', value: 'Finanzas' },
    { label: 'Inmobiliario', value: 'Inmobiliario' },
    { label: 'Manufactura', value: 'Manufactura' },
    { label: 'Servicios', value: 'Servicios' },
    { label: 'Otros', value: 'Otros' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para enviar
      const clientData = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento ? formData.fechaNacimiento.toISOString().split('T')[0] : null,
        fechaRegistro: new Date().toISOString().split('T')[0]
      };

      const response = await apiService.createClient(clientData);
      
      if (response) {
        // Limpiar formulario
        setFormData({
          nombre: '',
          pais: '',
          ciudad: '',
          direccion: '',
          whatsapp: '',
          correo: '',
          fechaNacimiento: null,
          lenguaNativa: '',
          tipoDocumento: '',
          numeroDocumento: '',
          mercado: '',
          rubro: '',
          genero: 'Masculino',
          estado: 'Cotización'
        });
        
        onClientCreated(response);
        onHide();
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      alert('Error al crear el cliente. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const headerTemplate = () => (
    <div className="client-modal-header">
      <div className="client-modal-header-content">
        <div className="client-modal-header-top">
          <Button
            icon="pi pi-arrow-left"
            text
            className="client-modal-back-button"
            onClick={onHide}
          />
          <span className="client-modal-breadcrumb">Clientes</span>
        </div>
        <h2>{formData.nombre || 'Nuevo Cliente'}</h2>
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={headerTemplate}
      className="client-modal-dialog"
      modal
      closable={false}
      style={{ 
        width: '90vw', 
        maxWidth: '1200px',
        height: '90vh'
      }}
    >
      <div className="client-modal-content">
        {/* Tabs */}
        <div className="client-modal-tabs">
          <button 
            className={`client-modal-tab ${activeTab === 'detalles' ? 'active' : ''}`}
            onClick={() => setActiveTab('detalles')}
          >
            Detalles
          </button>
          <button 
            className={`client-modal-tab ${activeTab === 'contacto' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacto')}
          >
            Datos de contacto
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="client-modal-form">
          <div className="client-modal-form-card">
            <div className="client-modal-form-section">
              <h3>Datos principales</h3>
            
            <div className="client-modal-form-row">
              {/* Columna izquierda */}
              <div className="client-modal-form-column">
                <div className="client-modal-form-field">
                  <label htmlFor="nombre">Nombre del cliente *</label>
                  <InputText
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ingrese el nombre completo"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="pais">País *</label>
                  <Dropdown
                    id="pais"
                    value={formData.pais}
                    options={paises}
                    onChange={(e) => handleInputChange('pais', e.value)}
                    placeholder="Seleccione un país"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="ciudad">Ciudad *</label>
                  <InputText
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    placeholder="Ingrese la ciudad"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="direccion">Dirección</label>
                  <InputText
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Ingrese la dirección"
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="whatsapp">Whatsapp</label>
                  <InputText
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+51 999 999 999"
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="correo">Correo *</label>
                  <InputText
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => handleInputChange('correo', e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                  <Calendar
                    id="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.value)}
                    dateFormat="dd/mm/yy"
                    placeholder="Seleccione fecha"
                    showIcon
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="client-modal-form-column">
                <div className="client-modal-form-field">
                  <label htmlFor="lenguaNativa">Lengua nativa *</label>
                  <Dropdown
                    id="lenguaNativa"
                    value={formData.lenguaNativa}
                    options={lenguasNativas}
                    onChange={(e) => handleInputChange('lenguaNativa', e.value)}
                    placeholder="Seleccione idioma"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="tipoDocumento">Tipo de documento *</label>
                  <Dropdown
                    id="tipoDocumento"
                    value={formData.tipoDocumento}
                    options={tiposDocumento}
                    onChange={(e) => handleInputChange('tipoDocumento', e.value)}
                    placeholder="Seleccione tipo"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="numeroDocumento">Número de documento *</label>
                  <InputText
                    id="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                    placeholder="Ingrese el número"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="mercado">Mercado *</label>
                  <Dropdown
                    id="mercado"
                    value={formData.mercado}
                    options={mercados}
                    onChange={(e) => handleInputChange('mercado', e.value)}
                    placeholder="Seleccione mercado"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="rubro">Rubro *</label>
                  <Dropdown
                    id="rubro"
                    value={formData.rubro}
                    options={rubros}
                    onChange={(e) => handleInputChange('rubro', e.value)}
                    placeholder="Seleccione rubro"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label>Género *</label>
                  <div className="client-modal-radio-group">
                    <div className="client-modal-radio-option">
                      <RadioButton
                        inputId="masculino"
                        name="genero"
                        value="Masculino"
                        checked={formData.genero === 'Masculino'}
                        onChange={(e) => handleInputChange('genero', e.value)}
                      />
                      <label htmlFor="masculino" className="client-modal-radio-label">Masculino</label>
                    </div>
                    <div className="client-modal-radio-option">
                      <RadioButton
                        inputId="femenino"
                        name="genero"
                        value="Femenino"
                        checked={formData.genero === 'Femenino'}
                        onChange={(e) => handleInputChange('genero', e.value)}
                      />
                      <label htmlFor="femenino" className="client-modal-radio-label">Femenino</label>
                    </div>
                  </div>
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="fechaRegistro">Fecha de registro</label>
                  <InputText
                    id="fechaRegistro"
                    value={new Date().toLocaleDateString()}
                    disabled
                    className="client-modal-disabled-field"
                  />
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Botones de acción */}
          <div className="client-modal-form-actions">
            <Button
              type="button"
              label="Cancelar"
              outlined
              onClick={onHide}
              className="client-modal-cancel-button"
            />
            <Button
              type="submit"
              label="Guardar cambios"
              loading={loading}
              className="client-modal-save-button"
            />
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default ClientModal;
