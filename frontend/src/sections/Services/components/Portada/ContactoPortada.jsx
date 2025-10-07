import { Button } from "primereact/button";
import { Editor } from "primereact/editor";
import { FileUpload } from "primereact/fileupload";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEffect, useRef, useState } from "react";

import "../../styles/Portada/ContactoPortada.css"
import ServicePortadaRepository from "../../../../modules/Service/repository/ServicePortadaRepository";
import GetPortadaByServiceId from "../../../../modules/Service/application/GetPortadaByServiceId";
import CreateOrUpdatePortada from "../../../../modules/Service/application/CreateOrUpdatePortada";
import uploadImageContact from "../../../../modules/Service/application/UploadImageContact";
import AgregarPlantillaItinerario from "./AgregarPlantillaItinerario";
import { useModal } from "../../../../contexts/ModalContext";

const ContactoPortada = ({service}) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const fileUploadRef = useRef(null);

    const [titulo, setTitulo] = useState('Título');
    const [contacto, setContacto] = useState('Contacto');
    const [links, setLinks] = useState('Links');
    const [imagen, setImagen] = useState(null);

    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState(titulo);
    const [tipoEdicion, setTipoEdicion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detectedLinks, setDetectedLinks] = useState([]);
    const [processedContacto, setProcessedContacto] = useState('Contacto');
    const [showModal, setShowModal] = useState(false);
    const { setIsModalOpen } = useModal();

    const portadaRepo = new ServicePortadaRepository();
    const getPortada = new GetPortadaByServiceId(portadaRepo);
    const updatePortada = new CreateOrUpdatePortada(portadaRepo);
    const imageContact = new uploadImageContact(portadaRepo);


    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getPortada.execute(service.id);
            if (result) {
                setTitulo(result.tituloContacto || 'Título');
                setContacto(result.contenidoContacto || 'Contacto');
                setImagen(result.imagenContacto || null);
            }
        } catch (error) {
            console.error('Error al obtener la portada:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        try {
            fetchData();
        } catch (error) {
            console.error('Error al obtener la portada:', error);
        }
    }, [service]);

    useEffect(() => {
        const container = document.querySelector('.contacto-portada-container');
            if (container) {
                const backgroundImage = `url(${baseUrl}/${imagen})`;
                container.style.setProperty('--bg-contacto-portada-image', backgroundImage);
            }
    }, [imagen]);

    useEffect(() => {
        const extractLinks = () => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contacto;
            const links = tempDiv.querySelectorAll('a');
            
            const linkData = Array.from(links).map((link, index) => ({
                id: index,
                url: link.href,
                text: link.textContent,
                icon: detectLinkType(link.href)
            }));
            
            setDetectedLinks(linkData);
        };
        
        if (contacto && contacto !== 'Contacto') {
            extractLinks();
            setProcessedContacto(processContactoWithIcons(contacto));
        } else {
            setProcessedContacto(contacto);
        }
    }, [contacto]);

    const handleEditarTitulo = () => {
        setTitulo(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { tituloContacto: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el título de la portada:', error);
        }
    }

    const handleEditarContacto = () => {
        setContacto(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { contenidoContacto: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar la información de contacto de la portada:', error);
        }
    }

    const handleImageUpload = async (event) => {
        const file = event.files[0];
        if (file) {
            try {
                setLoading(true);
                const result = await imageContact.execute(service.id, file);
                if (result && result.imagenContacto) {
                    setImagen(result.imagenContacto);
                }
                if (fileUploadRef.current) { fileUploadRef.current.clear(); }
            } catch (error) {
                console.error('Error al subir la imagen:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleImageIconClick = (e) => {
        e.stopPropagation();
        if (fileUploadRef.current) {
            const input = fileUploadRef.current.getInput();
            if (input) {
                input.click();
            }
        }
    };

    const handleEditOpen = (tipo) => {
        if (tipo === 'titulo') {
            setEditorContent(titulo);
        }
        else if (tipo === 'contacto') {
            setEditorContent(contacto);
        }
        else if (tipo === 'links') {
            setEditorContent(links);
        }
        setTipoEdicion(tipo);
        setShowEditor(true);
    };

    const handleClose = () => {
        if (showEditor) {
            setShowEditor(false);
        }
    };

    const handleAccept = () => {
        if (tipoEdicion === 'titulo') {
            handleEditarTitulo();
        } else if (tipoEdicion === 'contacto') {
            handleEditarContacto();
        } else if (tipoEdicion === 'links') {
            setLinks(editorContent);
        }
        setShowEditor(false);
        setEditorContent('');
        setTipoEdicion(null);
    }

    const detectLinkType = (url) => {
        if (!url) return null;
        
        const lowerUrl = url.toLowerCase();
        
        if (lowerUrl.includes('whatsapp') || lowerUrl.includes('wa.me')) {
            return 'pi pi-whatsapp';
        }
        if (lowerUrl.includes('maps.google') || lowerUrl.includes('goo.gl/maps') || lowerUrl.includes('maps.app.goo.gl')) {
            return 'pi pi-map-marker';
        }
        if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
            return 'pi pi-facebook';
        }
        if (lowerUrl.includes('instagram.com')) {
            return 'pi pi-instagram';
        }
        if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
            return 'pi pi-twitter';
        }
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
            return 'pi pi-youtube';
        }
        if (lowerUrl.includes('linkedin.com')) {
            return 'pi pi-linkedin';
        }
        if (lowerUrl.includes('mailto:')) {
            return 'pi pi-envelope';
        }
        if (lowerUrl.includes('tel:')) {
            return 'pi pi-phone';
        }
        return 'pi pi-external-link';
    };

    const processContactoWithIcons = (htmlContent) => {
        if (!htmlContent || htmlContent === 'Contacto') return htmlContent;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const links = tempDiv.querySelectorAll('a');
        
        links.forEach((link) => {
            const icon = detectLinkType(link.href);
            if (icon) {
                const iconElement = document.createElement('i');
                const linkColor = link.style.color || getComputedStyle(link).color;
                iconElement.className = `${icon} link-content-icon`;
                iconElement.style.color = linkColor;
                link.parentNode.insertBefore(iconElement, link);
            }
        });
        
        return tempDiv.innerHTML;
    };

    const handleModalOpen = () => {
        setShowModal(true);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsModalOpen(false);
    };

    const handleTemplateSelected = (template) => {
        try {
            updatePortada.execute(service.id, { tituloContacto:template.templateTitle, contenidoContacto: template.description }, null);
            setContacto(template.description);
            setTitulo(template.templateTitle);
        } catch (error) {
            console.error('Error al actualizar el contenido de la portada con la plantilla:', error);
        }
    };

    return (
        <>
            {loading ? (
                <ProgressSpinner className='spinner-portada-container'/>) 
                : (
                <div className="contacto-portada-container" onClick={handleClose}>
                    <div className="contacto-content">
                        <div>
                            <div className="titulo-container">
                                <div 
                                    className="titulo"
                                    dangerouslySetInnerHTML={{ __html: titulo }}
                                ></div>
                                <i className="pi pi-pencil icono-titulo" onClick={() => handleEditOpen('titulo')}></i>
                            </div>
                            <div className="contacto-container">
                                <div 
                                    className="contacto"
                                    dangerouslySetInnerHTML={{ __html: processedContacto }}    
                                ></div>
                                <i className="pi pi-pencil icono-contacto" onClick={() => handleEditOpen('contacto')}></i>
                                <i 
                                    className="pi pi-database icono-db"
                                    style={{marginLeft: '10px'}}
                                    onClick={handleModalOpen}
                                ></i>    
                            </div>
                        </div>
                        <div className="links">
                            {detectedLinks.length > 0 ? (
                                <div className="links-icons">
                                    {detectedLinks.map((link) => (
                                        <a 
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link-icon"
                                            title={link.text}
                                        >
                                            <i className={link.icon}></i>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <span>Links</span>
                            )}
                        </div>
                    </div>
                    <i 
                        className="pi pi-image icono-imagen" 
                        onClick={handleImageIconClick}
                        title='Seleccionar imagen de fondo'
                    ></i>
                    <FileUpload
                        ref={fileUploadRef}
                        mode="basic"
                        name="image"
                        accept="image/*"
                        maxFileSize={10000000} // 10MB
                        onSelect={handleImageUpload} // Usar onSelect en lugar de onUpload
                        chooseOptions={{ style: { display: 'none' } }} // Ocultar el botón
                        style={{ display: 'none' }} // Ocultar completamente el componente
                        auto={false} // No subir automáticamente
                    />
                </div>
            )}
            {showEditor && (
                <div className="editor-contacto editor-container">
                    <Editor
                        value={editorContent} 
                        onTextChange={(e) => setEditorContent(e.htmlValue)}
                        style={{ border: 'none' }}
                    />
                        <Button
                            outlined
                            size='small'
                            label="Aceptar" 
                            onClick={handleAccept}
                            className="accept-button editor-actions"
                        />
                </div>
            )}

            {showModal &&(
                <AgregarPlantillaItinerario
                    onHide={handleModalClose}
                    onSelectTemplate={handleTemplateSelected}
                />
            )}
        </>
    );
};

export default ContactoPortada;