import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { apiService } from '../../../services/apiService';
import ContactRepository from '../../../modules/ClientesContacto/repository/ContactRepository';
import GetContactsByClient from '../../../modules/ClientesContacto/application/GetContactsByClient';
import CreateContact from '../../../modules/ClientesContacto/application/CreateContact';
import UpdateContact from '../../../modules/ClientesContacto/application/UpdateContact';
import DeleteContact from '../../../modules/ClientesContacto/application/DeleteContact';
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
  const [contacts, setContacts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactFormData, setContactFormData] = useState({
    medio: '',
    descripcion: '',
    nota: ''
  });

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

  // Función auxiliar para mapear datos del cliente
  const mapClientData = (client) => {
    return {
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
    };
  };

  // Función auxiliar para manejar errores de carga
  const handleLoadError = (error) => {
    console.error('Error al cargar cliente:', error);
  };

  // Función principal para cargar cliente
  const loadClient = useCallback(async () => {
    try {
      setLoading(true);
      const client = await apiService.getClient(id);
      if (client) {
        setFormData(mapClientData(client));
      }
    } catch (error) {
      handleLoadError(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Cargar datos del cliente a editar
  useEffect(() => {
    if (isEditing && id) {
      loadClient();
    }
  }, [isEditing, id, loadClient]);

  // Cargar contactos del cliente
  const fetchContacts = useCallback(async () => {
    if (isEditing && id) {
      try {
        const contactRepository = new ContactRepository();
        const getContactsByClient = new GetContactsByClient(contactRepository);
        const response = await getContactsByClient.execute(id);
        setContacts(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error al cargar contactos:', error);
        setContacts([]);
      }
    }
  }, [isEditing, id]);

  useEffect(() => {
    if (isEditing && id) {
      fetchContacts();
    }
  }, [isEditing, id, fetchContacts]);

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
          // Si es un cliente nuevo, cambiar a la pestaña de contactos
          if (!isEditing) {
            // Actualizar el formData con la respuesta del servidor para mostrar el nombre
            if (response.nombre) {
              setFormData(prev => ({ ...prev, nombre: response.nombre }));
            }
            setActiveTab('contacto');
          } else {
            // Si es edición, volver a la lista de clientes
            navigate('/clientes');
          }
        }
    } catch (error) {
      console.error('Error al procesar cliente:', error);
      
      // Manejar errores específicos
      if (error.message.includes('Duplicate entry') && error.message.includes('correo')) {
        alert('Error: Ya existe un cliente con este correo electrónico. Por favor, usa un correo diferente.');
      } else if (error.message.includes('Duplicate entry') && error.message.includes('numeroDocumento')) {
        alert('Error: Ya existe un cliente con este número de documento. Por favor, usa un número diferente.');
      } else {
        alert('Error al procesar el cliente. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/clientes');
  };

  // Funciones para manejar contactos
  const handleNewContact = () => {
    setEditingContact(null);
    setContactFormData({ medio: '', descripcion: '', nota: '' });
    setShowContactModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactFormData({
      medio: contact.medio || '',
      descripcion: contact.descripcion || '',
      nota: contact.nota || ''
    });
    setShowContactModal(true);
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      try {
        const contactRepository = new ContactRepository();
        const deleteContact = new DeleteContact(contactRepository);
        await deleteContact.execute(contactId);
        fetchContacts(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar contacto:', error);
        alert('Error al eliminar el contacto');
      }
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const contactRepository = new ContactRepository();
      const contactData = {
        ...contactFormData,
        clientId: parseInt(id)
      };

      if (editingContact) {
        const updateContact = new UpdateContact(contactRepository);
        await updateContact.execute(editingContact.id, contactData);
      } else {
        const createContact = new CreateContact(contactRepository);
        await createContact.execute(contactData);
      }

      setShowContactModal(false);
      fetchContacts(); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar contacto:', error);
      alert('Error al guardar el contacto');
    }
  };

  const handleContactInputChange = (field, value) => {
    setContactFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
            {isEditing ? (formData.nombre || 'Editar Cliente') : (formData.nombre || 'Nuevo Cliente')}
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

      {/* Form - Solo mostrar cuando activeTab es 'detalles' */}
      {activeTab === 'detalles' && (
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
                  <div className="client-page-calendar-container">
                    <InputText
                      id="fechaNacimiento"
                      value={formData.fechaNacimiento ? formatDate(formData.fechaNacimiento) : ''}
                      placeholder="Seleccione fecha"
                      readOnly
                      className="client-page-calendar-input"
                    />
                    <Calendar
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleInputChange('fechaNacimiento', e.value)}
                      showIcon
                      icon="pi pi-calendar"
                      inputStyle={{ width: '100%' }}
                      panelStyle={{ zIndex: 1000 }}
                      className="client-page-calendar-overlay"
                    />
                  </div>
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
              type="submit"
              label={isEditing ? "Guardar cambios" : "Continuar"}
              icon={isEditing ? "pi pi-check" : "pi pi-arrow-right"}
              loading={loading}
              disabled={loading}
            />
          </div>
      </form>
      )}

      {/* Sección de Datos de Contacto */}
      {activeTab === 'contacto' && (
        <div className="client-page-contacts">
          <div className="client-page-contacts-header">
            <h3>Datos de contacto</h3>
            <Button
              label="+ Nuevo"
              size="small"
              onClick={handleNewContact}
            />
          </div>
          
          <div className="client-page-contacts-table">
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Medio</th>
                  <th>Descripción</th>
                  <th>Nota</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-contacts">
                      No hay contactos registrados
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>{contact.medio}</td>
                      <td>{contact.descripcion}</td>
                      <td>{contact.nota || '-'}</td>
                      <td className="contact-actions">
                        <i
                          className="pi pi-pencil"
                          onClick={() => handleEditContact(contact)}
                          title="Editar"
                        />
                        <i
                          className="pi pi-trash"
                          onClick={() => handleDeleteContact(contact.id)}
                          title="Eliminar"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para agregar/editar contacto */}
      {showContactModal && (
        <div className="contact-modal-overlay">
          <div className="contact-modal">
            <div className="contact-modal-header">
              <h3>{editingContact ? 'Editar dato de contacto' : 'Nuevo dato de contacto'}</h3>
              <i
                className="pi pi-times"
                onClick={() => setShowContactModal(false)}
              />
            </div>
            <form onSubmit={handleContactSubmit} className="contact-modal-form">
              <div className="contact-form-field">
                <label>Medio *</label>
                <Dropdown
                  value={contactFormData.medio}
                  options={[
                    { label: 'WhatsApp', value: 'WhatsApp' },
                    { label: 'Correo', value: 'Correo' },
                    { label: 'Red social', value: 'Red social' },
                    { label: 'Persona', value: 'Persona' },
                    { label: 'Teléfono', value: 'Teléfono' },
                    { label: 'Otro', value: 'Otro' }
                  ]}
                  onChange={(e) => handleContactInputChange('medio', e.value)}
                  placeholder="Seleccione medio"
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div className="contact-form-field">
                <label>Descripción *</label>
                <InputText
                  value={contactFormData.descripcion}
                  onChange={(e) => handleContactInputChange('descripcion', e.target.value)}
                  placeholder="Agregar descripción"
                  required
                />
              </div>
              <div className="contact-form-field">
                <label>Nota</label>
                <InputText
                  value={contactFormData.nota}
                  onChange={(e) => handleContactInputChange('nota', e.target.value)}
                  placeholder="Información adicional (opcional)"
                />
              </div>
              <div className="contact-modal-actions">
                <Button
                  type="button"
                  label="Cancelar"
                  className="p-button-text"
                  onClick={() => setShowContactModal(false)}
                />
                <Button
                  type="submit"
                  label="Guardar"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPage;
