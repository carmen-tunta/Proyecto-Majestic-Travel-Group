import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useState, useEffect } from "react";
import TarifaIncrementRepository from "../../../../modules/TarifaIncrement/repository/TarifaIncrementRepository";
import GetTarifaIncrementByTarifaId from "../../../../modules/TarifaIncrement/application/GetTarifaIncrementByTarifaId";
import DeleteTarifaIncrement from "../../../../modules/TarifaIncrement/application/DeleteTarifaIncrement";
import { useNotification } from "../../../Notification/NotificationContext";
import { useModal } from "../../../../contexts/ModalContext";

import "../../styles/Tarifario/Incremento.css"
import IncrementoModal from "./IncrementoModal";


const Incremento = ({ tarifa }) => {

    const [increments, setIncrements] = useState([]);
    const [selectedIncrement, setSelectedIncrement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [visibleDialog, setVisibleDialog] = useState(false);
    const {showNotification} = useNotification();

    const { setIsModalOpen } = useModal();
    const [showModal, setShowModal] = useState(false);

    const tarifaIncrementRepo = new TarifaIncrementRepository();
    const getTarifaIncrements = new GetTarifaIncrementByTarifaId(tarifaIncrementRepo);
    const deleteTarifaIncrement = new DeleteTarifaIncrement(tarifaIncrementRepo);


    const fetchIncrements = async () => {
        try {
            setLoading(true);
            const data = await getTarifaIncrements.execute(tarifa.id);
            setIncrements(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching increments:", error);
        } finally {
            setLoading(false);
        }
        
    };

    useEffect(() => {
        fetchIncrements();
    }, []);

    const handleEdit = (increment) => {
        setSelectedIncrement(increment);
        setShowModal(true);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedIncrement(null);
        setShowModal(true);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            if (selectedIncrement) {
                await deleteTarifaIncrement.execute(selectedIncrement.id);
                setVisibleDialog(false);
                setSelectedIncrement(null);
                showNotification("¡Incremento eliminado!", "success");
                fetchIncrements();
            }
        } catch (error) {
            console.error("Error deleting increment:", error);
            showNotification("Error al eliminar el incremento", "error");
        }
    };

    const reject = () => {
        setSelectedIncrement(null);
        setVisibleDialog(false);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsModalOpen(false);
        fetchIncrements();
    };


    return (    
        <div className="incremento-body">
            <div className="incremento-header">
                <h3>Tabla de incremento</h3>
                <Button
                    icon="pi pi-plus"
                    label="Nuevo"
                    size='small'
                    outlined
                    onClick={() => handleNew()}
                />
            </div>
            <div>
                <DataTable
                    className="incremento-table"
                    value={increments || []}
                    emptyMessage="No se registraron incrementos"
                    loading={loading}
                >
                    <Column 
                        field="incrementDate" 
                        header="Fecha de incremento" 
                        body={rowData => {
                            if (!rowData.incrementDate) return '';
                            try {
                                const part = typeof rowData.incrementDate === 'string' && rowData.incrementDate.includes('T')
                                  ? rowData.incrementDate.split('T')[0]
                                  : rowData.incrementDate;
                                const [y, m, d] = part.split('-').map(Number);
                                const dt = new Date(y, m - 1, d, 12, 0, 0);
                                let formatted = dt.toLocaleDateString('es-ES', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                });
                                formatted = formatted.replace(/,/g, '').split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');
                                return formatted;
                            } catch { return rowData.incrementDate; }
                        }}
                        style={{ width: '20%' }}
                    />
                    <Column 
                        field="percentage"  
                        header="Porcentaje" 
                        body={rowData => {
                            if(rowData.percentage) return "Si"; else return "No";
                        }}
                        style={{ width: '20%' }} 
                    />
                    <Column 
                        field="incrementValue" 
                        header="Valor de incremento" 
                        body={rowData => {
                            const value = Number(rowData.incrementValue);
                            return Number.isInteger(value) ? value : value.toFixed(2).replace(/\.00$/, '');
                        }}
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
                                    onClick={() => handleEdit(rowData)}
                                ></i>
                                <i 
                                    className="pi pi-trash"    
                                    title="Eliminar" 
                                    style={{ cursor:"pointer" }}
                                    onClick={() => {setSelectedIncrement(rowData); setVisibleDialog(true);}}    
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
                message="¿Está seguro de que desea eliminar este registro?"
                header="Confirmación" 
                icon="pi pi-exclamation-triangle" 
                accept={() => {handleDelete();}}
                reject={() => reject()} 
            />

            {showModal && (
                <IncrementoModal
                    visible={showModal}
                    onHide={handleModalClose}
                    increment={selectedIncrement}
                    tarifa={tarifa}
                />
            )}

        </div>
    );
}

export default Incremento;