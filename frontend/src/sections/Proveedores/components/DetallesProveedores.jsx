import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import "../styles/DetallesProveedores.css"

const DetallesProveedores = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const proveedor = location.state?.proveedor;
    const [activeIndex, setActiveIndex] = useState(0);

    const [name, setName] = useState(proveedor ? proveedor.name : '');
    const [legalName, setLegalName] = useState(proveedor ? proveedor.legalName : '');
    const [serviceType, setServiceType] = useState(proveedor ? proveedor.serviceType : '');
    const [city, setCity] = useState(proveedor ? proveedor.city : '');
    const [whatsapp, setWhatsapp] = useState(proveedor ? proveedor.whatsapp : '');
    const [mail, setMail] = useState(proveedor ? proveedor.mail : '');
    const [language, setLanguage] = useState(proveedor ? proveedor.language : '');
    const [documentType, setDocumentType] = useState(proveedor ? proveedor.documentType : '');
    const [documentNumber, setDocumentNumber] = useState(proveedor ? proveedor.documentNumber : '');
    const [direction, setDirection] = useState(proveedor ? proveedor.direction : '');
    const [birthDate, setBirthDate] = useState(proveedor ? proveedor.birthDate : '');
    const [gender, setGender] = useState(proveedor ? proveedor.gender : '');
    const [registrationDate, setRegistrationDate] = useState(proveedor ? proveedor.registrationDate : '');


    const items = [
        { label: 'Detalles'},
        { label: 'Medio de contacto', disabled: !proveedor },
    ];
    
    const onClose = () => {
        navigate(-1);
    };


    return (
        <div className="menu-edition">
            <div className="header">
                <i className="pi pi-arrow-left" onClick={onClose}></i>
                <h3>Proveedores</h3>
                <div>{proveedor?.name}</div>
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
                                    className="p-inputtext-sm" 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required 
                                />
                                <label htmlFor="name">Nombre del proveedor</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="legal" 
                                    className="p-inputtext-sm" 
                                    value={legalName}
                                    onChange={e => setLegalName(e.target.value)}
                                    required 
                                />
                                <label htmlFor="legal">Representante legal</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="serviceType" 
                                    className="p-inputtext-sm" 
                                    value={serviceType}
                                    onChange={e => setServiceType(e.target.value)}
                                    required 
                                />
                                <label htmlFor="serviceType">Tipo de servicio</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="city" 
                                    className="p-inputtext-sm" 
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    required 
                                />
                                <label htmlFor="city">Ciudad</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="whatsapp" 
                                    className="p-inputtext-sm" 
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    required 
                                />
                                <label htmlFor="whatsapp">WhatsApp</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="mail" 
                                    className="p-inputtext-sm" 
                                    value={mail}
                                    onChange={e => setMail(e.target.value)}
                                    required 
                                />
                                <label htmlFor="mail">Correo</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="language" 
                                    className="p-inputtext-sm" 
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    required 
                                />
                                <label htmlFor="language">Idioma</label>
                            </FloatLabel>
                        </div>

                        <div className="right">
                            <FloatLabel>
                                <InputText 
                                    id="documentType" 
                                    className="p-inputtext-sm" 
                                    value={documentType}
                                    onChange={e => setDocumentType(e.target.value)}
                                    required 
                                />
                                <label htmlFor="documentType">Tipo de documento</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="documentNumber" 
                                    className="p-inputtext-sm" 
                                    value={documentNumber}
                                    onChange={e => setDocumentNumber(e.target.value)}
                                    required 
                                />
                                <label htmlFor="documentNumber">Número de documento</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="direction" 
                                    className="p-inputtext-sm" 
                                    value={direction}
                                    onChange={e => setDirection(e.target.value)}
                                    required 
                                />
                                <label htmlFor="direction">Dirección</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText 
                                    id="birthdate" 
                                    className="p-inputtext-sm" 
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.target.value)}
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
                                <InputText 
                                    id="registrationDate" 
                                    className="p-inputtext-sm" 
                                    value={registrationDate}
                                    onChange={e => setRegistrationDate(e.target.value)}
                                    required 
                                />
                                <label htmlFor="registrationDate">Fecha de registro</label>
                            </FloatLabel>
                        </div>
                    </div>

                    <div className="details-button">
                        <Button label="Guardar cambios" text/>
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