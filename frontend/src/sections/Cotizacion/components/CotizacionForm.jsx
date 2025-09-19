import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/apiService';
import { useNotification } from '../../Notification/NotificationContext';
import '../styles/Cotizacion.css';

const categorias = ['Privado','Compartido','Priv'];
const estados = ['Iniciado','Proceso','Finalizado'];
const agencias = ['Viator','Civitatis','GetYourGuide','TourRadar','TripAdvisor','Peru Hop','Inca Rail','PeruRail','Lima Tours','Condor Travel'];
const paises = ['Perú','Bolivia','Chile','Argentina','Brasil','Ecuador','Colombia','España','Estados Unidos','Francia'];
const idiomas = ['Español','Inglés','Francés','Alemán','Portugués','Italiano'];

export default function CotizacionForm(){
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [anio] = useState(new Date().getFullYear());
  const [numeroFile, setNumeroFile] = useState('');
  const [clientQuery, setClientQuery] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [form, setForm] = useState({
    nombreCotizacion: '', categoria: categorias[0], fechaViaje: '', estado: estados[0], agencia: agencias[0], pais: paises[0], idioma: idiomas[0], utilidad: 18, nroPax: 1, nroNinos: 0, codigoReserva: ''
  });

  useEffect(()=>{
    const id = setTimeout(async()=>{
      if(clientQuery){
        try{ const res = await apiService.searchClients(clientQuery); setClientResults(res);}catch(e){ console.error(e);}    
      } else { setClientResults([]);}    
    }, 300);
    return ()=> clearTimeout(id);
  },[clientQuery]);

  async function onSave(){
    if(!selectedClient){ showNotification('Selecciona un cliente','error'); return; }
    if(!form.fechaViaje){ showNotification('Fecha de viaje requerida','error'); return; }
    try{
      const payload = { 
        clienteId: selectedClient.id,
        nombreCotizacion: form.nombreCotizacion || undefined,
        categoria: form.categoria,
        utilidad: Number(form.utilidad),
        codigoReserva: form.codigoReserva || Math.random().toString(36).slice(2,10).toUpperCase(),
        fechaViaje: form.fechaViaje,
        estado: form.estado,
        agencia: form.agencia,
        pais: form.pais,
        idioma: form.idioma,
        nroPax: Number(form.nroPax),
        nroNinos: Number(form.nroNinos) || 0,
        anio,
        // numeroFile omitted so backend assigns it
      };
  const saved = await apiService.createCotizacion(payload);
  setNumeroFile(saved.numeroFile);
  showNotification('Cotización guardada','success');
    }catch(e){ showNotification(e.message || 'Error al guardar','error'); }
  }

  return (
    <div className="cotz-form-page">
      <div className="cotz-header">
        <button className="btn-link" onClick={()=>navigate('/cotizaciones')}>←</button>
        <h2 style={{marginLeft:8}}>Cotizaciones</h2>
      </div>

      <div className="tabs">
        <button className="tab active">Cotización</button>
        <button className="tab" disabled>Nombre de pasajeros</button>
      </div>

      <div className="form-card">
        <div className="row">
          <div className="label">Año: <b>{anio}</b></div>
          <div className="label">File: <b>{numeroFile || ''}</b></div>
          <button className="btn-outline" onClick={onSave}>Guardar para continuar</button>
        </div>

        <div className="grid">
          <div className="col span-2">
            <label>Nombre del cliente</label>
            <div className="search-select">
              <input value={clientQuery} onChange={e=>{ setClientQuery(e.target.value); setSelectedClient(null); }} placeholder="Nombre del cliente"/>
              {clientQuery && (
                <div className="dropdown">
                  {clientResults.map(c => (
                    <div key={c.id} className="option" onClick={()=>{ setSelectedClient(c); setClientQuery(c.nombre); setClientResults([]); }}>
                      {c.nombre}
                    </div>
                  ))}
                  {!clientResults.length && <div className="option disabled">Sin resultados</div>}
                </div>
              )}
            </div>
          </div>
          <div>
            <label>Privado, compartido, vip</label>
            <select value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}>{categorias.map(x=> <option key={x}>{x}</option>)}</select>
          </div>
          <div>
            <label>Fecha de viaje</label>
            <input type="date" value={form.fechaViaje} onChange={e=>setForm(f=>({...f,fechaViaje:e.target.value}))}/>
          </div>
          <div>
            <label>Estado</label>
            <select value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}>{estados.map(x=> <option key={x}>{x}</option>)}</select>
          </div>

          <div className="span-2">
            <label>Nombre de cotización</label>
            <input value={form.nombreCotizacion} onChange={e=>setForm(f=>({...f,nombreCotizacion:e.target.value}))} placeholder="Nombre de cotización"/>
          </div>
          <div>
            <label>Agencia</label>
            <select value={form.agencia} onChange={e=>setForm(f=>({...f,agencia:e.target.value}))}>{agencias.map(x=> <option key={x}>{x}</option>)}</select>
          </div>
          <div>
            <label>Código de reserva</label>
            <input value={form.codigoReserva} onChange={e=>setForm(f=>({...f,codigoReserva:e.target.value}))} placeholder="Código de reserva"/>
          </div>

          <div>
            <label>País</label>
            <select value={form.pais} onChange={e=>setForm(f=>({...f,pais:e.target.value}))}>{paises.map(x=> <option key={x}>{x}</option>)}</select>
          </div>
          <div>
            <label>Idioma</label>
            <select value={form.idioma} onChange={e=>setForm(f=>({...f,idioma:e.target.value}))}>{idiomas.map(x=> <option key={x}>{x}</option>)}</select>
          </div>
          <div>
            <label>Nro. Paxs</label>
            <input type="number" min="1" value={form.nroPax} onChange={e=>setForm(f=>({...f,nroPax:e.target.value}))}/>
          </div>
          <div>
            <label>Nro Niños(as)</label>
            <input type="number" min="0" value={form.nroNinos} onChange={e=>setForm(f=>({...f,nroNinos:e.target.value}))}/>
          </div>
          <div>
            <label>% de utilidad</label>
            <input type="number" min="0" max="100" value={form.utilidad} onChange={e=>setForm(f=>({...f,utilidad:e.target.value}))}/>
          </div>
          <div className="span-2">
            <label>Observación</label>
            <input placeholder="" disabled/>
          </div>
        </div>
      </div>

      <div className="center">CONSTRUIR EXPERIENCIAS</div>
    </div>
  );
}
