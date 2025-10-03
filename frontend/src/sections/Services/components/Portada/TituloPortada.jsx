import { Dialog } from 'primereact/dialog';
import '../../styles/Portada/TituloPortada.css'
import { use, useEffect, useState } from "react";
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import ServicePortadaRepository from '../../../../modules/Service/repository/ServicePortadaRepository';
import GetPortadaByServiceId from '../../../../modules/Service/application/GetPortadaByServiceId';
import CreateOrUpdatePortada from '../../../../modules/Service/application/CreateOrUpdatePortada';

const TituloPortada = ({ service }) => {
    const baseUrl = process.env.REACT_APP_API_URL;

    const [titulo, setTitulo] = useState('Título');
    const [imagen, setImagen] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState(titulo);

    const portadaRepo = new ServicePortadaRepository();
    const getPortada = new GetPortadaByServiceId(portadaRepo);
    const updatePortada = new CreateOrUpdatePortada(portadaRepo);

    const fetchData = async () => {
        try {
            const result = await getPortada.execute(service.id);
            if (result) {
                setTitulo(result.titulo || 'Título');
                setImagen(result.imagenCentro || null);
            }
        } catch (error) {
            console.error('Error al obtener la portada:', error);
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
                console.log('Fondo de portada establecido:', backgroundImage);
                container.style.setProperty('--bg-portada-centro-image', backgroundImage);
            }
    }, [imagen]);

    const handleEditOpen = () => {
        console.log('Abriendo editor con contenido:', titulo);
        setEditorContent(titulo);
        setShowEditor(true);
    };

    const handleClose = () => {
        if (showEditor) {
            setShowEditor(false);
        }
    };

    const handleAccept = () => {
        setTitulo(editorContent);
        setShowEditor(false);
    };

    return (
        <>
        <div className="portada-container" onClick={handleClose}>
            <div className="titulo-portada-container">
                <i className="pi pi-pencil icono-titulo" onClick={handleEditOpen}></i>
                <div 
                    className="titulo-portada"
                    dangerouslySetInnerHTML={{ __html: titulo }}
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