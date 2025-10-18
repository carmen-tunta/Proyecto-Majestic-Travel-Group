import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FloatLabel } from 'primereact/floatlabel';
import { TabMenu } from 'primereact/tabmenu';
import { addLocale } from 'primereact/api';
import { apiService } from '../../../services/apiService';
import ContactRepository from '../../../modules/ClientesContacto/repository/ContactRepository';
import GetContactsByClient from '../../../modules/ClientesContacto/application/GetContactsByClient';
import CreateContact from '../../../modules/ClientesContacto/application/CreateContact';
import UpdateContact from '../../../modules/ClientesContacto/application/UpdateContact';
import DeleteContact from '../../../modules/ClientesContacto/application/DeleteContact';
import '../styles/ClientPage.css';
import { usePermissions } from '../../../contexts/PermissionsContext';

// Configurar locale español para PrimeReact
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

const ClientPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
    genero: 'No especificado',
    estado: 'Registrado'
  });

  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
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
  // Reemplazar la constante paises existente por esta lista completa:
const paises = [
    { label: 'Afganistán', value: 'Afganistán' },
    { label: 'Albania', value: 'Albania' },
    { label: 'Alemania', value: 'Alemania' },
    { label: 'Andorra', value: 'Andorra' },
    { label: 'Angola', value: 'Angola' },
    { label: 'Antigua y Barbuda', value: 'Antigua y Barbuda' },
    { label: 'Arabia Saudita', value: 'Arabia Saudita' },
    { label: 'Argelia', value: 'Argelia' },
    { label: 'Argentina', value: 'Argentina' },
    { label: 'Armenia', value: 'Armenia' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Austria', value: 'Austria' },
    { label: 'Azerbaiyán', value: 'Azerbaiyán' },
    { label: 'Bahamas', value: 'Bahamas' },
    { label: 'Bangladés', value: 'Bangladés' },
    { label: 'Barbados', value: 'Barbados' },
    { label: 'Baréin', value: 'Baréin' },
    { label: 'Bélgica', value: 'Bélgica' },
    { label: 'Belice', value: 'Belice' },
    { label: 'Benín', value: 'Benín' },
    { label: 'Bielorrusia', value: 'Bielorrusia' },
    { label: 'Birmania', value: 'Birmania' },
    { label: 'Bolivia', value: 'Bolivia' },
    { label: 'Bosnia y Herzegovina', value: 'Bosnia y Herzegovina' },
    { label: 'Botsuana', value: 'Botsuana' },
    { label: 'Brasil', value: 'Brasil' },
    { label: 'Brunéi', value: 'Brunéi' },
    { label: 'Bulgaria', value: 'Bulgaria' },
    { label: 'Burkina Faso', value: 'Burkina Faso' },
    { label: 'Burundi', value: 'Burundi' },
    { label: 'Bután', value: 'Bután' },
    { label: 'Cabo Verde', value: 'Cabo Verde' },
    { label: 'Camboya', value: 'Camboya' },
    { label: 'Camerún', value: 'Camerún' },
    { label: 'Canadá', value: 'Canadá' },
    { label: 'Catar', value: 'Catar' },
    { label: 'Chad', value: 'Chad' },
    { label: 'Chile', value: 'Chile' },
    { label: 'China', value: 'China' },
    { label: 'Chipre', value: 'Chipre' },
    { label: 'Colombia', value: 'Colombia' },
    { label: 'Comoras', value: 'Comoras' },
    { label: 'Corea del Norte', value: 'Corea del Norte' },
    { label: 'Corea del Sur', value: 'Corea del Sur' },
    { label: 'Costa de Marfil', value: 'Costa de Marfil' },
    { label: 'Costa Rica', value: 'Costa Rica' },
    { label: 'Croacia', value: 'Croacia' },
    { label: 'Cuba', value: 'Cuba' },
    { label: 'Dinamarca', value: 'Dinamarca' },
    { label: 'Dominica', value: 'Dominica' },
    { label: 'Ecuador', value: 'Ecuador' },
    { label: 'Egipto', value: 'Egipto' },
    { label: 'El Salvador', value: 'El Salvador' },
    { label: 'Emiratos Árabes Unidos', value: 'Emiratos Árabes Unidos' },
    { label: 'Eritrea', value: 'Eritrea' },
    { label: 'Eslovaquia', value: 'Eslovaquia' },
    { label: 'Eslovenia', value: 'Eslovenia' },
    { label: 'España', value: 'España' },
    { label: 'Estados Unidos', value: 'Estados Unidos' },
    { label: 'Estonia', value: 'Estonia' },
    { label: 'Etiopía', value: 'Etiopía' },
    { label: 'Filipinas', value: 'Filipinas' },
    { label: 'Finlandia', value: 'Finlandia' },
    { label: 'Fiyi', value: 'Fiyi' },
    { label: 'Francia', value: 'Francia' },
    { label: 'Gabón', value: 'Gabón' },
    { label: 'Gambia', value: 'Gambia' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Ghana', value: 'Ghana' },
    { label: 'Granada', value: 'Granada' },
    { label: 'Grecia', value: 'Grecia' },
    { label: 'Guatemala', value: 'Guatemala' },
    { label: 'Guinea', value: 'Guinea' },
    { label: 'Guinea-Bisáu', value: 'Guinea-Bisáu' },
    { label: 'Guinea Ecuatorial', value: 'Guinea Ecuatorial' },
    { label: 'Guyana', value: 'Guyana' },
    { label: 'Haití', value: 'Haití' },
    { label: 'Honduras', value: 'Honduras' },
    { label: 'Hungría', value: 'Hungría' },
    { label: 'India', value: 'India' },
    { label: 'Indonesia', value: 'Indonesia' },
    { label: 'Irak', value: 'Irak' },
    { label: 'Irán', value: 'Irán' },
    { label: 'Irlanda', value: 'Irlanda' },
    { label: 'Islandia', value: 'Islandia' },
    { label: 'Islas Marshall', value: 'Islas Marshall' },
    { label: 'Islas Salomón', value: 'Islas Salomón' },
    { label: 'Israel', value: 'Israel' },
    { label: 'Italia', value: 'Italia' },
    { label: 'Jamaica', value: 'Jamaica' },
    { label: 'Japón', value: 'Japón' },
    { label: 'Jordania', value: 'Jordania' },
    { label: 'Kazajistán', value: 'Kazajistán' },
    { label: 'Kenia', value: 'Kenia' },
    { label: 'Kirguistán', value: 'Kirguistán' },
    { label: 'Kiribati', value: 'Kiribati' },
    { label: 'Kuwait', value: 'Kuwait' },
    { label: 'Laos', value: 'Laos' },
    { label: 'Lesoto', value: 'Lesoto' },
    { label: 'Letonia', value: 'Letonia' },
    { label: 'Líbano', value: 'Líbano' },
    { label: 'Liberia', value: 'Liberia' },
    { label: 'Libia', value: 'Libia' },
    { label: 'Liechtenstein', value: 'Liechtenstein' },
    { label: 'Lituania', value: 'Lituania' },
    { label: 'Luxemburgo', value: 'Luxemburgo' },
    { label: 'Madagascar', value: 'Madagascar' },
    { label: 'Malasia', value: 'Malasia' },
    { label: 'Malaui', value: 'Malaui' },
    { label: 'Maldivas', value: 'Maldivas' },
    { label: 'Malí', value: 'Malí' },
    { label: 'Malta', value: 'Malta' },
    { label: 'Marruecos', value: 'Marruecos' },
    { label: 'Mauricio', value: 'Mauricio' },
    { label: 'Mauritania', value: 'Mauritania' },
    { label: 'México', value: 'México' },
    { label: 'Micronesia', value: 'Micronesia' },
    { label: 'Moldavia', value: 'Moldavia' },
    { label: 'Mónaco', value: 'Mónaco' },
    { label: 'Mongolia', value: 'Mongolia' },
    { label: 'Montenegro', value: 'Montenegro' },
    { label: 'Mozambique', value: 'Mozambique' },
    { label: 'Namibia', value: 'Namibia' },
    { label: 'Nauru', value: 'Nauru' },
    { label: 'Nepal', value: 'Nepal' },
    { label: 'Nicaragua', value: 'Nicaragua' },
    { label: 'Níger', value: 'Níger' },
    { label: 'Nigeria', value: 'Nigeria' },
    { label: 'Noruega', value: 'Noruega' },
    { label: 'Nueva Zelanda', value: 'Nueva Zelanda' },
    { label: 'Omán', value: 'Omán' },
    { label: 'Países Bajos', value: 'Países Bajos' },
    { label: 'Pakistán', value: 'Pakistán' },
    { label: 'Palaos', value: 'Palaos' },
    { label: 'Panamá', value: 'Panamá' },
    { label: 'Papúa Nueva Guinea', value: 'Papúa Nueva Guinea' },
    { label: 'Paraguay', value: 'Paraguay' },
    { label: 'Perú', value: 'Perú' },
    { label: 'Polonia', value: 'Polonia' },
    { label: 'Portugal', value: 'Portugal' },
    { label: 'Reino Unido', value: 'Reino Unido' },
    { label: 'República Centroafricana', value: 'República Centroafricana' },
    { label: 'República Checa', value: 'República Checa' },
    { label: 'República del Congo', value: 'República del Congo' },
    { label: 'República Democrática del Congo', value: 'República Democrática del Congo' },
    { label: 'República Dominicana', value: 'República Dominicana' },
    { label: 'Ruanda', value: 'Ruanda' },
    { label: 'Rumanía', value: 'Rumanía' },
    { label: 'Rusia', value: 'Rusia' },
    { label: 'Samoa', value: 'Samoa' },
    { label: 'San Cristóbal y Nieves', value: 'San Cristóbal y Nieves' },
    { label: 'San Marino', value: 'San Marino' },
    { label: 'San Vicente y las Granadinas', value: 'San Vicente y las Granadinas' },
    { label: 'Santa Lucía', value: 'Santa Lucía' },
    { label: 'Santo Tomé y Príncipe', value: 'Santo Tomé y Príncipe' },
    { label: 'Senegal', value: 'Senegal' },
    { label: 'Serbia', value: 'Serbia' },
    { label: 'Seychelles', value: 'Seychelles' },
    { label: 'Sierra Leona', value: 'Sierra Leona' },
    { label: 'Singapur', value: 'Singapur' },
    { label: 'Siria', value: 'Siria' },
    { label: 'Somalia', value: 'Somalia' },
    { label: 'Sri Lanka', value: 'Sri Lanka' },
    { label: 'Suazilandia', value: 'Suazilandia' },
    { label: 'Sudáfrica', value: 'Sudáfrica' },
    { label: 'Sudán', value: 'Sudán' },
    { label: 'Sudán del Sur', value: 'Sudán del Sur' },
    { label: 'Suecia', value: 'Suecia' },
    { label: 'Suiza', value: 'Suiza' },
    { label: 'Surinam', value: 'Surinam' },
    { label: 'Tailandia', value: 'Tailandia' },
    { label: 'Tanzania', value: 'Tanzania' },
    { label: 'Tayikistán', value: 'Tayikistán' },
    { label: 'Timor Oriental', value: 'Timor Oriental' },
    { label: 'Togo', value: 'Togo' },
    { label: 'Tonga', value: 'Tonga' },
    { label: 'Trinidad y Tobago', value: 'Trinidad y Tobago' },
    { label: 'Túnez', value: 'Túnez' },
    { label: 'Turkmenistán', value: 'Turkmenistán' },
    { label: 'Turquía', value: 'Turquía' },
    { label: 'Tuvalu', value: 'Tuvalu' },
    { label: 'Ucrania', value: 'Ucrania' },
    { label: 'Uganda', value: 'Uganda' },
    { label: 'Uruguay', value: 'Uruguay' },
    { label: 'Uzbekistán', value: 'Uzbekistán' },
    { label: 'Vanuatu', value: 'Vanuatu' },
    { label: 'Vaticano', value: 'Vaticano' },
    { label: 'Venezuela', value: 'Venezuela' },
    { label: 'Vietnam', value: 'Vietnam' },
    { label: 'Yemen', value: 'Yemen' },
    { label: 'Yibuti', value: 'Yibuti' },
    { label: 'Zambia', value: 'Zambia' },
    { label: 'Zimbabue', value: 'Zimbabue' }
  ];

  const lenguasNativas = [
    { label: 'Afganistán', value: 'Afganistán' },
    { label: 'Albania', value: 'Albania' },
    { label: 'Alemania', value: 'Alemania' },
    { label: 'Andorra', value: 'Andorra' },
    { label: 'Angola', value: 'Angola' },
    { label: 'Antigua y Barbuda', value: 'Antigua y Barbuda' },
    { label: 'Arabia Saudita', value: 'Arabia Saudita' },
    { label: 'Argelia', value: 'Argelia' },
    { label: 'Argentina', value: 'Argentina' },
    { label: 'Armenia', value: 'Armenia' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Austria', value: 'Austria' },
    { label: 'Azerbaiyán', value: 'Azerbaiyán' },
    { label: 'Bahamas', value: 'Bahamas' },
    { label: 'Bangladés', value: 'Bangladés' },
    { label: 'Barbados', value: 'Barbados' },
    { label: 'Baréin', value: 'Baréin' },
    { label: 'Bélgica', value: 'Bélgica' },
    { label: 'Belice', value: 'Belice' },
    { label: 'Benín', value: 'Benín' },
    { label: 'Bielorrusia', value: 'Bielorrusia' },
    { label: 'Birmania', value: 'Birmania' },
    { label: 'Bolivia', value: 'Bolivia' },
    { label: 'Bosnia y Herzegovina', value: 'Bosnia y Herzegovina' },
    { label: 'Botsuana', value: 'Botsuana' },
    { label: 'Brasil', value: 'Brasil' },
    { label: 'Brunéi', value: 'Brunéi' },
    { label: 'Bulgaria', value: 'Bulgaria' },
    { label: 'Burkina Faso', value: 'Burkina Faso' },
    { label: 'Burundi', value: 'Burundi' },
    { label: 'Bután', value: 'Bután' },
    { label: 'Cabo Verde', value: 'Cabo Verde' },
    { label: 'Camboya', value: 'Camboya' },
    { label: 'Camerún', value: 'Camerún' },
    { label: 'Canadá', value: 'Canadá' },
    { label: 'Catar', value: 'Catar' },
    { label: 'Chad', value: 'Chad' },
    { label: 'Chile', value: 'Chile' },
    { label: 'China', value: 'China' },
    { label: 'Chipre', value: 'Chipre' },
    { label: 'Colombia', value: 'Colombia' },
    { label: 'Comoras', value: 'Comoras' },
    { label: 'Corea del Norte', value: 'Corea del Norte' },
    { label: 'Corea del Sur', value: 'Corea del Sur' },
    { label: 'Costa de Marfil', value: 'Costa de Marfil' },
    { label: 'Costa Rica', value: 'Costa Rica' },
    { label: 'Croacia', value: 'Croacia' },
    { label: 'Cuba', value: 'Cuba' },
    { label: 'Dinamarca', value: 'Dinamarca' },
    { label: 'Dominica', value: 'Dominica' },
    { label: 'Ecuador', value: 'Ecuador' },
    { label: 'Egipto', value: 'Egipto' },
    { label: 'El Salvador', value: 'El Salvador' },
    { label: 'Emiratos Árabes Unidos', value: 'Emiratos Árabes Unidos' },
    { label: 'Eritrea', value: 'Eritrea' },
    { label: 'Eslovaquia', value: 'Eslovaquia' },
    { label: 'Eslovenia', value: 'Eslovenia' },
    { label: 'España', value: 'España' },
    { label: 'Estados Unidos', value: 'Estados Unidos' },
    { label: 'Estonia', value: 'Estonia' },
    { label: 'Etiopía', value: 'Etiopía' },
    { label: 'Filipinas', value: 'Filipinas' },
    { label: 'Finlandia', value: 'Finlandia' },
    { label: 'Fiyi', value: 'Fiyi' },
    { label: 'Francia', value: 'Francia' },
    { label: 'Gabón', value: 'Gabón' },
    { label: 'Gambia', value: 'Gambia' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Ghana', value: 'Ghana' },
    { label: 'Granada', value: 'Granada' },
    { label: 'Grecia', value: 'Grecia' },
    { label: 'Guatemala', value: 'Guatemala' },
    { label: 'Guinea', value: 'Guinea' },
    { label: 'Guinea-Bisáu', value: 'Guinea-Bisáu' },
    { label: 'Guinea Ecuatorial', value: 'Guinea Ecuatorial' },
    { label: 'Guyana', value: 'Guyana' },
    { label: 'Haití', value: 'Haití' },
    { label: 'Honduras', value: 'Honduras' },
    { label: 'Hungría', value: 'Hungría' },
    { label: 'India', value: 'India' },
    { label: 'Indonesia', value: 'Indonesia' },
    { label: 'Irak', value: 'Irak' },
    { label: 'Irán', value: 'Irán' },
    { label: 'Irlanda', value: 'Irlanda' },
    { label: 'Islandia', value: 'Islandia' },
    { label: 'Islas Marshall', value: 'Islas Marshall' },
    { label: 'Islas Salomón', value: 'Islas Salomón' },
    { label: 'Israel', value: 'Israel' },
    { label: 'Italia', value: 'Italia' },
    { label: 'Jamaica', value: 'Jamaica' },
    { label: 'Japón', value: 'Japón' },
    { label: 'Jordania', value: 'Jordania' },
    { label: 'Kazajistán', value: 'Kazajistán' },
    { label: 'Kenia', value: 'Kenia' },
    { label: 'Kirguistán', value: 'Kirguistán' },
    { label: 'Kiribati', value: 'Kiribati' },
    { label: 'Kuwait', value: 'Kuwait' },
    { label: 'Laos', value: 'Laos' },
    { label: 'Lesoto', value: 'Lesoto' },
    { label: 'Letonia', value: 'Letonia' },
    { label: 'Líbano', value: 'Líbano' },
    { label: 'Liberia', value: 'Liberia' },
    { label: 'Libia', value: 'Libia' },
    { label: 'Liechtenstein', value: 'Liechtenstein' },
    { label: 'Lituania', value: 'Lituania' },
    { label: 'Luxemburgo', value: 'Luxemburgo' },
    { label: 'Madagascar', value: 'Madagascar' },
    { label: 'Malasia', value: 'Malasia' },
    { label: 'Malaui', value: 'Malaui' },
    { label: 'Maldivas', value: 'Maldivas' },
    { label: 'Malí', value: 'Malí' },
    { label: 'Malta', value: 'Malta' },
    { label: 'Marruecos', value: 'Marruecos' },
    { label: 'Mauricio', value: 'Mauricio' },
    { label: 'Mauritania', value: 'Mauritania' },
    { label: 'México', value: 'México' },
    { label: 'Micronesia', value: 'Micronesia' },
    { label: 'Moldavia', value: 'Moldavia' },
    { label: 'Mónaco', value: 'Mónaco' },
    { label: 'Mongolia', value: 'Mongolia' },
    { label: 'Montenegro', value: 'Montenegro' },
    { label: 'Mozambique', value: 'Mozambique' },
    { label: 'Namibia', value: 'Namibia' },
    { label: 'Nauru', value: 'Nauru' },
    { label: 'Nepal', value: 'Nepal' },
    { label: 'Nicaragua', value: 'Nicaragua' },
    { label: 'Níger', value: 'Níger' },
    { label: 'Nigeria', value: 'Nigeria' },
    { label: 'Noruega', value: 'Noruega' },
    { label: 'Nueva Zelanda', value: 'Nueva Zelanda' },
    { label: 'Omán', value: 'Omán' },
    { label: 'Países Bajos', value: 'Países Bajos' },
    { label: 'Pakistán', value: 'Pakistán' },
    { label: 'Palaos', value: 'Palaos' },
    { label: 'Panamá', value: 'Panamá' },
    { label: 'Papúa Nueva Guinea', value: 'Papúa Nueva Guinea' },
    { label: 'Paraguay', value: 'Paraguay' },
    { label: 'Perú', value: 'Perú' },
    { label: 'Polonia', value: 'Polonia' },
    { label: 'Portugal', value: 'Portugal' },
    { label: 'Reino Unido', value: 'Reino Unido' },
    { label: 'República Centroafricana', value: 'República Centroafricana' },
    { label: 'República Checa', value: 'República Checa' },
    { label: 'República del Congo', value: 'República del Congo' },
    { label: 'República Democrática del Congo', value: 'República Democrática del Congo' },
    { label: 'República Dominicana', value: 'República Dominicana' },
    { label: 'Ruanda', value: 'Ruanda' },
    { label: 'Rumanía', value: 'Rumanía' },
    { label: 'Rusia', value: 'Rusia' },
    { label: 'Samoa', value: 'Samoa' },
    { label: 'San Cristóbal y Nieves', value: 'San Cristóbal y Nieves' },
    { label: 'San Marino', value: 'San Marino' },
    { label: 'San Vicente y las Granadinas', value: 'San Vicente y las Granadinas' },
    { label: 'Santa Lucía', value: 'Santa Lucía' },
    { label: 'Santo Tomé y Príncipe', value: 'Santo Tomé y Príncipe' },
    { label: 'Senegal', value: 'Senegal' },
    { label: 'Serbia', value: 'Serbia' },
    { label: 'Seychelles', value: 'Seychelles' },
    { label: 'Sierra Leona', value: 'Sierra Leona' },
    { label: 'Singapur', value: 'Singapur' },
    { label: 'Siria', value: 'Siria' },
    { label: 'Somalia', value: 'Somalia' },
    { label: 'Sri Lanka', value: 'Sri Lanka' },
    { label: 'Suazilandia', value: 'Suazilandia' },
    { label: 'Sudáfrica', value: 'Sudáfrica' },
    { label: 'Sudán', value: 'Sudán' },
    { label: 'Sudán del Sur', value: 'Sudán del Sur' },
    { label: 'Suecia', value: 'Suecia' },
    { label: 'Suiza', value: 'Suiza' },
    { label: 'Surinam', value: 'Surinam' },
    { label: 'Tailandia', value: 'Tailandia' },
    { label: 'Tanzania', value: 'Tanzania' },
    { label: 'Tayikistán', value: 'Tayikistán' },
    { label: 'Timor Oriental', value: 'Timor Oriental' },
    { label: 'Togo', value: 'Togo' },
    { label: 'Tonga', value: 'Tonga' },
    { label: 'Trinidad y Tobago', value: 'Trinidad y Tobago' },
    { label: 'Túnez', value: 'Túnez' },
    { label: 'Turkmenistán', value: 'Turkmenistán' },
    { label: 'Turquía', value: 'Turquía' },
    { label: 'Tuvalu', value: 'Tuvalu' },
    { label: 'Ucrania', value: 'Ucrania' },
    { label: 'Uganda', value: 'Uganda' },
    { label: 'Uruguay', value: 'Uruguay' },
    { label: 'Uzbekistán', value: 'Uzbekistán' },
    { label: 'Vanuatu', value: 'Vanuatu' },
    { label: 'Vaticano', value: 'Vaticano' },
    { label: 'Venezuela', value: 'Venezuela' },
    { label: 'Vietnam', value: 'Vietnam' },
    { label: 'Yemen', value: 'Yemen' },
    { label: 'Yibuti', value: 'Yibuti' },
    { label: 'Zambia', value: 'Zambia' },
    { label: 'Zimbabue', value: 'Zimbabue' }
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

  const generos = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Femenino', value: 'Femenino' },
    { label: 'Otro', value: 'Otro' },
    { label: 'No especificado', value: 'No especificado' }
  ];

  // estados (no utilizado) eliminado para limpiar lint

  // Items para TabMenu
  const items = [
    { label: 'Detalles' },
    { label: 'Contactos', disabled: !isEditing }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función auxiliar para construir los datos del cliente
  const buildClientData = () => {
    return {
      ...formData,
      fechaNacimiento: formData.fechaNacimiento ? formData.fechaNacimiento.toISOString().split('T')[0] : null,
      fechaRegistro: isEditing ? formData.fechaRegistro : new Date().toISOString().split('T')[0]
    };
  };

  // Funciones auxiliares para manejar errores específicos
  const handleDuplicateEmailError = () => {
    alert('Error: Ya existe un cliente con este correo electrónico. Por favor, usa un correo diferente.');
  };


  const handleGenericError = () => {
    alert('Error al procesar el cliente. Por favor, inténtalo de nuevo.');
  };

  // Función auxiliar para manejar la respuesta exitosa
  const handleSuccessResponse = (response) => {
    if (!response) return;

    if (!isEditing) {
      // Cliente nuevo: actualizar nombre y cambiar a pestaña de contactos
      if (response.nombre) {
        setFormData(prev => ({ ...prev, nombre: response.nombre }));
      }
      setActiveIndex(1);
    } else {
      // Cliente existente: volver a la lista
      navigate('/clientes');
    }
  };

  // Función auxiliar para procesar el cliente (crear o actualizar)
  const processClient = async (clientData) => {
    if (isEditing) {
      return await apiService.updateClient(id, clientData);
    } else {
      return await apiService.createClient(clientData);
    }
  };

  // Función auxiliar para manejar errores
  const handleError = (error) => {
    console.error('Error al procesar cliente:', error);
    
    if (error.message.includes('Duplicate entry') && error.message.includes('correo')) {
      handleDuplicateEmailError();
    } else {
      handleGenericError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientData = buildClientData();
      const response = await processClient(clientData);
      handleSuccessResponse(response);
    } catch (error) {
      handleError(error);
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

  const { has } = usePermissions();

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

  const requestDeleteContact = (contact) => {
    setContactToDelete(contact);
    setConfirmVisible(true);
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
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="menu-edition">
      {/* Header */}
      <div className="header">
        <div className="header-icon">
          <i className="pi pi-arrow-left" onClick={handleBack}></i>
          <div>Clientes</div>
        </div>
        <div className="proveedor-name">
          {isEditing ? (formData.nombre || 'Editar Cliente') : (formData.nombre || 'Nuevo Cliente')}
        </div>
      </div>

      {/* TabMenu */}
      <TabMenu
        model={items}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      />

      {/* Form - Solo mostrar cuando activeIndex es 0 */}
      {activeIndex === 0 && (
        <div className="details">
          <div className="details-header">
            <h3>Datos principales</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="details-form">
            <div className="left">
                <FloatLabel>
                  <InputText
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                  />
                  <label htmlFor="nombre">Nombre y Apellido <span style={{ color: 'red' }}>*</span></label>
                </FloatLabel>

                <FloatLabel>
                  <Dropdown
                    id="pais"
                    value={formData.pais}
                    options={paises}
                    onChange={(e) => handleInputChange('pais', e.value)}
                    required
                  />
                  <label htmlFor="pais">País</label>
                </FloatLabel>

                <FloatLabel>
                  <InputText
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    required
                  />
                  <label htmlFor="ciudad">Ciudad</label>
                </FloatLabel>

                <FloatLabel>
                  <InputText
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                  />
                  <label htmlFor="direccion">Dirección</label>
                </FloatLabel>

                <FloatLabel>
                  <InputText
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    required
                  />
                  <label htmlFor="whatsapp">Teléfono <span style={{ color: 'red' }}>*</span></label>
                </FloatLabel>

                <FloatLabel>
                  <InputText
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => handleInputChange('correo', e.target.value)}
                    required
                  />
                  <label htmlFor="correo">Correo <span style={{ color: 'red' }}>*</span></label>
                </FloatLabel>

                <FloatLabel>
                  <Calendar
                    id="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.value)}
                    dateFormat="D dd M y"
                    locale="es"
                  />
                  <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                </FloatLabel>
            </div>
            <div className="right">
                <FloatLabel>
                  <Dropdown
                    id="lenguaNativa"
                    value={formData.lenguaNativa}
                    options={lenguasNativas}
                    onChange={(e) => handleInputChange('lenguaNativa', e.value)}
                    required
                  />
                  <label htmlFor="lenguaNativa">Nacionalidad <span style={{ color: 'red' }}>*</span></label>
                </FloatLabel>

                <FloatLabel>
                  <Dropdown
                    id="tipoDocumento"
                    value={formData.tipoDocumento}
                    options={tiposDocumento}
                    onChange={(e) => handleInputChange('tipoDocumento', e.value)}
                    required
                  />
                  <label htmlFor="tipoDocumento">Tipo de documento</label>
                </FloatLabel>

                <FloatLabel>
                  <InputText
                    id="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                    required
                  />
                  <label htmlFor="numeroDocumento">Número de documento</label>
                </FloatLabel>

                <FloatLabel>
                  <Dropdown
                    id="mercado"
                    value={formData.mercado}
                    options={mercados}
                    onChange={(e) => handleInputChange('mercado', e.value)}
                    required
                  />
                  <label htmlFor="mercado">Mercado</label>
                </FloatLabel>

                <FloatLabel>
                  <Dropdown
                    id="rubro"
                    value={formData.rubro}
                    options={rubros}
                    onChange={(e) => handleInputChange('rubro', e.value)}
                    required
                  />
                  <label htmlFor="rubro">Rubro</label>
                </FloatLabel>

                <FloatLabel>
                  <Dropdown
                    id="genero"
                    value={formData.genero}
                    options={generos}
                    onChange={(e) => handleInputChange('genero', e.value)}
                    required
                  />
                  <label htmlFor="genero">Género</label>
                </FloatLabel>

                <FloatLabel>
                  <InputText
                    id="fechaRegistro"
                    value={isEditing && formData.fechaRegistro ? formatDate(formData.fechaRegistro) : formatDate(new Date().toISOString())}
                    disabled
                  />
                  <label htmlFor="fechaRegistro">Fecha de registro</label>
                </FloatLabel>
              </div>
            </div>
            <div className="details-button">
              <Button
                type="submit"
                label={isEditing ? "Guardar cambios" : "Continuar"}
                text
                loading={loading}
                disabled={loading}
              />
            </div>
          </form>
        </div>
      )}

      {/* Sección de Datos de Contacto */}
      {activeIndex === 1 && (
        <>
        <div className="contact">
          <div className="contact-header">
            <h3>Datos de contacto</h3>
            <Button icon="pi pi-plus" label={isMobile ? "Nuevo" : "Nuevo contacto"} size="small" outlined onClick={() => has('CLIENTES','CREATE') && handleNewContact()} disabled={!has('CLIENTES','CREATE')} />
          </div>
          
          <div className="contact-table">
            <table className={`contacts-table ${isMobile ? 'contacts-table-mobile' : ''}`}>
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
                        {has('CLIENTES','EDIT') && (
                        <button
                          type="button"
                          className="contact-action-button contact-edit-button"
                          onClick={() => handleEditContact(contact)}
                          title="Editar"
                          aria-label="Editar contacto"
                        >
                          <i className="pi pi-pencil" />
                        </button>
                        )}
                        {has('CLIENTES','DELETE') && (
                        <button
                          type="button"
                          className="contact-action-button contact-delete-button"
                          onClick={() => requestDeleteContact(contact)}
                          title="Eliminar"
                          aria-label="Eliminar contacto"
                        >
                          <i className="pi pi-trash" />
                        </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <ConfirmDialog
          group="declarative"
          visible={confirmVisible}
          onHide={() => setConfirmVisible(false)}
          message="¿Seguro que  deseas eliminar este medio de contacto?"
          header="Confirmación"
          icon="pi pi-exclamation-triangle"
          accept={() => { if (contactToDelete) { handleDeleteContact(contactToDelete.id); } setContactToDelete(null); setConfirmVisible(false); }}
          reject={() => setConfirmVisible(false)}
          acceptLabel="Sí"
          rejectLabel="No"
        />
        </>
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
                <label htmlFor="contact-medio">Medio *</label>
                <Dropdown
                  id="contact-medio"
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
                <label htmlFor="contact-descripcion">Descripción *</label>
                <InputText
                  id="contact-descripcion"
                  value={contactFormData.descripcion}
                  onChange={(e) => handleContactInputChange('descripcion', e.target.value)}
                  placeholder="Agregar descripción"
                  required
                />
              </div>
              <div className="contact-form-field">
                <label htmlFor="contact-nota">Nota</label>
                <InputText
                  id="contact-nota"
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
