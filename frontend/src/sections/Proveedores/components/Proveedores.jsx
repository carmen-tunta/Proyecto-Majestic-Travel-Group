import { DataTable } from 'primereact/datatable';
import SearchBar from '../../../components/SearchBar';
import useSearch from '../../../hooks/useSearch';
import { apiService } from '../../../services/apiService';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import GetAllProveedores from '../../../modules/Proveedores/application/GetAllProveedores';
import { useEffect, useState, useMemo } from 'react';
import ProveedoresRepository from '../../../modules/Proveedores/repository/ProveedoresRepository';
import "../styles/Proveedores.css"
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../contexts/PermissionsContext';
import TarifarioRepository from '../../../modules/Tarifario/repository/TarifarioRepository';
import getTarifarioByIdProveedor from '../../../modules/Tarifario/application/GetTarifarioByIdProveedor';
import GetAllTarifario from '../../../modules/Tarifario/application/GetAllTarifario';
import { addLocale, locale } from 'primereact/api';

const Proveedores = () => {
    const proveedoresRepository = new ProveedoresRepository();
    const getAllProveedores = new GetAllProveedores(proveedoresRepository);

    const tarifarioRepository = new TarifarioRepository();
    const getTarifarioById = new getTarifarioByIdProveedor(tarifarioRepository);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        addLocale('es', {
            apply: 'Aplicar',
            clear: 'Limpiar',
            addRule: 'Agregar regla',
            removeRule: 'Eliminar regla',
            accept: 'Sí',
            reject: 'No',
            choose: 'Elegir',
            upload: 'Subir',
            cancel: 'Cancelar',
            dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            weekHeader: 'Sm',
            firstDayOfWeek: 1,
            showMonthAfterYear: false,
            dateFormat: 'dd/mm/yy',
            weak: 'Débil',
            medium: 'Medio',
            strong: 'Fuerte',
            passwordPrompt: 'Introduce una contraseña',
            emptyFilterMessage: 'No se encontraron resultados',
            emptyMessage: 'No hay opciones disponibles'
        });
        locale('es');
    }, []);

    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(15);
    const [filters, setFilters] = useState({ serviceType: { value: null }, city: { value: null } });
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

    const getAllTarifario = new GetAllTarifario(tarifarioRepository);

    // Cargar todos los proveedores (sin paginación del backend)
    const loadProveedores = async () => {
        setLoading(true);
        try {
            const proveedorData = await getAllProveedores.execute();
            const proveedoresList = Array.isArray(proveedorData) ? proveedorData : [];
            setProveedores(proveedoresList);
        } catch (error) {
            console.error('Error al obtener los proveedores:', error);
            setProveedores([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProveedores();
    }, []);



    // Buscador universal para proveedores
    const { search, setSearch, results, loading: searchLoading } = useSearch((q) => apiService.universalSearch('proveedores', q));

    // Opciones de ciudades (mismas que al crear proveedor) + "Todos"
    const cityOptions = useMemo(() => (
        ['Todos', 'Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Iquitos', 'Puno', 'Chiclayo', 'Piura', 'Huaraz', 'Nazca', 'Aguas calientes']
    ), []);

    // Opciones de Tipo de servicio (mismas que al crear proveedor) + "Todos"
    const serviceTypeOptions = useMemo(() => (
        ['Todos', 'Alojamiento', 'Transporte', 'Tours', 'Guías turísticos', 'Restaurantes', 'Agencias de viajes', 'Otros']
    ), []);

    // Reordenar por tipo de servicio
    const sortedProveedores = useMemo(() => {
        const data = search ? (Array.isArray(results) ? results : []) : proveedores;
        if (!Array.isArray(data)) return [];
        
        return [...data].sort((a, b) => {
            const typeA = a.serviceType || '';
            const typeB = b.serviceType || '';
            return typeA.localeCompare(typeB);
        });
    }, [search, results, proveedores]);

    // Aplicar filtros sobre los datos ordenados
    const filteredProveedores = useMemo(() => {
        let data = sortedProveedores;
        
        // Filtrar por tipo de servicio si hay un filtro activo
        if (filters.serviceType?.value) {
            data = data.filter(prov => prov.serviceType === filters.serviceType.value);
        }
        
        // Filtrar por ciudad si hay un filtro activo
        if (filters.city?.value) {
            data = data.filter(prov => prov.city === filters.city.value);
        }
        
        return data;
    }, [sortedProveedores, filters]);

    // Paginar los datos filtrados
    const paginatedProveedores = useMemo(() => {
        const start = first;
        const end = start + rows;
        return filteredProveedores.slice(start, end);
    }, [filteredProveedores, first, rows]);

    // Total de registros filtrados
    const filteredTotalRecords = useMemo(() => {
        return filteredProveedores.length;
    }, [filteredProveedores]);

    // Función para manejar el cambio de página
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    // Resetear paginación cuando cambian los filtros o búsqueda
    useEffect(() => {
        setFirst(0);
    }, [filters, search]);

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
                    value={paginatedProveedores} 
                    tableStyle={{ minWidth: '60%' }}
                    emptyMessage="No se encontraron proveedores"
                    paginator={false}
                    filters={filters}
                    onFilter={(e) => setFilters(e.filters)}
                    loading={loading || searchLoading}
                    filterDisplay='menu'
                >
                    <Column 
                        field="name" 
                        header={isMobile ? "Proveedor" : "Nombre del proveedor"} 
                        style={{ width: '20%' }}>    
                    </Column>
                    <Column 
                        field="serviceType" 
                        header={isMobile ? "Servicio" : "Tipo de servicio"}
                        style={{ width: '20%' }}
                        filterField='serviceType'
                        filter
                        filterMatchMode='equals'
                        filterElement={(options) => (
                            <Dropdown
                                value={options.value ?? 'Todos'}
                                options={serviceTypeOptions}
                                onChange={(e) => {
                                    const val = e.value === 'Todos' ? null : e.value;
                                    options.filterApplyCallback(val);
                                }}
                                placeholder="Todos"
                                className="p-column-filter"
                            />
                        )}>
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
                        style={{ width: '10%' }}
                        filterField='city'
                        filter
                        filterMatchMode='equals'
                        filterElement={(options) => (
                            <Dropdown
                                value={options.value ?? 'Todos'}
                                options={cityOptions}
                                onChange={(e) => {
                                    const val = e.value === 'Todos' ? null : e.value;
                                    options.filterApplyCallback(val);
                                }}
                                placeholder="Todos"
                                className="p-column-filter"
                            />
                        )}>
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

            {/* Footer con paginación */}
            <div className='proveedores-footer'>
                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={filteredTotalRecords}
                    onPageChange={onPageChange}
                    rowsPerPageOptions={[15]}
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    className="custom-paginator"
                />
            </div>
    
        </div>
    )
}

export default Proveedores;