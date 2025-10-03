import { Dialog } from 'primereact/dialog';
import '../../styles/Portada/TituloPortada.css'
import { use, useEffect, useState, useRef } from "react";
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import ServicePortadaRepository from '../../../../modules/Service/repository/ServicePortadaRepository';
import GetPortadaByServiceId from '../../../../modules/Service/application/GetPortadaByServiceId';
import CreateOrUpdatePortada from '../../../../modules/Service/application/CreateOrUpdatePortada';
import { FileUpload } from 'primereact/fileupload';

const TituloPortada = ({ service }) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const fileUploadRef = useRef(null);

    const [titulo, setTitulo] = useState('Título');
    const [imagen, setImagen] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState(titulo);
    const [loading, setLoading] = useState(false);

    const portadaRepo = new ServicePortadaRepository();
    const getPortada = new GetPortadaByServiceId(portadaRepo);
    const updatePortada = new CreateOrUpdatePortada(portadaRepo);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getPortada.execute(service.id);
            if (result) {
                setTitulo(result.titulo || 'Título');
                setImagen(result.imagenCentro || null);
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
        const container = document.querySelector('.portada-container');
            if (container) {
                const backgroundImage = `url(${baseUrl}/${imagen})`;
                container.style.setProperty('--bg-portada-centro-image', backgroundImage);
            }
    }, [imagen]);


    const handleEditarTitulo = () => {
        setTitulo(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { titulo: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el título de la portada:', error);
        }
    }

    const handleImageUpload = async (event) => {
        const file = event.files[0];
        if (file) {
            try {
                setLoading(true);
                const result = await updatePortada.execute(service.id, { titulo }, file);
                if (result && result.imagenCentro) {
                    setImagen(result.imagenCentro);
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
                <div className="portada-container" onClick={handleClose}>
                    <div className="titulo-portada-container">
                        <i className="pi pi-pencil icono-titulo" onClick={handleEditOpen}></i>
                        <div 
                            className="titulo-portada"
                            dangerouslySetInnerHTML={{ __html: titulo }}
                        ></div>
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

export default TituloPortada;