import { useNavigate, useLocation, Form } from "react-router-dom";
import { useEffect, useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { addLocale } from "primereact/api";
import { useNotification } from "../../../Notification/NotificationContext";
import ProveedoresRepository from "../../../../modules/Proveedores/repository/ProveedoresRepository";
import CreateProveedor from "../../../../modules/Proveedores/application/CreateProveedor";
import UpdateProveedor from "../../../../modules/Proveedores/application/UpdateProveedor";
import "../../styles/DetallesProveedores.css"


const FormProveedor = ({proveedor, setProveedorState, setActiveIndex}) => {
    const proveedoresRepository = new ProveedoresRepository();
    const createProveedor = new CreateProveedor(proveedoresRepository);
    const updateProveedor = new UpdateProveedor(proveedoresRepository);
    const [localProveedorState, setLocalProveedorState] = useState(proveedor || null);

    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const peruCities = ["Lima", "Cusco", "Arequipa", "Trujillo", "Iquitos", "Puno", "Chiclayo", "Piura", "Huaraz", "Nazca", "Aguas calientes"];
    
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

    const [name, setName] = useState(localProveedorState ? localProveedorState.name : '');
    const [legalName, setLegalName] = useState(localProveedorState ? localProveedorState.legal : '');
    const [serviceType, setServiceType] = useState(localProveedorState ? localProveedorState.serviceType : '');
    const [city, setCity] = useState(localProveedorState ? localProveedorState.city : '');
    const [whatsapp, setWhatsapp] = useState(localProveedorState ? localProveedorState.whatsapp : '');
    const [mail, setMail] = useState(localProveedorState ? localProveedorState.mail : '');
    const [language, setLanguage] = useState(localProveedorState && typeof localProveedorState.languages === 'string' ? localProveedorState.languages : '');
    const [documentType, setDocumentType] = useState(localProveedorState ? localProveedorState.documentType : '');
    const [documentNumber, setDocumentNumber] = useState(localProveedorState ? localProveedorState.documentNumber : '');
    const [direction, setDirection] = useState(localProveedorState ? localProveedorState.direction : '');
    const [birthDate, setBirthDate] = useState(localProveedorState && localProveedorState.birthdate ? parseLocalDate(localProveedorState.birthdate) : null);
    const [gender, setGender] = useState(localProveedorState ? localProveedorState.gender : '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [registrationDate, setRegistrationDate] = useState(localProveedorState && localProveedorState.registrationDate ? parseLocalDate(localProveedorState.registrationDate) : today);


    const handleSave = async () => {
        // Validar campos obligatorios
        if (!name || name.trim() === '') {
            showNotification('El nombre del proveedor es obligatorio', 'error');
            return;
        }
        if (!serviceType || serviceType.trim() === '') {
            showNotification('El tipo de servicio es obligatorio', 'error');
            return;
        }

        setLoading(true);
        try {
            if (localProveedorState && localProveedorState.id) {
                const proveedorActualizado = await updateProveedor.execute({
                    ...localProveedorState,
                    name: name,
                    legal: legalName,
                    serviceType: serviceType,
                    city: city,
                    whatsapp: whatsapp,
                    mail: mail,
                    languages: language,
                    documentType: documentType,
                    documentNumber: documentNumber && documentNumber.trim() !== '' ? parseInt(documentNumber, 10) : null,
                    direction: direction,
                    birthdate: birthDate,
                    gender: gender,
                    registrationDate: registrationDate
                });
                setLocalProveedorState(proveedorActualizado);
                if (setProveedorState) setProveedorState(proveedorActualizado);
                showNotification('Proveedor actualizado con éxito!', 'success');
            } else {
                const nuevoProveedor = await createProveedor.execute({
                    name: name.trim(),
                    legal: legalName.trim(),
                    serviceType: serviceType.trim(),
                    city: city.trim(),
                    whatsapp: whatsapp.trim(),
                    mail: mail.trim(),
                    languages: language.trim(),
                    documentType: documentType.trim(),
                    documentNumber: documentNumber && documentNumber.trim() !== '' ? parseInt(documentNumber, 10) : null,
                    direction: direction.trim(),
                    birthdate: birthDate,
                    gender: gender.trim(),
                    registrationDate: registrationDate
                });
                setLocalProveedorState(nuevoProveedor);
                if (setProveedorState) setProveedorState(nuevoProveedor);
                showNotification('Proveedor registrado con éxito!', 'success');
                
                // Cambiar a la pestaña de Medio de contacto después de crear
                if (setActiveIndex) {
                    setTimeout(() => {
                        setActiveIndex(1);
                    }, 500); // Pequeño delay para que se vea la notificación
                }
            }
        } catch (error) {
            showNotification('Error al guardar el proveedor', 'error');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="details">
            <div className="details-header">
                <h3>Datos principales</h3>
            </div>

            <div className="details-form">
                <div className="left">
                    <FloatLabel>
                        <InputText 
                            id="name" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required 
                        />
                        <label htmlFor="name">Nombre del proveedor <span style={{ color: 'red' }}>*</span></label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputText 
                            id="legal" 
                            value={legalName}
                            onChange={e => setLegalName(e.target.value)}
                        />
                        <label htmlFor="legal">Representante legal</label>
                    </FloatLabel>
                    <FloatLabel>
                        <Dropdown
                            inputId="serviceType"
                            value={serviceType}
                            options={["Alojamiento", "Transporte", "Tours", "Guías turísticos", "Restaurantes", "Agencias de viajes", "Otros"]}
                            onChange={e => setServiceType(e.value)}
                            required
                        />
                        <label htmlFor="serviceType">Tipo de servicio <span style={{ color: 'red' }}>*</span></label>
                    </FloatLabel>
                    <FloatLabel>
                        <Dropdown
                            inputId="city"
                            value={city}
                            options={peruCities}
                            onChange={e => setCity(e.value)}
                        />
                        <label htmlFor="city">Ciudad</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputText 
                            id="whatsapp" 
                            value={whatsapp}
                            onChange={e => setWhatsapp(e.target.value)}
                        />
                        <label htmlFor="whatsapp">WhatsApp</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputText 
                            id="mail" 
                            value={mail}
                            onChange={e => setMail(e.target.value)}
                        />
                        <label htmlFor="mail">Correo</label>
                    </FloatLabel>
                    <FloatLabel>
                        <MultiSelect
                            id="language"
                            value={language ? language.split(',') : []}
                            onChange={e => setLanguage(e.value.join(','))}
                            options={["Español", "Inglés", "Francés", "Alemán", "Italiano", "Chino", "Japonés", "Ruso", "Portugués"]}
                            display="chip"
                        />
                        <label htmlFor="language">Idioma</label>
                    </FloatLabel>
                </div>

                <div className="right">
                    <FloatLabel>
                        <Dropdown
                            inputId="documentType"
                            value={documentType}
                            options={["CI", "Pasaporte", "RUC", "Otros"]}
                            onChange={e => setDocumentType(e.value)}
                        />
                        <label htmlFor="documentType">Tipo de documento</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputText 
                            id="documentNumber" 
                            value={documentNumber}
                            onChange={e => setDocumentNumber(e.target.value)}
                        />
                        <label htmlFor="documentNumber">Número de documento</label>
                    </FloatLabel>
                    <FloatLabel>
                        <InputText 
                            id="direction" 
                            value={direction}
                            onChange={e => setDirection(e.target.value)}
                        />
                        <label htmlFor="direction">Dirección</label>
                    </FloatLabel>
                    <FloatLabel>
                        <Calendar
                            id="birthdate"
                            value={birthDate}
                            onChange={e => setBirthDate(e.value)}
                            dateFormat="D dd M y"
                            locale="es"
                        />
                        <label htmlFor="birthdate">Fecha de nacimiento</label>
                    </FloatLabel>

                    <div className="gender">
                        <label htmlFor="gender-m">Masculino</label>
                        <RadioButton
                            inputId="gender-m"
                            name="gender"
                            value="M"
                            onChange={e => setGender(e.value)}
                            checked={gender === 'M'}
                        /> 
                        <label htmlFor="gender-f">Femenino</label>
                        <RadioButton
                            inputId="gender-f"
                            name="gender"
                            value="F"
                            onChange={e => setGender(e.value)}
                            checked={gender === 'F'}
                        />
                    </div>

                    <FloatLabel>
                        <Calendar
                            id="registrationDate"
                            value={registrationDate}
                            onChange={e => setRegistrationDate(e.value)}
                            dateFormat="D dd M y"
                            locale="es"
                            disabled
                        />
                        <label htmlFor="registrationDate">Fecha de registro</label>
                    </FloatLabel>
                </div>
            </div>

            <div className="details-button">
                <Button 
                    label={localProveedorState && localProveedorState.id ? "Guardar cambios" : "Guardar para continuar"}
                    text 
                    disabled={loading} 
                    onClick={handleSave}
                />
            </div>
        </div>

    );
}

export default FormProveedor;