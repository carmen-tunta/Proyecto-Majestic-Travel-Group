import { useEffect, useRef, useState } from 'react';
import '../../styles/Portada/TituloIzquierda.css';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import ServicePortadaRepository from '../../../../modules/Service/repository/ServicePortadaRepository';
import GetPortadaByServiceId from '../../../../modules/Service/application/GetPortadaByServiceId';
import CreateOrUpdatePortada from '../../../../modules/Service/application/CreateOrUpdatePortada';
import { ProgressSpinner } from 'primereact/progressspinner';
import UploadLeftImage from '../../../../modules/Service/application/UploadLeftImage';
import { FileUpload } from 'primereact/fileupload';
import UploadLeftSmallImage from '../../../../modules/Service/application/UploadLeftSmallImage';





const TituloIzquierda = ({ service }) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const fileUploadRef = useRef(null);
    const fileUploadPequeniaRef = useRef(null);

    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [tipoEdicion, setTipoEdicion] = useState(null);

    const [titulo, setTitulo] = useState('Título');
    const [imagenIzquierda, setImagenIzquierda] = useState(null);
    const [contenido, setContenido] = useState('Contenido');
    const [imagenPequenia, setImagenPequenia] = useState(null);

    const portadaRepo = new ServicePortadaRepository();
    const getPortada = new GetPortadaByServiceId(portadaRepo);
    const updatePortada = new CreateOrUpdatePortada(portadaRepo);
    const uploadLeftImage = new UploadLeftImage(portadaRepo);
    const uploadLeftSmallImage = new UploadLeftSmallImage(portadaRepo);


    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getPortada.execute(service.id);
            if (result) {
                setTitulo(result.tituloIzquierda || 'Título');
                setImagenIzquierda(result.imagenIzquierda || null);
                setContenido(result.contenidoIzquierda || 'Contenido');
                setImagenPequenia(result.imagenPequeniaIzquierda || null);
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
        const container = document.querySelector('.imagen');
            if (container) {
                const backgroundImage = `url(${baseUrl}/${imagenIzquierda})`;
                container.style.setProperty('--bg-portada-izquierda-imagen', backgroundImage);
            }
        const containerCi = document.querySelector('.contenido-imagen');
            if (containerCi) {
                const backgroundImage = `url(${baseUrl}/${imagenPequenia})`;
                containerCi.style.setProperty('--bg-portada-contenido-izquierda-imagen', backgroundImage);
            }
    }, [imagenIzquierda, imagenPequenia]);


    const handleEditarTitulo = () => {
        setTitulo(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { tituloIzquierda: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el título de la portada:', error);
        }
    };

    const handleEditarContenido = () => {
        setContenido(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { contenidoIzquierda: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el contenido de la portada:', error);
        }
    };

    const handleEditOpen = (tipo) => {
        if(tipo === 'titulo') {
            setEditorContent(titulo);
        } else if(tipo === 'contenido') {
            setEditorContent(contenido);
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
        if(tipoEdicion === 'titulo') {
            handleEditarTitulo();
        } else if(tipoEdicion === 'contenido') {
            handleEditarContenido();
        }
        setShowEditor(false);
        setEditorContent('');
        setTipoEdicion(null);
    };

    const handleEditarImagen = async (event) => {
        const file = event.files[0];
        if (file) {
            try {
                setLoading(true);
                const result = await uploadLeftImage.execute(service.id, file);
                if (result && result.imagenIzquierda) {
                    setImagenIzquierda(result.imagenIzquierda);
                }
                if (fileUploadRef.current) { fileUploadRef.current.clear(); }
            } catch (error) {
                console.error('Error al subir la imagen:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleEditarImagenPequenia = async (event) => {
        const file = event.files[0];
        if (file) {
            try {
                setLoading(true);
                const result = await uploadLeftSmallImage.execute(service.id, file);
                if (result && result.imagenPequeniaIzquierda) {
                    setImagenPequenia(result.imagenPequeniaIzquierda);
                }
                if (fileUploadPequeniaRef.current) { fileUploadPequeniaRef.current.clear(); }
            } catch (error) {
                console.error('Error al subir la imagen:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleImageIconClick = (e) => {
        e.stopPropagation();
        if (fileUploadRef.current) {
            const input = fileUploadRef.current.getInput();
            if (input) {
                input.click();
            }
        }
    };

    const handleImagePequeniaIconClick = (e) => {
        e.stopPropagation();
        if (fileUploadPequeniaRef.current) {
            const input = fileUploadPequeniaRef.current.getInput();
            if (input) {
                input.click();
            }
        }
    };


    return (
        <>
            {loading ? (
                <ProgressSpinner className='spinner-portada-container'/>)
                : (
            <div className="titulo-izquierda" onClick={handleClose}>
                <div className="izquierda">
                    <div className="titulo-container">
                        <div 
                            className='titulo'
                            dangerouslySetInnerHTML={{ __html: titulo }}
                        ></div>
                        <i 
                            className="pi pi-pencil icono-editar"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpen('titulo');
                            }}
                        ></i>
                    </div>
                    <div className="contenido-container">
                        <div 
                            className='contenido'
                            dangerouslySetInnerHTML={{ __html: contenido }}
                        ></div>
                        <i 
                            className="pi pi-pencil icono-editar"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpen('contenido');
                            }}
                        ></i>
                    </div>
                    <div className="contenido-imagen">
                        <i 
                            className="pi pi-image icono-imagen"
                            onClick={handleImagePequeniaIconClick}
                        ></i>
                        <FileUpload
                        ref={fileUploadPequeniaRef}
                        mode="basic"
                        name="image"
                        accept="image/*"
                        maxFileSize={10000000} // 10MB
                        onSelect={handleEditarImagenPequenia} // Usar onSelect en lugar de onUpload
                        chooseOptions={{ style: { display: 'none' } }} // Ocultar el botón
                        style={{ display: 'none' }} // Ocultar completamente el componente
                        auto={false} // No subir automáticamente
                    />
                    </div>
                </div>

                <div className="imagen">
                    <i 
                        className="pi pi-image icono-imagen"
                        onClick={handleImageIconClick}
                    ></i>
                    <FileUpload
                        ref={fileUploadRef}
                        mode="basic"
                        name="image"
                        accept="image/*"
                        maxFileSize={10000000} // 10MB
                        onSelect={handleEditarImagen} // Usar onSelect en lugar de onUpload
                        chooseOptions={{ style: { display: 'none' } }} // Ocultar el botón
                        style={{ display: 'none' }} // Ocultar completamente el componente
                        auto={false} // No subir automáticamente
                    />
                </div>
            </div>
            )}

            {showEditor && (
                <div className="editor-izquierda editor-container">
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
        </>
    );
};

export default TituloIzquierda;