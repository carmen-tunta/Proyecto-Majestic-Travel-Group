import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import "../styles/Itinerario.css"

const Itinerario = () => {
    
    const products = [
        { template: 'RECOMENDACIONES', title: 'RECOMENDACIONES' },
        { template: 'NO INCLUYE - VISITAS DEL PERU', title: 'NO INCLUYE' },
        { template: 'POLITICAS DE CANCELACION', title: 'POLITICAS DE CANCELACION' }
    ];

    return (
        <div className="itinerario">
            <div className='itinerario-header'>
                <h2>Plantilla Itineraria</h2>
                <Button icon="pi pi-plus" label="Nuevo" size='small' outlined/>
            </div>

            <div className='itinerario-search'>
                <div className="p-input-icon-left">
                    <i className="pi pi-search"/>
                    <InputText type="text" placeholder="Buscar..." className='p-inputtext-sm'/>
                </div>
            </div>

            <div className="card">
                <DataTable className="itinerario-table" size="small" value={products} tableStyle={{ minWidth: '60%' }}>
                    <Column 
                        field="template" 
                        header="Tipo de plantilla" 
                        style={{ width: '47%' }}>    
                    </Column>
                    <Column 
                        field="title" 
                        header="Título para el itinerario" 
                        style={{ width: '47%' }}>
                    </Column>
                    <Column
                        field="action"
                        header="Acción"
                        style={{ width: '6%' }}
                        body={() => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                <i className="pi pi-pencil" title="Editar" style={{color:'#1976d2'}}></i>
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

export default Itinerario;