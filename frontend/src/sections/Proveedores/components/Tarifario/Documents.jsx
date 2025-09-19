import { DataTable } from "primereact/datatable";
import { FileUpload } from "primereact/fileupload";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { useEffect, useRef, useState } from "react";
import TarifarioDocumentsRepository from "../../../../modules/Tarifario/repository/TarifarioDocumentsRepository";
import getDocumentByTarifarioId from "../../../../modules/Tarifario/application/GetDocumentByTarifarioId";
import DeleteDocument from "../../../../modules/Tarifario/application/DeleteDocument";
import "../../styles/Tarifario/Documents.css"
import UploadDocument from "../../../../modules/Tarifario/application/UploadDocument";


const Documents = ({ tarifario }) => {
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [visibleDialog, setVisibleDialog] = useState(false);
    
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);


    const documentRepo = new TarifarioDocumentsRepository();
    const getDocuments = new getDocumentByTarifarioId(documentRepo);
    const deleteDocument = new DeleteDocument(documentRepo);
    const uploadDocument = new UploadDocument(documentRepo);

    const filesUploadRef = useRef(null)

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await getDocuments.execute(tarifario.id);
            setDocuments(response);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async () => {
        if (!file) {
            alert("Por favor, seleccione un archivo.");
            return;
        }
        try {
            setLoading(true);
            const now = new Date().toISOString();
            await uploadDocument.execute({
                tarifarioId: tarifario.id,
                name: file.name, 
                description: description,
                uploadDate: now,
                file: file
            })
            setFile(null);
            setDescription("");
            fetchDocuments();
        } catch (error) {
            console.error("Error uploading document:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        try {
            setLoading(true);
            deleteDocument.execute(selectedDocument.id);
            setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
            setSelectedDocument(null);
            setVisibleDialog(false);
        } catch (error) {
            console.error("Error deleting document:", error);
        } finally {
            setLoading(false);
        }
    };

    const reject = () => {
        setSelectedDocument(null);
        setVisibleDialog(false);
    };


    return (
        <div className="documents-body">
            <div className="documents-header">
                <div className="document-upload">
                    <FloatLabel>
                        <InputText 
                            id="documentDescription" 
                            value={description}
                            style={{ width: '100%' }}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        />
                        <label htmlFor="documentDescription">Descripción del Documento</label>
                    </FloatLabel>
                    <FileUpload
                        className="upload"
                        ref={filesUploadRef}
                        name="documentFile"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        mode="basic"
                        maxFileSize={5000000}
                        chooseLabel={file ? file.name : "Elegir archivo"}
                        chooseOptions={{ className: 'p-button-outlined' }}
                        customUpload
                        onSelect={(e) => {
                            setFile(e.files[0]);
                            if (filesUploadRef.current) { filesUploadRef.current.clear() }
                        }}
                        disabled={loading}
                    />
                </div>
                <Button 
                    label="Agregar" 
                    icon="pi pi-plus"
                    outlined 
                    onClick={() => {handleUpload()}}
                    disabled={loading}
                />
            </div>
            <div className="documents-table">
                <DataTable
                    className="documents-table"
                    size="small"
                    value={documents}
                    loading={loading}
                    tableStyle={{ minWidth: '100%' }} 
                    emptyMessage="No se añadieron documentos"
                >
                    <Column
                        field="description"  
                        header="Descripción del documento" 
                        style={{ width: '45%' }} 
                    />
                    <Column 
                        field="name"  
                        header="Nombre del archivo" 
                        style={{ width: '45%' }} 
                    />
                    <Column   
                        header="Acciones" 
                        style={{ width: '10%' }} 
                        body={rowData => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                <i 
                                    className="pi pi-eye"    
                                    title="Vista previa" 
                                    style={{ marginRight: '10px', cursor:"pointer"}}
                                    onClick={() => {
                                        window.open(`http://localhost:3080/${rowData.documentPath}`, '_blank');
                                    }}
                                ></i>
                                <i 
                                    className="pi pi-pencil"    
                                    title="Editar" 
                                    style={{ marginRight: '10px', cursor:"pointer"}}
                                    onClick={() => undefined}
                                ></i>
                                <i 
                                    className="pi pi-trash"    
                                    title="Eliminar" 
                                    style={{ cursor:"pointer" }}
                                    onClick={loading ? undefined : () => { setSelectedDocument(rowData); setVisibleDialog(true); }}    
                                ></i>
                            </span>
                        )}
                    />
                </DataTable>
            </div>
            <ConfirmDialog
                group="declarative"  
                visible={visibleDialog} 
                onHide={() => setVisibleDialog(false)} 
                message="¿Está seguro de que desea eliminar este archivo?"
                header="Confirmación" 
                icon="pi pi-exclamation-triangle" 
                accept={() => {handleDelete();}}
                reject={() => reject()} 
                acceptLabel="Si"
                rejectLabel="No"
            />
        </div>
    )
}

export default Documents;