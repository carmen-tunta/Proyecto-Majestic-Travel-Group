import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import "../../styles/Tarifario/Incremento.css"


const Incremento = ({ tarifa }) => {

    const increments = [
        { id: 1, incrementDate: '2023-01-01', porcentage: 'Si', incrementValue: '10' },
        { id: 2, incrementDate: '2023-06-01', porcentage: 'No', incrementValue: '20' },
        { id: 3, incrementDate: '2024-01-01', porcentage: 'No', incrementValue: '10' }
    ];
    

    
    return (    
        <div className="incremento-body">
            <div className="incremento-header">
                <h3>Tabla de incremento</h3>
                <Button
                    icon="pi pi-plus"
                    label="Nuevo"
                    size='small'
                    outlined
                    onClick={() => {}}
                />
            </div>
            <div>
                <DataTable
                    className="incremento-table"
                    size="small"
                    value={increments || []}
                    emptyMessage="No se registraron incrementos"
                >
                    <Column 
                        field="incrementDate" 
                        header="Fecha de incremento" 
                        style={{ width: '20%' }}
                    />
                    <Column 
                        field="porcentage"  
                        header="Porcentaje" 
                        style={{ width: '20%' }} 
                    />
                    <Column 
                        field="incrementValue" 
                        header="Valor de incremento" 
                        style={{ width: '50%' }} 
                    />
                    <Column
                        style={{ width: '10%' }}
                        body={rowData => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                <i 
                                    className="pi pi-pencil"    
                                    title="Editar" 
                                    style={{ marginRight: '10px', cursor:"pointer"}}
                                    onClick={() => {}}
                                ></i>
                                <i 
                                    className="pi pi-trash"    
                                    title="Editar" 
                                    style={{ cursor:"pointer", marginRight: '10px' }}
                                    onClick={() => {}}    
                                ></i>
                            </span>
                        )}
                    />
                </DataTable>
            </div>
        </div>
    );
}

export default Incremento;