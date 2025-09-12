import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import ProveedoresRepository from "../../../modules/Proveedores/repository/ProveedoresRepository";
import CreateProveedor from "../../../modules/Proveedores/application/CreateProveedor";
import UpdateProveedor from "../../../modules/Proveedores/application/UpdateProveedor";
import { useNotification } from "../../Notification/NotificationContext";
import "../styles/DetallesProveedores.css"


const DetallesProveedores = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const proveedor = location.state?.proveedor;
    const [activeIndex, setActiveIndex] = useState(0);

    const proveedoresRepository = new ProveedoresRepository();
    const createProveedor = new CreateProveedor(proveedoresRepository);
    const updateProveedor = new UpdateProveedor(proveedoresRepository);
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const peruCities = ["Lima", "Cusco", "Arequipa", "Trujillo", "Iquitos", "Puno", "Chiclayo", "Piura", "Huaraz", "Nazca"];
    const parseLocalDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    };


    const [name, setName] = useState(proveedor ? proveedor.name : '');
    const [legalName, setLegalName] = useState(proveedor ? proveedor.legal : '');
    const [serviceType, setServiceType] = useState(proveedor ? proveedor.serviceType : '');
    const [city, setCity] = useState(proveedor ? proveedor.city : '');
    const [whatsapp, setWhatsapp] = useState(proveedor ? proveedor.whatsapp : '');
    const [mail, setMail] = useState(proveedor ? proveedor.mail : '');
    const [language, setLanguage] = useState(proveedor ? proveedor.languages : '');
    const [documentType, setDocumentType] = useState(proveedor ? proveedor.documentType : '');
    const [documentNumber, setDocumentNumber] = useState(proveedor ? proveedor.documentNumber : '');
    const [direction, setDirection] = useState(proveedor ? proveedor.direction : '');
    const [birthDate, setBirthDate] = useState(proveedor && proveedor.birthdate ? parseLocalDate(proveedor.birthdate) : null);
    const [gender, setGender] = useState(proveedor ? proveedor.gender : '');
    const [registrationDate, setRegistrationDate] = useState(proveedor && proveedor.registrationDate ? parseLocalDate(proveedor.registrationDate) : null);


    const items = [
        { label: 'Detalles'},
        { label: 'Medio de contacto', disabled: !proveedor },
    ];
    
    const onClose = () => {
        navigate(-1);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (proveedor && proveedor.id) {
                await updateProveedor.execute({
                    ...proveedor,
                    name: name,
                    legal: legalName,
                    serviceType: serviceType,
                    city: city,
                    whatsapp: whatsapp,
                    mail: mail,
                    languages: language,
                    documentType: documentType,
                    documentNumber: documentNumber,
                    direction: direction,
                    birthdate: birthDate,
                    gender: gender,
                    registrationDate: registrationDate
                });
            showNotification('Proveedor actualizado con éxito!', 'success');
        } else {
            await createProveedor.execute({
                name: name.trim(),
                legal: legalName.trim(),
                serviceType: serviceType.trim(),
                city: city.trim(),
                whatsapp: whatsapp.trim(),
                mail: mail.trim(),
                languages: language.trim(),
                documentType: documentType.trim(),
                documentNumber: documentNumber.trim(),
                direction: direction.trim(),
                birthdate: birthDate,
                gender: gender.trim(),
                registrationDate: registrationDate
            });
            showNotification('Proveedor registrado con éxito!', 'success');
        }
        } catch (error) {
            showNotification('Error al guardar el proveedor', 'error');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="menu-edition">
            <div className="header">
                <div className="header-icon">
                    <i className="pi pi-arrow-left" onClick={onClose}></i>
                    <div>Proveedores</div>
                </div>
                <div className="proveedor-name">{proveedor?.name}</div>
            </div>
            <TabMenu 
                model={items} 
                activeIndex={activeIndex} 
                onTabChange={(e) => setActiveIndex(e.index)} 
            />

            {activeIndex === 0 && (
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
                                <label htmlFor="name">Nombre del proveedor</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="legal" 
                                    value={legalName}
                                    onChange={e => setLegalName(e.target.value)}
                                    required 
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
                                <label htmlFor="serviceType">Tipo de servicio</label>
                            </FloatLabel>
                            <FloatLabel>
                                <Dropdown
                                    inputId="city"
                                    value={city}
                                    options={peruCities}
                                    onChange={e => setCity(e.value)}
                                    required
                                />
                                <label htmlFor="city">Ciudad</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="whatsapp" 
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    required 
                                />
                                <label htmlFor="whatsapp">WhatsApp</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="mail" 
                                    value={mail}
                                    onChange={e => setMail(e.target.value)}
                                    required 
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
                                    required
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
                                    required
                                />
                                <label htmlFor="documentType">Tipo de documento</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="documentNumber" 
                                    value={documentNumber}
                                    onChange={e => setDocumentNumber(e.target.value)}
                                    required 
                                />
                                <label htmlFor="documentNumber">Número de documento</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="direction" 
                                    value={direction}
                                    onChange={e => setDirection(e.target.value)}
                                    required 
                                />
                                <label htmlFor="direction">Dirección</label>
                            </FloatLabel>
                            <FloatLabel>
                                <Calendar
                                    id="birthdate"
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.value)}
                                    required
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
                                    required
                                />
                                <label htmlFor="registrationDate">Fecha de registro</label>
                            </FloatLabel>
                        </div>
                    </div>

                    <div className="details-button">
                        <Button 
                            label="Guardar cambios" 
                            text 
                            disabled={loading} 
                            onClick={handleSave}
                        />
                    </div>
                </div>
            )}
            {activeIndex === 1 && (
                <div className="contact">
                    {/* Contenido de la pestaña Medio de contacto */}
                    <p>WhatsApp: {proveedor?.whatsapp}</p>
                    <p>Correo: {proveedor?.mail}</p>
                    {/* ...otros datos de contacto... */}
                </div>
            )}

        </div>
    )
}

export default DetallesProveedores;