import { Button } from "primereact/button";
import { Editor } from "primereact/editor";
import { FileUpload } from "primereact/fileupload";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRef, useState } from "react";

import "../../styles/Portada/ContactoPortada.css"

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


    
    return (
        <>
            {loading ? (
                <ProgressSpinner className='spinner-portada-container'/>) 
                : (
                <div className="contacto-portada-container" onClick={undefined}>
                    <div className="contacto-content">
                        <div className="titulo-container">
                            <i className="pi pi-pencil icono-titulo" onClick={undefined}></i>
                            <div 
                                className="titulo"
                                dangerouslySetInnerHTML={{ __html: titulo }}
                            ></div>
                        </div>
                    </div>
                    <i 
                        className="pi pi-image icono-imagen" 
                        onClick={undefined}
                        title='Seleccionar imagen de fondo'
                    ></i>
                    <FileUpload
                        ref={undefined}
                        mode="basic"
                        name="image"
                        accept="image/*"
                        maxFileSize={10000000} // 10MB
                        onSelect={undefined} // Usar onSelect en lugar de onUpload
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
                            onClick={undefined}
                            className="accept-button editor-actions"
                        />
                </div>
            )}
        </>
    );
};

export default ContactoPortada;