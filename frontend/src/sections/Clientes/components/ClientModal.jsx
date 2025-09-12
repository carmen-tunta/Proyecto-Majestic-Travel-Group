import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { apiService } from '../../../services/apiService';
import '../styles/ClientModal.css';

  const ClientModal = ({ visible, onHide, onClientCreated, onClientUpdated, editingClient }) => {
    console.log('ClientModal props:', { visible, editingClient });
    
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
  
  console.log('FormData inicial:', formData);

  // Cargar datos del cliente a editar
  useEffect(() => {
    console.log('useEffect ejecutándose - editingClient:', editingClient);
    if (editingClient) {
      console.log('Cargando datos del cliente:', editingClient);
      console.log('Género del cliente:', editingClient.genero);
      setFormData({
        nombre: editingClient.nombre || '',
        pais: editingClient.pais || '',
        ciudad: editingClient.ciudad || '',
        direccion: editingClient.direccion || '',
        whatsapp: editingClient.whatsapp || '',
        correo: editingClient.correo || '',
        fechaNacimiento: editingClient.fechaNacimiento ? new Date(editingClient.fechaNacimiento) : null,
        lenguaNativa: editingClient.lenguaNativa || '',
        tipoDocumento: editingClient.tipoDocumento || '',
        numeroDocumento: editingClient.numeroDocumento || '',
        mercado: editingClient.mercado || '',
        rubro: editingClient.rubro || '',
        genero: editingClient.genero || 'Masculino',
        estado: editingClient.estado || 'Cotización'
      });
      console.log('FormData actualizado:', {
        nombre: editingClient.nombre || '',
        rubro: editingClient.rubro || '',
        genero: editingClient.genero || 'Masculino'
      });
      console.log('Género con comillas:', `"${editingClient.genero}"`);
      console.log('Longitud del género:', editingClient.genero?.length);
    } else {
      console.log('No hay editingClient - limpiando formulario para nuevo cliente');
      // Limpiar formulario para nuevo cliente
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
    }
  }, [editingClient]);
  
  // Debug para verificar el estado del formulario
  useEffect(() => {
    console.log('FormData después de useEffect:', formData);
  }, [formData]);

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
  
  console.log('Opciones de rubros:', rubros);

  const handleInputChange = (field, value) => {
    console.log(`Cambiando ${field} a:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('FormData actualizado:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para enviar
      const clientData = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento ? formData.fechaNacimiento.toISOString().split('T')[0] : null,
        fechaRegistro: editingClient?.fechaRegistro || new Date().toISOString().split('T')[0]
      };

      console.log('Enviando datos:', clientData);
      console.log('Editando cliente:', editingClient ? 'Sí' : 'No');

      let response;
      if (editingClient) {
        // Actualizar cliente existente
        response = await apiService.updateClient(editingClient.id, clientData);
        console.log('Cliente actualizado:', response);
        onClientUpdated(response);
      } else {
        // Crear nuevo cliente
        response = await apiService.createClient(clientData);
        console.log('Cliente creado:', response);
        onClientCreated(response);
      }
      
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
        
        onHide();
      }
    } catch (error) {
      console.error('Error al procesar cliente:', error);
      alert('Error al procesar el cliente. Por favor, inténtalo de nuevo.');
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
                  {console.log('Renderizando Dropdown rubro con value:', formData.rubro)}
                  <Dropdown
                    id="rubro"
                    value={formData.rubro}
                    options={rubros}
                    onChange={(e) => {
                      console.log('Cambiando rubro a:', e.value);
                      handleInputChange('rubro', e.value);
                    }}
                    placeholder="Seleccione rubro"
                    required
                  />
                </div>

                <div className="client-modal-form-field">
                  <label>Género *</label>
                  {console.log('Renderizando RadioButtons género con value:', formData.genero)}
                  {console.log('Comparación Masculino:', formData.genero === 'Masculino')}
                  {console.log('Comparación Femenino:', formData.genero === 'Femenino')}
                  {console.log('Tipo de género:', typeof formData.genero)}
                  {console.log('Género exacto:', JSON.stringify(formData.genero))}
                  <div className="client-modal-radio-group">
                    <div className="client-modal-radio-option">
                      <RadioButton
                        inputId="masculino"
                        name="genero"
                        value="Masculino"
                        checked={formData.genero === 'Masculino'}
                        onChange={(e) => {
                          console.log('Cambiando género a:', e.value);
                          setFormData(prev => ({ ...prev, genero: e.value }));
                        }}
                      />
                      <label htmlFor="masculino" className="client-modal-radio-label">Masculino</label>
                    </div>
                    <div className="client-modal-radio-option">
                      <RadioButton
                        inputId="femenino"
                        name="genero"
                        value="Femenino"
                        checked={formData.genero === 'Femenino'}
                        onChange={(e) => {
                          console.log('Cambiando género a:', e.value);
                          setFormData(prev => ({ ...prev, genero: e.value }));
                        }}
                      />
                      <label htmlFor="femenino" className="client-modal-radio-label">Femenino</label>
                    </div>
                  </div>
                </div>

                <div className="client-modal-form-field">
                  <label htmlFor="fechaRegistro">Fecha de registro</label>
                  {console.log('Renderizando fechaRegistro con value:', editingClient?.fechaRegistro)}
                  <InputText
                    id="fechaRegistro"
                    value={editingClient?.fechaRegistro ? new Date(editingClient.fechaRegistro).toLocaleDateString() : new Date().toLocaleDateString()}
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
