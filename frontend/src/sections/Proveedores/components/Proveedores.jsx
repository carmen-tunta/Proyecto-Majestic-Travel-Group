import { DataTable } from 'primereact/datatable';
import SearchBar from '../../../components/SearchBar';
import useSearch from '../../../hooks/useSearch';
import { apiService } from '../../../services/apiService';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import GetAllProveedores from '../../../modules/Proveedores/application/GetAllProveedores';
import { useEffect, useState } from 'react';
import ProveedoresRepository from '../../../modules/Proveedores/repository/ProveedoresRepository';
import "../styles/Proveedores.css"
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../contexts/PermissionsContext';
import TarifarioRepository from '../../../modules/Tarifario/repository/TarifarioRepository';
import getTarifarioByIdProveedor from '../../../modules/Tarifario/application/GetTarifarioByIdProveedor';
import GetAllTarifario from '../../../modules/Tarifario/application/GetAllTarifario';

const Proveedores = () => {
    const proveedoresRepository = new ProveedoresRepository();
    const getAllProveedores = new GetAllProveedores(proveedoresRepository);

    const tarifarioRepository = new TarifarioRepository();
    const getTarifarioById = new getTarifarioByIdProveedor(tarifarioRepository);

    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const navigate = useNavigate();
    const { has } = usePermissions();

    const handleEdit = (proveedor) => {
        navigate('/proveedores/detalles', { state: { proveedor } });
    };

    const handleTarifario = (proveedor) => {
        navigate('/proveedores/tarifario', { state: { proveedor } });
    }

    const handleNew = () => {
        setProveedores(null);
        navigate('/proveedores/detalles');
    }

    const onPageChange = (event) => {
        const page = Math.floor(event.first / event.rows);
        setFirst(event.first);
        setRows(event.rows);
    };

    const getAllTarifario = new GetAllTarifario(tarifarioRepository);

    const loadProveedores = async (page = 0, pageSize = 10) => {
        setLoading(true);
        try {
            const proveedorData = await getAllProveedores.execute(`?page=${page}&limit=${pageSize}`);
            const proveedoresList = Array.isArray(proveedorData.data) ? proveedorData.data : (Array.isArray(proveedorData) ? proveedorData : []);
            setProveedores(proveedoresList);
            setTotalRecords(proveedorData.total || (Array.isArray(proveedorData) ? proveedorData.length : 0));
        } catch (error) {
            console.error('Error al obtener los proveedores:', error);
            setProveedores([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProveedores();
    }, []);



    // Buscador universal para proveedores
    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('proveedores', q));


    return (
        <div className="proveedores">
            <div className='proveedores-header'>
                <h2>Proveedores</h2>
                <Button 
                    icon="pi pi-plus" 
                    label="Nuevo" 
                    size='small' 
                    outlined
                    onClick={() => has('PROVEEDORES','CREATE') && handleNew()}
                    disabled={!has('PROVEEDORES','CREATE')}
                />
            </div>

            <div className='proveedores-search'>
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar proveedores..." />
            </div>

            <div className="card">
                <DataTable 
                    className="proveedores-table" 
                    size="small" 
                    value={search ? results : proveedores} 
                    tableStyle={{ minWidth: '60%' }}
                    emptyMessage="No se encontraron proveedores"
                    paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    loading={loading || searchLoading}
                >
                    <Column 
                        field="name" 
                        header="Nombre del proveedor" 
                        style={{ width: '20%' }}>    
                    </Column>
                    <Column 
                        field="serviceType" 
                        header="Tipo de servicio" 
                        style={{ width: '20%' }}>
                    </Column>
                    <Column 
                        field="validityTo" 
                        header="Vigencia" 
                        body={rowData => {
                            if (!rowData.tarifario?.validityTo) return '';
                            const date = new Date(rowData.tarifario?.validityTo);
                            let formatted = date.toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            });
                            formatted = formatted.replace(/,/g, '').split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                            return formatted;
                        }}
                        style={{ width: '20%' }}>
                    </Column>
                    <Column 
                        field="city" 
                        header="Ciudad" 
                        style={{ width: '10%' }}>
                    </Column>
                    <Column 
                        field="whatsapp" 
                        header="WhatsApp" 
                        style={{ width: '20%' }}>
                    </Column>
                    <Column 
                        field="mail" 
                        header="Correo" 
                        style={{ width: '20%' }}>
                    </Column>
                    <Column
                        header="Acción"
                        style={{ width: '10%' }}
                        body={rowData => (
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                                {has('PROVEEDORES','VIEW') && (
                                <i 
                                    className="pi pi-file"    
                                    title="Tarifario" 
                                    style={{marginRight: '10px', cursor:"pointer"}}
                                    onClick={() => handleTarifario(rowData)}
                                ></i>
                                )}
                                {has('PROVEEDORES','EDIT') && (
                                <i 
                                    className="pi pi-arrow-right"    
                                    title="Editar" 
                                    style={{cursor:"pointer"}}
                                    onClick={() => handleEdit(rowData)}    
                                ></i>
                                )}
                            </span>
                        )}
                    />
                </DataTable>
            </div>

            
    
        </div>
    )
}

export default Proveedores;