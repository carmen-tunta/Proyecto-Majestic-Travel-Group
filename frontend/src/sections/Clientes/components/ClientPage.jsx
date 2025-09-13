import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { apiService } from '../../../services/apiService';
import '../styles/ClientPage.css';

const ClientPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);


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
    estado: 'Registrado'
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('detalles');

  // Función para formatear fechas en formato "Lun 01 Dic 25"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    
    return `${dayName} ${day} ${month} ${year}`;
  };

  // Cargar datos del cliente a editar
  useEffect(() => {
    if (isEditing && id) {
      const loadClient = async () => {
        try {
          setLoading(true);
          const client = await apiService.getClient(id);
          if (client) {
            setFormData({
              nombre: client.nombre || '',
              pais: client.pais || '',
              ciudad: client.ciudad || '',
              direccion: client.direccion || '',
              whatsapp: client.whatsapp || '',
              correo: client.correo || '',
              fechaNacimiento: client.fechaNacimiento ? new Date(client.fechaNacimiento) : null,
              lenguaNativa: client.lenguaNativa || '',
              tipoDocumento: client.tipoDocumento || '',
              numeroDocumento: client.numeroDocumento || '',
              mercado: client.mercado || '',
              rubro: client.rubro || '',
              genero: client.genero || 'Masculino',
              estado: client.estado || 'Registrado'
            });
          }
        } catch (error) {
          console.error('Error al cargar cliente:', error);
        } finally {
          setLoading(false);
        }
      };
      loadClient();
    }
  }, [isEditing, id]);

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
    { label: 'Alemania', value: 'Alemania' },
    { label: 'Italia', value: 'Italia' },
    { label: 'Reino Unido', value: 'Reino Unido' },
    { label: 'Canadá', value: 'Canadá' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Japón', value: 'Japón' },
    { label: 'China', value: 'China' },
    { label: 'India', value: 'India' },
    { label: 'Otros', value: 'Otros' }
  ];

  const lenguasNativas = [
    { label: 'Español', value: 'Español' },
    { label: 'Inglés', value: 'Inglés' },
    { label: 'Portugués', value: 'Portugués' },
    { label: 'Francés', value: 'Francés' },
    { label: 'Alemán', value: 'Alemán' },
    { label: 'Italiano', value: 'Italiano' },
    { label: 'Chino', value: 'Chino' },
    { label: 'Japonés', value: 'Japonés' },
    { label: 'Coreano', value: 'Coreano' },
    { label: 'Árabe', value: 'Árabe' },
    { label: 'Ruso', value: 'Ruso' },
    { label: 'Otros', value: 'Otros' }
  ];

  const tiposDocumento = [
    { label: 'DNI', value: 'DNI' },
    { label: 'Pasaporte', value: 'Pasaporte' },
    { label: 'Cédula', value: 'Cédula' },
    { label: 'Carné de extranjería', value: 'Carné de extranjería' },
    { label: 'Otros', value: 'Otros' }
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
      const clientData = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento ? formData.fechaNacimiento.toISOString().split('T')[0] : null,
        fechaRegistro: isEditing ? formData.fechaRegistro : new Date().toISOString().split('T')[0]
      };

      let response;
      if (isEditing) {
        response = await apiService.updateClient(id, clientData);
      } else {
        response = await apiService.createClient(clientData);
      }
      
      if (response) {
        navigate('/clientes');
      }
    } catch (error) {
      console.error('Error al procesar cliente:', error);
      alert('Error al procesar el cliente. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/clientes');
  };

  if (loading && isEditing) {
    return (
      <div className="client-page-loading">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="client-page">
      {/* Header */}
      <div className="client-page-header">
        <div className="client-page-header-content">
          <div className="client-page-header-top">
            <Button
              icon="pi pi-arrow-left"
              className="p-button-text p-button-plain"
              onClick={handleBack}
              tooltip="Volver a clientes"
            />
            <span className="client-page-breadcrumb">Clientes</span>
          </div>
          <h1 className="client-page-title">
            {isEditing ? (formData.nombre || 'Editar Cliente') : 'Nuevo Cliente'}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="client-page-tabs">
        <button
          className={`client-page-tab ${activeTab === 'detalles' ? 'active' : ''}`}
          onClick={() => setActiveTab('detalles')}
        >
          Detalles
        </button>
        <button
          className={`client-page-tab ${activeTab === 'contacto' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacto')}
        >
          Datos de contacto
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="client-page-form">
        <div className="client-page-form-card">
          <h3 className="client-page-form-title">Datos principales</h3>
          
          <div className="client-page-form-section">
            <div className="client-page-form-row">
              {/* Columna izquierda */}
              <div className="client-page-form-column">
                <div className="client-page-form-field">
                  <label htmlFor="nombre">Nombre del cliente *</label>
                  <InputText
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ingrese el nombre completo"
                    required
                  />
                </div>

                <div className="client-page-form-field">
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

                <div className="client-page-form-field">
                  <label htmlFor="ciudad">Ciudad *</label>
                  <InputText
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    placeholder="Ingrese la ciudad"
                    required
                  />
                </div>

                <div className="client-page-form-field">
                  <label htmlFor="direccion">Dirección</label>
                  <InputText
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Ingrese la dirección"
                  />
                </div>

                <div className="client-page-form-field">
                  <label htmlFor="whatsapp">WhatsApp</label>
                  <InputText
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+51 999 999 999"
                  />
                </div>

                <div className="client-page-form-field">
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

                <div className="client-page-form-field">
                  <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                  <Calendar
                    id="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.value)}
                    dateFormat="dd/mm/yy"
                    placeholder="Seleccione fecha"
                    showIcon
                    icon="pi pi-calendar"
                    inputStyle={{ width: '100%' }}
                    panelStyle={{ zIndex: 1000 }}
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="client-page-form-column">
                <div className="client-page-form-field">
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

                <div className="client-page-form-field">
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

                <div className="client-page-form-field">
                  <label htmlFor="numeroDocumento">Número de documento *</label>
                  <InputText
                    id="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                    placeholder="Ingrese el número"
                    required
                  />
                </div>

                <div className="client-page-form-field">
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

                <div className="client-page-form-field">
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

                <div className="client-page-form-field">
                  <label>Género *</label>
                  <div className="client-page-radio-group">
                    <div className="client-page-radio-option">
                      <RadioButton
                        inputId="masculino"
                        name="genero"
                        value="Masculino"
                        checked={formData.genero === 'Masculino'}
                        onChange={(e) => setFormData(prev => ({ ...prev, genero: e.value }))}
                      />
                      <label htmlFor="masculino" className="client-page-radio-label">Masculino</label>
                    </div>
                    <div className="client-page-radio-option">
                      <RadioButton
                        inputId="femenino"
                        name="genero"
                        value="Femenino"
                        checked={formData.genero === 'Femenino'}
                        onChange={(e) => setFormData(prev => ({ ...prev, genero: e.value }))}
                      />
                      <label htmlFor="femenino" className="client-page-radio-label">Femenino</label>
                    </div>
                  </div>
                </div>

                <div className="client-page-form-field">
                  <label htmlFor="fechaRegistro">Fecha de registro</label>
                  <InputText
                    id="fechaRegistro"
                    value={isEditing && formData.fechaRegistro ? formatDate(formData.fechaRegistro) : formatDate(new Date().toISOString())}
                    disabled
                    className="client-page-disabled-field"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="client-page-form-actions">
          <Button
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={handleBack}
          />
          <Button
            type="submit"
            label="Guardar cambios"
            icon="pi pi-check"
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default ClientPage;
