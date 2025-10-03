import { Dialog } from 'primereact/dialog';
import '../../styles/Portada/TituloPortada.css'
import { useEffect, useState } from "react";
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';

const TituloPortada = ({ service }) => {
    const [name, setName] = useState(service?.name || 'Título');
    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState(name);


    useEffect(() => {
        const container = document.querySelector('.portada-container');
        if (container) {
            const backgroundImage = service?.backgroundImage 
                ? `url(${service.backgroundImage})` 
                : `url(${process.env.PUBLIC_URL}/mp.jpg)`;
            
            container.style.setProperty('--bg-portada-centro-image', backgroundImage);
        }
    }, [service]);

    const handleEditOpen = () => {
        console.log('Abriendo editor con contenido:', name);
        setEditorContent(name);
        setShowEditor(true);
    };

    const handleClose = () => {
        if (showEditor) {
            setShowEditor(false);
        }
    };

    const handleAccept = () => {
        setName(editorContent);
        setShowEditor(false);
    };

    return (
        <>
        <div className="portada-container" onClick={handleClose}>
            <div className="titulo-portada-container">
                <i className="pi pi-pencil icono-titulo" onClick={handleEditOpen}></i>
                <div 
                    className="titulo-portada"
                    dangerouslySetInnerHTML={{ __html: name }}
                ></div>
            </div>
            <i className="pi pi-image icono-imagen" onClick={undefined}></i>
        </div>
        {showEditor && (
            <div className="editor-container">
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

export default TituloPortada;