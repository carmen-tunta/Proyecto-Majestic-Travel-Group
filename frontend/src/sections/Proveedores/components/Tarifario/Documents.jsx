import { DataTable } from "primereact/datatable";
import { FileUpload } from "primereact/fileupload";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";

import "../../styles/Tarifario/Documents.css"
import { Button } from "primereact/button";
import { Column } from "primereact/column";

const Documents = () => {
    return (
        <div className="documents-body">
            <div className="documents-header">
                <div className="document-upload">
                    <FloatLabel>
                        <InputText 
                            id="documentDescription" 
                            style={{ width: '100%' }}
                        />
                        <label htmlFor="documentDescription">Descripción del Documento</label>
                    </FloatLabel>
                    <FileUpload
                        name="documentFile"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        maxFileSize={5000000}
                        mode="basic"
                        chooseLabel="Elegir archivo"
                        chooseOptions={{ className: 'p-button-outlined' }}
                    />
                </div>
                <Button 
                    label="Agregar" 
                    icon="pi pi-plus"
                    outlined 
                />
            </div>
            <div className="documents-table">
                <DataTable
                    className="documents-table"
                    size="small"
                    // value={documents}
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
                                    onClick={() => undefined}
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
                                    onClick={() => undefined}    
                                ></i>
                            </span>
                        )}
                    />
                </DataTable>
            </div>
        </div>
    )
}

export default Documents;