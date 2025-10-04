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

const ContactoPortada = ({service}) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const fileUploadRef = useRef(null);

    const [titulo, setTitulo] = useState('Título');
    const [contacto, setContacto] = useState('Contacto');
    const [links, setLinks] = useState('Links');
    const [imagen, setImagen] = useState(null);

    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState(titulo);
    const [loading, setLoading] = useState(false);

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

    const handleEditarTitulo = () => {
        setTitulo(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { tituloContacto: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el título de la portada:', error);
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

    const handleEditOpen = () => {
        setEditorContent(titulo);
        setShowEditor(true);
    };

    const handleClose = () => {
        if (showEditor) {
            setShowEditor(false);
        }
    };

    return (
        <>
            {loading ? (
                <ProgressSpinner className='spinner-portada-container'/>) 
                : (
                <div className="contacto-portada-container" onClick={handleClose}>
                    <div className="contacto-content">
                        <div className="titulo-container">
                            <i className="pi pi-pencil icono-titulo" onClick={handleEditOpen}></i>
                            <div 
                                className="titulo"
                                dangerouslySetInnerHTML={{ __html: titulo }}
                            ></div>
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
                <div className="editor-centro editor-container">
                    <Editor
                        value={editorContent} 
                        onTextChange={(e) => setEditorContent(e.htmlValue)}
                        style={{ border: 'none' }}
                    />
                        <Button
                            outlined
                            size='small'
                            label="Aceptar" 
                            onClick={handleEditarTitulo}
                            className="accept-button editor-actions"
                        />
                </div>
            )}
        </>
    );
};

export default ContactoPortada;