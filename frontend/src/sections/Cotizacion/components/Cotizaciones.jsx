import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/apiService';
import '../styles/Cotizacion.css';

function formatFecha(dateStr){
  try{ const d = new Date(dateStr); return d.toLocaleDateString('es-PE', { weekday:'short', day:'2-digit', month:'short', year:'2-digit' }); }catch{ return dateStr; }
}

export default function Cotizaciones(){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    let mounted = true;
    (async() => {
      try {
        const data = await apiService.getCotizaciones();
        if(mounted) setRows(data);
      } catch (e) { console.error(e); }
      finally { if(mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if(!q) return rows;
    return rows.filter(r => r?.cliente?.nombre?.toLowerCase().includes(q.toLowerCase()));
  }, [rows, q]);

  return (
    <div className="cotz-page">
      <div className="cotz-header">
        <h2>Cotización</h2>
        <button className="btn-primary" onClick={()=>navigate('/cotizaciones/nuevo')}>+ Nuevo</button>
      </div>

      <div className="cotz-search">
        <span className="icon pi pi-search"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar cliente"/>
      </div>

      <div className="table">
        <div className="thead">
          <div>Nombre del cliente</div>
          <div>Categoría</div>
          <div>% Utilidad</div>
          <div>Código reserva</div>
          <div>Fecha viaje</div>
          <div>Estado</div>
          <div>Acción</div>
        </div>
        <div className="tbody">
          {loading ? (<div className="empty">Cargando…</div>) : (
            filtered.length ? filtered.map((r)=> (
              <div className="tr" key={r.id}>
                <div>
                  <div className="client-name">{r?.cliente?.nombre}</div>
                  <div className="sub">Cotización: OPERADOR TOUR | Agencia: {r.agencia} | País: {r.pais} | Idioma: {r.idioma} | Nro. pax: {r.nroPax} | Nro. Niños(as): {r.nroNinos}</div>
                </div>
                <div>{r.categoria === 'Priv' ? 'VIP' : r.categoria}</div>
                <div>{Number(r.utilidad).toFixed(0)}%</div>
                <div>{r.codigoReserva}</div>
                <div>{formatFecha(r.fechaViaje)}</div>
                <div>{r.estado}</div>
                <div className="acciones">
                  <button className="btn-icon" title="Ver">⟶</button>
                </div>
              </div>
            )) : (<div className="empty">Sin resultados</div>)
          )}
        </div>
      </div>
    </div>
  );
}
