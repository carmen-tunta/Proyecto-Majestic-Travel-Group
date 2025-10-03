import { useEffect, useState } from 'react';
import '../../styles/Portada/TituloIzquierda.css';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';





const TituloIzquierda = ({ service }) => {

    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [titulo, setTitulo] = useState('Título');
    const [contenido, setContenido] = useState('Contenido');
    const [loading, setLoading] = useState(false);
    const [tipoEdicion, setTipoEdicion] = useState(null);

    useEffect(() => {
        const container = document.querySelector('.imagen');
            if (container) {
                const backgroundImage = `url(http://localhost:3080/images-portada/1759466498068_service6_portada.jpeg)`;
                container.style.setProperty('--bg-portada-izquierda-imagen', backgroundImage);
            }
    }, [service]);

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
            setTitulo(editorContent);
        } else if(tipoEdicion === 'contenido') {
            setContenido(editorContent);
        }
        setShowEditor(false);
        setEditorContent('');
        setTipoEdicion(null);
    };


    return (
        <>
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
                    <i className="pi pi-image icono-imagen"></i>
                </div>
                <div className="imagen">
                    <i className="pi pi-image icono-imagen"></i>
                </div>
            </div>

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