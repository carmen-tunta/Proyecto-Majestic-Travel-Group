import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const Services = () => {
    return (
        <div className="itinerario">
            <div className='itinerario-header'>
                <h2>Plantilla Itineraria</h2>
                <Button 
                    icon="pi pi-plus" 
                    label="Nuevo" 
                    size='small' 
                    outlined
                    />
            </div>

            <div className='itinerario-search'>
                <div className="p-input-icon-left">
                    <i className="pi pi-search"/>
                    <InputText type="text" placeholder="Buscar..." className='p-inputtext-sm'/>
                </div>
            </div>

            <div className="card">

                <DataTable className="itinerario-table" size="small"  tableStyle={{ minWidth: '60%' }}>
                    <Column 
                        field="itineraryTitle" 
                        header="Nombre del servicio" 
                        style={{ width: '66%' }}>    
                    </Column>
                    <Column 
                        field="templateTitle" 
                        header="Ciudad" 
                        style={{ width: '28%' }}>
                    </Column>
                    <Column
                        header="Acción"
                        style={{ width: '6%' }}
                        body={rowData => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                <i 
                                    className="pi pi-pencil"    
                                    title="Editar" 
                                    style={{color:'#1976d2', cursor:"pointer"}}
                                ></i>
                            </span>
                        )}
                    />
                </DataTable>
            </div>

            <div className='itinerario-footer'>
                Aqui van los botones
            </div>
    
        </div>
    )
}
export default Services;