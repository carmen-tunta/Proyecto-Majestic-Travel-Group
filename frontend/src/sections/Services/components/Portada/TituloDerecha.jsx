import { useEffect, useRef, useState } from 'react';
import '../../styles/Portada/TituloDerecha.css';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import ServicePortadaRepository from '../../../../modules/Service/repository/ServicePortadaRepository';
import GetPortadaByServiceId from '../../../../modules/Service/application/GetPortadaByServiceId';
import CreateOrUpdatePortada from '../../../../modules/Service/application/CreateOrUpdatePortada';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload } from 'primereact/fileupload';
import UploadRightImage from '../../../../modules/Service/application/UploadRightImage';
import UploadRightSmallImage from '../../../../modules/Service/application/UploadRightSmallImages';
import AgregarPlantillaItinerario from './AgregarPlantillaItinerario';
import { useModal } from '../../../../contexts/ModalContext';


const TituloDerecha = ({ service, onPageToggle }) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const fileUploadRef = useRef(null);
    const fileUploadPequeniaRef = useRef(null);

    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [tipoEdicion, setTipoEdicion] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { setIsModalOpen } = useModal();

    const [titulo, setTitulo] = useState('Título');
    const [imagenDerecha, setImagenDerecha] = useState(null);
    const [contenido, setContenido] = useState('Contenido');
    const [imagenPequenia, setImagenPequenia] = useState(null);

    const portadaRepo = new ServicePortadaRepository();
    const getPortada = new GetPortadaByServiceId(portadaRepo);
    const updatePortada = new CreateOrUpdatePortada(portadaRepo);
    const uploadRightImage = new UploadRightImage(portadaRepo);
    const uploadRightSmallImage = new UploadRightSmallImage(portadaRepo);

    
    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getPortada.execute(service.id);
            if (result) {
                setTitulo(result.tituloDerecha || 'Título');
                setImagenDerecha(result.imagenDerecha || null);
                setContenido(result.contenidoDerecha || 'Contenido');
                setImagenPequenia(result.imagenPequeniaDerecha || null);
                setIsPageDeleted(result.derechaDeleted || false);
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
                const backgroundImage = `url(${baseUrl}/${imagenDerecha})`;
                container.style.setProperty('--bg-portada-derecha-imagen', backgroundImage);
            }
        const containerCd = document.querySelector('.contenido-imagen');
            if (containerCd) {
                const backgroundImage = `url(${baseUrl}/${imagenPequenia})`;
                containerCd.style.setProperty('--bg-portada-contenido-derecha-imagen', backgroundImage);
            }
    }, [imagenDerecha, imagenPequenia]);


    const handleEditarTitulo = () => {
        setTitulo(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { tituloDerecha: editorContent }, null);
        } catch (error) {
            console.error('Error al actualizar el título de la portada:', error);
        }
    };

    const handleEditarContenido = () => {
        setContenido(editorContent);
        setShowEditor(false);
        try {
            updatePortada.execute(service.id, { contenidoDerecha: editorContent }, null);
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
                const result = await uploadRightImage.execute(service.id, file);
                if (result && result.imagenDerecha) {
                    setImagenDerecha(result.imagenDerecha);
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
                const result = await uploadRightSmallImage.execute(service.id, file);
                if (result && result.imagenPequeniaDerecha) {
                    setImagenPequenia(result.imagenPequeniaDerecha);
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

    const handleModalOpen = () => {
        setShowModal(true);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsModalOpen(false);
    };

    const handleTemplateSelected = (template) => {
        console.log('Template seleccionado:', template.description);
        try {
            updatePortada.execute(service.id, { tituloDerecha:template.templateTitle, contenidoDerecha: template.description }, null);
            setContenido(template.description);
            setTitulo(template.templateTitle);
        } catch (error) {
            console.error('Error al actualizar el contenido de la portada con la plantilla:', error);
        }
    };

    const [isPageDeleted, setIsPageDeleted] = useState(false);

    const handleToggleDelete = async (e) => {
        e.stopPropagation();
        const newDeleteState = !isPageDeleted;
        try {
            const u = await updatePortada.execute(service.id, { derechaDeleted: newDeleteState ? 1 : 0 }, null);
            setIsPageDeleted(newDeleteState);
            if (onPageToggle) {
                onPageToggle('titulo-derecha', newDeleteState);
            }
        } catch (error) {
            console.error('Error al actualizar el estado de eliminación de la portada:', error);
        } 
    };

    return (
        <>
            {loading ? (
                <ProgressSpinner className='spinner-portada-container'/>)
                : (
            <div className={`titulo-derecha ${isPageDeleted ? 'page-deleted' : ''}`} onClick={handleClose}>
                <i 
                    className={`pi ${isPageDeleted ? 'pi-undo' : 'pi-trash'} icono-eliminar ${isPageDeleted ? 'deleted' : ''}`} 
                    onClick={handleToggleDelete}
                    title={isPageDeleted ? 'Restaurar sección' : 'Eliminar sección'}
                ></i>
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

                <div className="derecha">
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
                        <i 
                            className="pi pi-database icono-editar"
                            style={{marginLeft: '10px'}}
                            onClick={handleModalOpen}
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

            </div>
            )}

            {showEditor && (
                <div className="editor-derecha editor-container">
                    <Editor
                        value={editorContent} 
                        onTextChange={(e) => setEditorContent(e.htmlValue)}
                        style={{ border: 'none' }}
                    />
                    <div className="button-container">
                        <Button
                            outlined
                            size='small'
                            label="Aceptar" 
                            onClick={handleAccept}
                            className="accept-button editor-actions"
                        />
                    </div>
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

export default TituloDerecha;