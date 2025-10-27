import React, { useState, useEffect } from 'react';
import { useNotification } from '../../Notification/NotificationContext';
import PasajeroRepository from '../../../modules/Pasajeros/repository/PasajeroRepository';
import CreatePasajero from '../../../modules/Pasajeros/application/CreatePasajero';
import CreatePasajeroWithFile from '../../../modules/Pasajeros/application/CreatePasajeroWithFile';
import UpdatePasajero from '../../../modules/Pasajeros/application/UpdatePasajero';
import UpdatePasajeroWithFile from '../../../modules/Pasajeros/application/UpdatePasajeroWithFile';
import '../styles/PasajeroModal.css';
import { Button } from 'primereact/button';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';

const paises = ['Perú', 'Bolivia', 'Chile', 'Argentina', 'Brasil', 'Ecuador', 'Colombia', 'España', 'Estados Unidos', 'Francia'];

export default function PasajeroModal({ 
  isOpen, 
  onClose, 
  cotizacionId, 
  pasajero = null, 
  onSave 
}) {

  const parseLocalDate = (dateString) => {
      if (!dateString) return null;
      const [year, month, day] = dateString.split('-');
      return new Date(year, month - 1, day);
  };
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

  const paises = [
    { label: 'Afganistán', value: 'Afganistán' },
    { label: 'Albania', value: 'Albania' },
    { label: 'Alemania', value: 'Alemania' },
    { label: 'Andorra', value: 'Andorra' },
    { label: 'Angola', value: 'Angola' },
    { label: 'Anguila', value: 'Anguila' },
    { label: 'Antártida', value: 'Antártida' },
    { label: 'Antigua y Barbuda', value: 'Antigua y Barbuda' },
    { label: 'Arabia Saudita', value: 'Arabia Saudita' },
    { label: 'Argelia', value: 'Argelia' },
    { label: 'Argentina', value: 'Argentina' },
    { label: 'Armenia', value: 'Armenia' },
    { label: 'Aruba', value: 'Aruba' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Austria', value: 'Austria' },
    { label: 'Azerbaiyán', value: 'Azerbaiyán' },
    { label: 'Bahamas', value: 'Bahamas' },
    { label: 'Bangladés', value: 'Bangladés' },
    { label: 'Barbados', value: 'Barbados' },
    { label: 'Baréin', value: 'Baréin' },
    { label: 'Belice', value: 'Belice' },
    { label: 'Bélgica', value: 'Bélgica' },
    { label: 'Benín', value: 'Benín' },
    { label: 'Bermudas', value: 'Bermudas' },
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
    { label: 'Cabo Norte', value: 'Cabo Norte' },
    { label: 'Caimán', value: 'Caimán' },
    { label: 'Camboya', value: 'Camboya' },
    { label: 'Camerún', value: 'Camerún' },
    { label: 'Canadá', value: 'Canadá' },
    { label: 'Canarias', value: 'Canarias' },
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
    { label: 'Curazao', value: 'Curazao' },
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
    { label: 'Gibraltar', value: 'Gibraltar' },
    { label: 'Granada', value: 'Granada' },
    { label: 'Grecia', value: 'Grecia' },
    { label: 'Groenlandia', value: 'Groenlandia' },
    { label: 'Guadalupe', value: 'Guadalupe' },
    { label: 'Guam', value: 'Guam' },
    { label: 'Guatemala', value: 'Guatemala' },
    { label: 'Guayana Francesa', value: 'Guayana Francesa' },
    { label: 'Guernsey', value: 'Guernsey' },
    { label: 'Guinea', value: 'Guinea' },
    { label: 'Guinea-Bisáu', value: 'Guinea-Bisáu' },
    { label: 'Guinea Ecuatorial', value: 'Guinea Ecuatorial' },
    { label: 'Guyana', value: 'Guyana' },
    { label: 'Haití', value: 'Haití' },
    { label: 'Honduras', value: 'Honduras' },
    { label: 'Hong Kong', value: 'Hong Kong' },
    { label: 'Hungría', value: 'Hungría' },
    { label: 'India', value: 'India' },
    { label: 'Indonesia', value: 'Indonesia' },
    { label: 'Irak', value: 'Irak' },
    { label: 'Irán', value: 'Irán' },
    { label: 'Irlanda', value: 'Irlanda' },
    { label: 'Isla de Man', value: 'Isla de Man' },
    { label: 'Isla Norfolk', value: 'Isla Norfolk' },
    { label: 'Islandia', value: 'Islandia' },
    { label: 'Islas Aland', value: 'Islas Aland' },
    { label: 'Islas Caimán', value: 'Islas Caimán' },
    { label: 'Islas Cocos', value: 'Islas Cocos' },
    { label: 'Islas Cook', value: 'Islas Cook' },
    { label: 'Islas Faroe', value: 'Islas Faroe' },
    { label: 'Islas Heard y McDonald', value: 'Islas Heard y McDonald' },
    { label: 'Islas Marianas del Norte', value: 'Islas Marianas del Norte' },
    { label: 'Islas Marshall', value: 'Islas Marshall' },
    { label: 'Islas Pitcairn', value: 'Islas Pitcairn' },
    { label: 'Islas Salomón', value: 'Islas Salomón' },
    { label: 'Islas Turcas y Caicos', value: 'Islas Turcas y Caicos' },
    { label: 'Islas Vírgenes Británicas', value: 'Islas Vírgenes Británicas' },
    { label: 'Islas Vírgenes de los Estados Unidos', value: 'Islas Vírgenes de los Estados Unidos' },
    { label: 'Israel', value: 'Israel' },
    { label: 'Italia', value: 'Italia' },
    { label: 'Jamaica', value: 'Jamaica' },
    { label: 'Jan Mayen', value: 'Jan Mayen' },
    { label: 'Japón', value: 'Japón' },
    { label: 'Jersey', value: 'Jersey' },
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
    { label: 'Macao', value: 'Macao' },
    { label: 'Macedonia del Norte', value: 'Macedonia del Norte' },
    { label: 'Madagascar', value: 'Madagascar' },
    { label: 'Malasia', value: 'Malasia' },
    { label: 'Malaui', value: 'Malaui' },
    { label: 'Maldivas', value: 'Maldivas' },
    { label: 'Malí', value: 'Malí' },
    { label: 'Malta', value: 'Malta' },
    { label: 'Marruecos', value: 'Marruecos' },
    { label: 'Martinica', value: 'Martinica' },
    { label: 'Mauricio', value: 'Mauricio' },
    { label: 'Mauritania', value: 'Mauritania' },
    { label: 'Mayotte', value: 'Mayotte' },
    { label: 'México', value: 'México' },
    { label: 'Micronesia', value: 'Micronesia' },
    { label: 'Moldavia', value: 'Moldavia' },
    { label: 'Mónaco', value: 'Mónaco' },
    { label: 'Mongolia', value: 'Mongolia' },
    { label: 'Montenegro', value: 'Montenegro' },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Mozambique', value: 'Mozambique' },
    { label: 'Myanmar', value: 'Myanmar' },
    { label: 'Namibia', value: 'Namibia' },
    { label: 'Nauru', value: 'Nauru' },
    { label: 'Nepal', value: 'Nepal' },
    { label: 'Nicaragua', value: 'Nicaragua' },
    { label: 'Níger', value: 'Níger' },
    { label: 'Nigeria', value: 'Nigeria' },
    { label: 'Niue', value: 'Niue' },
    { label: 'Noruega', value: 'Noruega' },
    { label: 'Nueva Caledonia', value: 'Nueva Caledonia' },
    { label: 'Nueva Zelanda', value: 'Nueva Zelanda' },
    { label: 'Omán', value: 'Omán' },
    { label: 'Países Bajos', value: 'Países Bajos' },
    { label: 'Pakistán', value: 'Pakistán' },
    { label: 'Palaos', value: 'Palaos' },
    { label: 'Palestina', value: 'Palestina' },
    { label: 'Panamá', value: 'Panamá' },
    { label: 'Papúa Nueva Guinea', value: 'Papúa Nueva Guinea' },
    { label: 'Paraguay', value: 'Paraguay' },
    { label: 'Perú', value: 'Perú' },
    { label: 'Polinesia Francesa', value: 'Polinesia Francesa' },
    { label: 'Polonia', value: 'Polonia' },
    { label: 'Portugal', value: 'Portugal' },
    { label: 'Puerto Rico', value: 'Puerto Rico' },
    { label: 'Reino Unido', value: 'Reino Unido' },
    { label: 'República Centroafricana', value: 'República Centroafricana' },
    { label: 'República Checa', value: 'República Checa' },
    { label: 'República del Congo', value: 'República del Congo' },
    { label: 'República Democrática del Congo', value: 'República Democrática del Congo' },
    { label: 'República Dominicana', value: 'República Dominicana' },
    { label: 'Reunión', value: 'Reunión' },
    { label: 'Ruanda', value: 'Ruanda' },
    { label: 'Rumanía', value: 'Rumanía' },
    { label: 'Rusia', value: 'Rusia' },
    { label: 'Sahara Occidental', value: 'Sahara Occidental' },
    { label: 'Saint-Barthélemy', value: 'Saint-Barthélemy' },
    { label: 'Saint-Pierre y Miquelon', value: 'Saint-Pierre y Miquelon' },
    { label: 'Samoa', value: 'Samoa' },
    { label: 'Samoa Americana', value: 'Samoa Americana' },
    { label: 'San Cristóbal y Nieves', value: 'San Cristóbal y Nieves' },
    { label: 'San Marino', value: 'San Marino' },
    { label: 'San Martín', value: 'San Martín' },
    { label: 'San Vicente y las Granadinas', value: 'San Vicente y las Granadinas' },
    { label: 'Santa Helena', value: 'Santa Helena' },
    { label: 'Santa Lucía', value: 'Santa Lucía' },
    { label: 'Santo Tomé y Príncipe', value: 'Santo Tomé y Príncipe' },
    { label: 'Senegal', value: 'Senegal' },
    { label: 'Serbia', value: 'Serbia' },
    { label: 'Seychelles', value: 'Seychelles' },
    { label: 'Sierra Leona', value: 'Sierra Leona' },
    { label: 'Singapur', value: 'Singapur' },
    { label: 'Sint Maarten', value: 'Sint Maarten' },
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
    { label: 'Svalbard y Jan Mayen', value: 'Svalbard y Jan Mayen' },
    { label: 'Tailandia', value: 'Tailandia' },
    { label: 'Taiwán', value: 'Taiwán' },
    { label: 'Tanzania', value: 'Tanzania' },
    { label: 'Tayikistán', value: 'Tayikistán' },
    { label: 'Territorio Británico del Océano Índico', value: 'Territorio Británico del Océano Índico' },
    { label: 'Timor Oriental', value: 'Timor Oriental' },
    { label: 'Togo', value: 'Togo' },
    { label: 'Tokelau', value: 'Tokelau' },
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
    { label: 'Wallis y Futuna', value: 'Wallis y Futuna' },
    { label: 'Yemen', value: 'Yemen' },
    { label: 'Yibuti', value: 'Yibuti' },
    { label: 'Zambia', value: 'Zambia' },
    { label: 'Zimbabue', value: 'Zimbabue' }
  ];

  const nacionalidades = paises;

  const tiposDocumento = [
    { label: 'DNI', value: 'DNI' },
    { label: 'Pasaporte', value: 'Pasaporte' },
    { label: 'Cédula', value: 'Cédula' },
    { label: 'Carné de extranjería', value: 'Carné de extranjería' },
    { label: 'Otros', value: 'Otros' }
  ];

  const generos = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Femenino', value: 'Femenino' },
    { label: 'Otro', value: 'Otro' },
    { label: 'No especificado', value: 'No especificado' }
  ];

  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    descripcionDocumento: '',
    archivo: null,
    nombreArchivo: '',
    whatsapp: '',
    correo: '',
    fechaNacimiento: null,
    tipoDocumento: '',
    numeroDocumento: '',
    genero: '',
    nacionalidad: ''
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
        pais: pasajero.pais || '',
        descripcionDocumento: pasajero.descripcionDocumento || '',
        archivo: null,
        nombreArchivo: pasajero.nombreArchivo || '',
        whatsapp: pasajero.whatsapp || '',
        correo: pasajero.correo || '',
        fechaNacimiento: pasajero.fechaNacimiento ? parseLocalDate(pasajero.fechaNacimiento) : null,
        tipoDocumento: pasajero.tipoDocumento || null,
        numeroDocumento: pasajero.numeroDocumento || '',
        genero: pasajero.genero || '',
        nacionalidad: pasajero.nacionalidad || null
      });
      setArchivoPreview(pasajero.nombreArchivo ? pasajero.nombreArchivo : null);
    } else {
      // Reset form for new pasajero
      setFormData({
        nombre: '',
        pais: '',
        descripcionDocumento: '',
        archivo: null,
        nombreArchivo: '',
        whatsapp: '',
        correo: '',
        fechaNacimiento: null,
        tipoDocumento: null,
        numeroDocumento: '',
        genero: '',
        nacionalidad: null
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
        cotizacionId: cotizacionId,
        nombre: formData.nombre,
        pais: formData.pais,
        descripcionDocumento: formData.descripcionDocumento,
        nacionalidad: formData.nacionalidad,
        whatsapp: formData.whatsapp,
        correo: formData.correo,
        fechaNacimiento: formData.fechaNacimiento,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        genero: formData.genero,
        nacionalidad: formData.nacionalidad

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
                filter
              />
              <label htmlFor="pais">País de residencia <span style={{ color: 'red' }}>*</span></label>
            </FloatLabel>

            <FloatLabel>
              <InputText
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              />
              <label htmlFor="whatsapp">Teléfono</label>
            </FloatLabel>

            <FloatLabel>
              <InputText
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
              />
              <label htmlFor="correo">Correo</label>
            </FloatLabel>

            <FloatLabel>
              <Calendar
                id="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={(e) => handleInputChange('fechaNacimiento', e.value)}
                dateFormat="D dd M y"
                locale="es"
                required
              />
              <label htmlFor="fechaNacimiento">Fecha de nacimiento <span style={{ color: 'red' }}>*</span></label>
            </FloatLabel>
          </div>

          

          <div className="right">
            <FloatLabel>
              <Dropdown
                id="nacionalidad"
                value={formData.nacionalidad}
                options={nacionalidades}
                onChange={(e) => handleInputChange('nacionalidad', e.value)}
                required
                filter
              />
              <label htmlFor="nacionalidad">Nacionalidad <span style={{ color: 'red' }}>*</span></label>
            </FloatLabel>

            <FloatLabel>
              <Dropdown
                id="tipoDocumento"
                value={formData.tipoDocumento}
                options={tiposDocumento}
                onChange={(e) => handleInputChange('tipoDocumento', e.value)}
                required
              />
              <label htmlFor="tipoDocumento">Tipo de documento <span style={{ color: 'red' }}>*</span></label>
            </FloatLabel>

            <FloatLabel>
              <InputText
                id="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                required
              />
              <label htmlFor="numeroDocumento">Número de documento <span style={{ color: 'red' }}>*</span></label>
            </FloatLabel>

            <FloatLabel>
              <Dropdown
                id="genero"
                value={formData.genero}
                options={generos}
                onChange={(e) => handleInputChange('genero', e.value)}
              />
              <label htmlFor="genero">Género</label>
            </FloatLabel>
          </div>
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
