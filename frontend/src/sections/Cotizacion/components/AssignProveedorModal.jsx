import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { apiService } from '../../../services/apiService';

export default function AssignProveedorModal({
  visible,
  onHide,
  cscId,
  componentId,
  pax,
  serviceType,
  date,
  onAssigned,
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  // Normaliza cualquier fecha/Date a clave 'YYYY-MM-DD' en hora LOCAL
  function localDayKey(value) {
    try {
      if (!value) return null;
      if (typeof value === 'string') {
        // Si ya viene como 'YYYY-MM-DD'
        const m = value.match(/^\d{4}-\d{2}-\d{2}$/);
        if (m) return value;
      }
      const d = new Date(value);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      if (!visible || !componentId || !pax) { setRows([]); return; }
      setLoading(true);
      try {
  // Obtenemos proveedores por componente y pax (pax ya debe incluir adultos + niños)
  const data = await apiService.getProveedoresByComponentAndPax(componentId, pax);
        const mapped = (data || []).map((row) => {
          const proveedor = row.proveedor || {};
          // costoPerPax: costo unitario por pasajero devuelto por la tarifa del proveedor
          const costoPerPax = Number(row.price || row.costo || 0) || 0;
          const totalPax = Number(pax) || 1;
          let incPercent = 0;
          let incMoney = 0;
          // Filtrar incrementos por la fecha del componente en el cliente (día local exacto, ignorar hora)
          const scheduledDay = date ? localDayKey(date) : null;
          (row.increments || []).forEach((inc) => {
            if (scheduledDay) {
              const incDay = inc?.incrementDate ? localDayKey(inc.incrementDate) : null;
              if (incDay !== scheduledDay) return;
            }
            if (inc?.percentage) incPercent += Number(inc.incrementValue) || 0;
            else incMoney += Number(inc.incrementValue) || 0;
          });
          // Regla solicitada:
          // 1) El costo base es por pasajero y debe multiplicarse por el total de pasajeros (adultos + niños)
          // 2) Si el incremento es porcentaje, se aplica sobre el TOTAL (base x pax)
          // 3) Si el incremento es monto fijo, se suma tal cual al TOTAL
          const baseTotal = costoPerPax * totalPax;
          const total = baseTotal * (1 + incPercent / 100) + incMoney;
          // Mostrar solo porcentaje o solo monto
          const incrementoLabel = incPercent > 0
            ? `${incPercent}%`
            : (incMoney ? incMoney.toFixed(2) : '0.00');
          return {
            proveedorId: proveedor.id,
            nombre: proveedor.name || proveedor.nombre || '-',
            costo: baseTotal.toFixed(2),
            incrementoLabel,
            total: total.toFixed(2),
            totalNumber: total,
          };
        });
        if (active) setRows(mapped);
      } catch (e) {
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [visible, componentId, pax, date]);

  async function handleAssign(row) {
    if (!cscId || !row?.proveedorId) return;
    try {
      setLoading(true);
      await apiService.assignProviderToComponent(cscId, row.proveedorId, row.totalNumber);
      if (onAssigned) onAssigned({ cscId, proveedor: { id: row.proveedorId, name: row.nombre }, precio: row.totalNumber });
      onHide && onHide();
    } catch (e) {
      // opcional: mostrar notificación si está disponible en contexto superior
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formatFechaCorta(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const fecha = d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' });
      const hora = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      return `${fecha} ${hora}`;
    } catch { return iso; }
  }

  return (
    <Dialog
      header="ASIGNAR PROVEEDOR"
      visible={visible}
      style={{ width: '820px', maxWidth: '95vw' }}
      modal
      onHide={onHide}
    >
      <div style={{ display: 'flex', gap: 24, marginBottom: 12, fontWeight: 600 }}>
        <div>Tipo de servicio: <span style={{ fontWeight: 700 }}>{serviceType || '-'}</span></div>
        <div>Fecha: <span style={{ fontWeight: 700 }}>{formatFechaCorta(date)}</span></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '92%' }}>
          <DataTable value={rows} loading={loading} responsiveLayout="scroll" stripedRows size="small" onRowDoubleClick={(e) => handleAssign(e.data)}>
            <Column field="nombre" header="Proveedor" style={{ width: '50%' }}></Column>
            <Column field="costo" header={`Costo`} body={(r) => <div style={{ textAlign: 'right', width: '100%' }}>{r.costo}</div>} style={{ width: '17%' }}></Column>
            <Column field="incrementoLabel" header="Incremento" body={(r) => <div style={{ textAlign: 'right', width: '100%' }}>{r.incrementoLabel}</div>} style={{ width: '17%' }}></Column>
            <Column field="total" header="Total" body={(r) => <div style={{ textAlign: 'right', width: '100%' }}>{r.total}</div>} style={{ width: '16%' }}></Column>
            <Column header="" body={(r) => (
              <button className="p-button p-button-sm" onClick={() => handleAssign(r)}>Elegir</button>
            )} style={{ width: 90 }}></Column>
          </DataTable>
          <div style={{ fontSize: 12, color: '#8891a6', marginTop: 8 }}>Montos expresados en USD</div>
        </div>
      </div>
    </Dialog>
  );
}
