import { useEffect, useRef, useState } from 'react';
import '../../styles/Portada/TituloDoble.css';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import ServicePortadaRepository from '../../../../modules/Service/repository/ServicePortadaRepository';
import GetPortadaByServiceId from '../../../../modules/Service/application/GetPortadaByServiceId';
import CreateOrUpdatePortada from '../../../../modules/Service/application/CreateOrUpdatePortada';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload } from 'primereact/fileupload';
import uploadRightDoble from '../../../../modules/Service/application/UploadRightDoble';
import uploadLeftDoble from '../../../../modules/Service/application/UploadLeftDoble';
import { useModal } from '../../../../contexts/ModalContext';
import AgregarPlantillaItinerario from './AgregarPlantillaItinerario';


const TituloDoble = ({ service }) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const fileUploadIzquierdaRef = useRef(null);
    const fileUploadDerechaRef = useRef(null);

    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [tipoEdicion, setTipoEdicion] = useState(null);

    const [tituloDerecha, setTituloDerecha] = useState('Título');
    const [tituloIzquierda, setTituloIzquierda] = useState('Título');
    const [contenidoDerecha, setContenidoDerecha] = useState('Contenido');
    const [contenidoIzquierda, setContenidoIzquierda] = useState('Contenido');
    const [imagenDerecha, setImagenDerecha] = useState(null);
    const [imagenIzquierda, setImagenIzquierda] = useState(null);
    const [lado, setLado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { setIsModalOpen } = useModal();

    const portadaRepo = new ServicePortadaRepository();
    const getPortada = new GetPortadaByServiceId(portadaRepo);
    const updatePortada = new CreateOrUpdatePortada(portadaRepo);
    const uploadRightImage = new uploadRightDoble(portadaRepo);
    const uploadLeftImage = new uploadLeftDoble(portadaRepo); 


    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getPortada.execute(service.id);
            if (result) {
                setTituloDerecha(result.tituloDobleDerecha || 'Título');
                setImagenDerecha(result.imagenDobleDerecha || null);
                setContenidoDerecha(result.contenidoDobleDerecha || 'Contenido');
                setTituloIzquierda(result.tituloDobleIzquierda || 'Título');
                setImagenIzquierda(result.imagenDobleIzquierda || null);
                setContenidoIzquierda(result.contenidoDobleIzquierda || 'Contenido');
                console.log('Portada doble cargada:', result.imagenDobleDerecha);
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
        const containerDer = document.querySelector('.contenido-imagen-derecha');
            if (containerDer) {
                const backgroundImageDer = `url(${baseUrl}/${imagenDerecha})`;
                containerDer.style.setProperty('--bg-portada-doble-derecha-imagen', backgroundImageDer);
            }
        const containerIzq = document.querySelector('.contenido-imagen-izquierda');
            if (containerIzq) {
                const backgroundImageIzq = `url(${baseUrl}/${imagenIzquierda})`;
                containerIzq.style.setProperty('--bg-portada-doble-izquierda-imagen', backgroundImageIzq);
            }
    }, [imagenDerecha, imagenIzquierda]);


    const handleEditarTituloDerecha = () => {
        setTituloDerecha(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { tituloDobleDerecha: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el título de la portada:', error);
        }
    };

    const handleEditarContenidoDerecha = () => {
        setContenidoDerecha(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { contenidoDobleDerecha: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el contenido de la portada:', error);
        }
    };

    const handleEditarTituloIzquierda = () => {
        setTituloIzquierda(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { tituloDobleIzquierda: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el título de la portada:', error);
        }
    };

    const handleEditarContenidoIzquierda = () => {
        setContenidoIzquierda(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { contenidoDobleIzquierda: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el contenido de la portada:', error);
        }
    };

    const handleEditOpen = (tipo) => {
        if(tipo === 'titulo-derecha') {
            setEditorContent(tituloDerecha);
        } else if(tipo === 'contenido-derecha') {
            setEditorContent(contenidoDerecha);
        } else if(tipo === 'titulo-izquierda') {
            setEditorContent(tituloIzquierda);
        } else if(tipo === 'contenido-izquierda') {
            setEditorContent(contenidoIzquierda);
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
        if(tipoEdicion === 'titulo-derecha') {
            handleEditarTituloDerecha();
        } else if(tipoEdicion === 'contenido-derecha') {
            handleEditarContenidoDerecha();
        } else if(tipoEdicion === 'titulo-izquierda') {
            handleEditarTituloIzquierda();
        } else if(tipoEdicion === 'contenido-izquierda') {
            handleEditarContenidoIzquierda();
        }
        setShowEditor(false);
        setEditorContent('');
        setTipoEdicion(null);
    };

    const handleImagenIzquierda = async (event) => {
        const file = event.files[0];
        if (file) {
            try {
                setLoading(true);
                const result = await uploadLeftImage.execute(service.id, file);
                if (result && result.imagenDobleIzquierda) {
                    setImagenIzquierda(result.imagenDobleIzquierda);
                }
                if (fileUploadIzquierdaRef.current) { fileUploadIzquierdaRef.current.clear(); }
            } catch (error) {
                console.error('Error al subir la imagen:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleImagenDerecha = async (event) => {
        const file = event.files[0];
        if (file) {
            try {
                setLoading(true);
                const result = await uploadRightImage.execute(service.id, file);
                if (result && result.imagenDobleDerecha) {
                    setImagenDerecha(result.imagenDobleDerecha);
                }
                if (fileUploadDerechaRef.current) { fileUploadDerechaRef.current.clear(); }
            } catch (error) {
                console.error('Error al subir la imagen:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleImageIzquierdaIconClick = (e) => {
        e.stopPropagation();
        if (fileUploadIzquierdaRef.current) {
            const input = fileUploadIzquierdaRef.current.getInput();
            if (input) {
                input.click();
            }
        }
    };

    const handleImageDerechaIconClick = (e) => {
        e.stopPropagation();
        if (fileUploadDerechaRef.current) {
            const input = fileUploadDerechaRef.current.getInput();
            if (input) {
                input.click();
            }
        }
    };

    const handleModalOpen = () => {
        setShowModal(true);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsModalOpen(false);
        setLado('');
    };

    const handleTemplateSelectedDerecha = (template) => {
        try {
            updatePortada.execute(service.id, { tituloDobleDerecha:template.templateTitle, contenidoDobleDerecha: template.description }, null);
            setContenidoDerecha(template.description);
            setTituloDerecha(template.templateTitle);
        } catch (error) {
            console.error('Error al actualizar el contenido de la portada con la plantilla:', error);
        }
    };

    const handleTemplateSelectedIzquierda = (template) => {
        try {
            updatePortada.execute(service.id, { tituloDobleIzquierda:template.templateTitle, contenidoDobleIzquierda: template.description }, null);
            setContenidoIzquierda(template.description);
            setTituloIzquierda(template.templateTitle);
        } catch (error) {
            console.error('Error al actualizar el contenido de la portada con la plantilla:', error);
        }
    };


    return (
        <>
            {loading ? (
                <ProgressSpinner className='spinner-portada-container'/>)
                : (
            <div className="titulo-doble" onClick={handleClose}>
                <div className="izquierda">
                    <div className="titulo-container">
                        <div 
                            className='titulo'
                            dangerouslySetInnerHTML={{ __html: tituloIzquierda }}
                        ></div>
                        <i 
                            className="pi pi-pencil icono-editar"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpen('titulo-izquierda');
                            }}
                        ></i>
                        <i 
                            className="pi pi-database icono-editar"
                            style={{marginLeft: '10px'}}
                            onClick={() => {handleModalOpen(); setLado('izquierda');}}
                        ></i>
                    </div>
                    <div className="contenido-container">
                        <div 
                            className='contenido'
                            dangerouslySetInnerHTML={{ __html: contenidoIzquierda }}
                        ></div>
                        <i 
                            className="pi pi-pencil icono-editar"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpen('contenido-izquierda');
                            }}
                        ></i>
                    </div>
                    <div className="contenido-imagen-izquierda">
                        <i 
                            className="pi pi-image icono-imagen"
                            onClick={handleImageIzquierdaIconClick}
                        ></i>
                        <FileUpload
                            ref={fileUploadIzquierdaRef}
                            mode="basic"
                            name="image"
                            accept="image/*"
                            maxFileSize={10000000} // 10MB
                            onSelect={handleImagenIzquierda} // Usar onSelect en lugar de onUpload
                            chooseOptions={{ style: { display: 'none' } }} // Ocultar el botón
                            style={{ display: 'none' }} // Ocultar completamente el componente
                            auto={false} // No subir automáticamente
                        />
                    </div>
                </div>

                <div className="derecha">
                    <div className="titulo-container">
                        <div 
                            className='titulo'
                            dangerouslySetInnerHTML={{ __html: tituloDerecha }}
                        ></div>
                        <i 
                            className="pi pi-pencil icono-editar"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpen('titulo-derecha');
                            }}
                        ></i>
                        <i 
                            className="pi pi-database icono-editar"
                            style={{marginLeft: '10px'}}
                            onClick={() => {handleModalOpen(); setLado('derecha');}}
                        ></i>
                    </div>
                    <div className="contenido-container">
                        <div 
                            className='contenido'
                            dangerouslySetInnerHTML={{ __html: contenidoDerecha }}
                        ></div>
                        <i 
                            className="pi pi-pencil icono-editar"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpen('contenido-derecha');
                            }}
                        ></i>
                    </div>
                    <div className="contenido-imagen-derecha">
                        <i 
                            className="pi pi-image icono-imagen"
                            onClick={handleImageDerechaIconClick}
                        ></i>
                        <FileUpload
                            ref={fileUploadDerechaRef}
                            mode="basic"
                            name="image"
                            accept="image/*"
                            maxFileSize={10000000} // 10MB
                            onSelect={handleImagenDerecha} // Usar onSelect en lugar de onUpload
                            chooseOptions={{ style: { display: 'none' } }} // Ocultar el botón
                            style={{ display: 'none' }} // Ocultar completamente el componente
                            auto={false} // No subir automáticamente
                        />
                    </div>
                </div>

            </div>
            )}

            {showEditor && (
                <div className={`editor-container ${tipoEdicion.includes('derecha') ? 'editor-derecha-doble' : 'editor-izquierda-doble'}`}>
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
                    onSelectTemplate={lado === 'derecha' ? handleTemplateSelectedDerecha : handleTemplateSelectedIzquierda}
                />
            )}
        </>
    );
};

export default TituloDoble;