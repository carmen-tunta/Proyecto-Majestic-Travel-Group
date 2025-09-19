import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../../services/apiService';
import { useNotification } from '../../Notification/NotificationContext';
import '../styles/Cotizacion.css';

// Formatea fecha a 'Jue 25 Dic 25'
function formatFecha(dateStr){
  try {
    const d = new Date(dateStr);
    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${dias[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} ${meses[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
  } catch { return dateStr; }
}

const categorias = ['Privado','Compartido','Priv'];
const estados = ['Iniciado','Proceso','Finalizado'];
const agencias = ['Viator','Civitatis','GetYourGuide','TourRadar','TripAdvisor','Peru Hop','Inca Rail','PeruRail','Lima Tours','Condor Travel'];
const paises = ['Perú','Bolivia','Chile','Argentina','Brasil','Ecuador','Colombia','España','Estados Unidos','Francia'];
const idiomas = ['Español','Inglés','Francés','Alemán','Portugués','Italiano'];

export default function CotizacionForm(){
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { showNotification } = useNotification();

  const [anio, setAnio] = useState(new Date().getFullYear());
  const [cotizacionId, setCotizacionId] = useState(null);
  const [numeroFile, setNumeroFile] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [searchType, setSearchType] = useState('service');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCS, setSelectedCS] = useState(null);
  const [clientQuery, setClientQuery] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [form, setForm] = useState({
    nombreCotizacion: '',
    categoria: categorias[0],
    fechaViaje: '',
    estado: estados[0],
    agencia: agencias[0],
    pais: paises[0],
    idioma: idiomas[0],
    utilidad: 18,
    nroPax: 1,
    nroNinos: 0,
    codigoReserva: ''
  });

  useEffect(()=>{
    (async()=>{
      if(routeId){
        try{
          const base = await apiService.getCotizaciones();
          const found = (base||[]).find(c=> String(c.id)===String(routeId));
          if(found){
            setCotizacionId(found.id);
            setNumeroFile(found.numeroFile || '');
            setAnio(found.anio || new Date().getFullYear());
            setForm(f=>({
              ...f,
              nombreCotizacion: found.nombreCotizacion || '',
              categoria: found.categoria,
              // dejamos fechaViaje vacía para evitar formato no ISO en input
              estado: found.estado,
              agencia: found.agencia,
              pais: found.pais,
              idioma: found.idioma,
              utilidad: found.utilidad,
              nroPax: found.nroPax,
              nroNinos: found.nroNinos,
              codigoReserva: found.codigoReserva
            }));
            setSelectedClient(found.cliente || null);
            setClientQuery(found.cliente?.nombre || '');
            const det = await apiService.getCotizacionDetalle(found.id);
            setDetalle(det);
          }
        }catch(e){ /* noop */ }
      }
    })();
  }, [routeId]);

  useEffect(()=>{
    const id = setTimeout(async()=>{
      if(clientQuery){
        try{ const res = await apiService.searchClients(clientQuery); setClientResults(res);}catch(e){ setClientResults([]);}    
      } else { setClientResults([]);}    
    }, 300);
    return ()=> clearTimeout(id);
  },[clientQuery]);

  useEffect(()=>{
    let active = true;
    const h = setTimeout(async()=>{
      if(!cotizacionId || !searchQuery){ setSuggestions([]); return; }
      setIsSearching(true);
      try{
        const res = searchType==='service' ? await apiService.searchServices(searchQuery) : await apiService.searchComponents(searchQuery);
        if(active) { setSuggestions(Array.isArray(res)? res.slice(0,8): []); setSelectedSuggestion(null); }
      }catch{ if(active) setSuggestions([]); }
      finally{ if(active) setIsSearching(false); }
    }, 300);
    return ()=>{ active=false; clearTimeout(h); };
  },[searchQuery, searchType, cotizacionId]);

  async function refreshDetalle(id){
    try{ const det = await apiService.getCotizacionDetalle(id); setDetalle(det); }catch{}
  }

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
        fechaViaje: form.fechaViaje, // enviar ISO
        estado: form.estado,
        agencia: form.agencia,
        pais: form.pais,
        idioma: form.idioma,
        nroPax: Number(form.nroPax),
        nroNinos: Number(form.nroNinos) || 0,
        anio,
      };
      const saved = cotizacionId ? await apiService.updateCotizacion(cotizacionId, payload) : await apiService.createCotizacion(payload);
      setNumeroFile(saved.numeroFile);
      const id = saved.id ?? saved.cotizacionId ?? cotizacionId;
      setCotizacionId(id);
      await refreshDetalle(id);
      showNotification(cotizacionId ? 'Cotización actualizada' : 'Cotización guardada','success');
    }catch(e){ showNotification(e.message || 'Error al guardar','error'); }
  }

  async function onAdd(){
    if(!cotizacionId) { showNotification('Guarda la cotización primero','error'); return; }
    try{
      if(searchType==='service'){
        const item = selectedSuggestion || suggestions[0];
        if(!item){ showNotification('Selecciona un servicio','error'); return; }
        await apiService.addServiceToCotizacion(cotizacionId, { serviceId: item.id });
        await refreshDetalle(cotizacionId);
        setSearchQuery(''); setSuggestions([]); setSelectedSuggestion(null);
      } else {
        if(!selectedCS){ showNotification('Selecciona un servicio en la lista para agregar componentes','error'); return; }
        const item = selectedSuggestion; // usar solo selección explícita
        if(item && item.id){
          await apiService.addComponentsToCotizacionService(selectedCS, [item.id]);
        } else {
          // Crear componente extra con el texto buscado
          const nombre = (searchQuery || '').trim();
          if(!nombre){ showNotification('Escribe el nombre del componente','error'); return; }
          await apiService.addExtraComponentToCotizacionService(selectedCS, { nombre });
        }
        await refreshDetalle(cotizacionId);
        setSearchQuery(''); setSuggestions([]); setSelectedSuggestion(null);
      }
    }catch(e){ showNotification(e.message || 'No se pudo agregar','error'); }
  }

  const totalServicios = (detalle?.servicios||[]).reduce((acc,s)=> acc + (Number(s.precio)||0) + (s.componentes||[]).reduce((a,c)=> a + (Number(c.precio)||0),0), 0);
  const costoPorPasajero = form.nroPax ? totalServicios / Number(form.nroPax) : 0;
  const precioVenta = totalServicios * (1 + Number(form.utilidad||0)/100);

  // Handlers para notas y precios (servicio y componente)
  async function handleServicePriceBlur(serviceId, value){
    const precio = Number(value);
    if(Number.isNaN(precio)) { showNotification('Precio inválido','error'); return; }
    try {
      await apiService.updateCotizacionService(serviceId, { precio });
      await refreshDetalle(cotizacionId);
    } catch(e){ showNotification(e.message || 'No se pudo guardar el precio','error'); }
  }

  async function handleComponentAddNote(componentItemId){
    const nota = window.prompt('Agregar nota para el componente');
    if(nota === null) return;
    try {
      await apiService.updateCotizacionServiceComponent(componentItemId, { nota });
      await refreshDetalle(cotizacionId);
    } catch(e){ showNotification(e.message || 'No se pudo guardar la nota','error'); }
  }

  async function handleComponentPriceBlur(componentItemId, value){
    const precio = Number(value);
    if(Number.isNaN(precio)) { showNotification('Precio inválido','error'); return; }
    try {
      await apiService.updateCotizacionServiceComponent(componentItemId, { precio });
      await refreshDetalle(cotizacionId);
    } catch(e){ showNotification(e.message || 'No se pudo guardar el precio','error'); }
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
          <button className="btn-outline" onClick={onSave}>{cotizacionId ? 'Actualizar' : 'Guardar para continuar'}</button>
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
            {form.fechaViaje && (
              <div style={{fontSize:'13px',color:'#1976d2',marginTop:2}}>
                {formatFecha(form.fechaViaje)}
              </div>
            )}
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

      {cotizacionId && (
        <div className="form-card" style={{marginTop:16}}>
          {detalle?.servicios?.length > 0 ? (
            <div>
              {detalle.servicios.map(s => (
                <div key={s.id} onClick={()=>setSelectedCS(s.id)} style={{padding:12,border:'2px solid #2c7be5',borderRadius:8,marginBottom:12, background: selectedCS===s.id? '#eaf4ff' : 'transparent', cursor:'pointer'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <button title="Eliminar servicio" className="btn-icon" onClick={(e)=>{ e.stopPropagation(); apiService.deleteCotizacionService(s.id).then(()=> refreshDetalle(cotizacionId)); }}>
                        🗑️
                      </button>
                      <div style={{fontWeight:600}}>{s.service?.name}</div>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <input
                        defaultValue={Number(s.precio||0).toFixed(2)}
                        onClick={(e)=> e.stopPropagation()}
                        onBlur={(e)=> handleServicePriceBlur(s.id, e.target.value)}
                        placeholder="0.00"
                        style={{width:70,padding:'6px 8px',border:'1px solid #cfd6e4',borderRadius:6}}
                      />
                    </div>
                  </div>
                  {s.componentes?.map(ci => (
                    <div key={ci.id} style={{display:'grid', gridTemplateColumns:'auto 1fr auto 70px', gap:8, alignItems:'center', marginLeft:16, color:'#293241', padding:'6px 0'}}>
                      <button title="Eliminar componente" className="btn-icon" onClick={(e)=>{ e.stopPropagation(); apiService.deleteCotizacionServiceComponent(ci.id).then(()=> refreshDetalle(cotizacionId)); }}>
                        🗑️
                      </button>
                      <div>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span style={{opacity:.7}}>Fecha y hora</span>
                          <span style={{fontSize:12, color:'#6b7280'}}>(definir)</span>
                        </div>
                        <div style={{fontWeight:600}}>{ci.component?.componentName || ci.nombreExtra}</div>
                        <button className="btn-outline" style={{padding:'4px 8px', marginTop:4}} onClick={(e)=>{ e.stopPropagation(); /* asignar proveedor - placeholder */ }}>Asignar proveedor</button>
                        {ci.nota && (
                          <div style={{ color:'#6b7280', fontSize:12, marginTop:4 }}>{ci.nota}</div>
                        )}
                      </div>
                      <button className="btn-outline" style={{padding:'4px 8px'}} onClick={(e)=>{ e.stopPropagation(); handleComponentAddNote(ci.id); }}>Agregar nota</button>
                      <input
                        defaultValue={Number(ci.precio||0).toFixed(2)}
                        onClick={(e)=> e.stopPropagation()}
                        onBlur={(e)=> handleComponentPriceBlur(ci.id, e.target.value)}
                        placeholder="0.00"
                        style={{width:70,padding:'6px 8px',border:'1px solid #cfd6e4',borderRadius:6}}
                      />
                    </div>
                  ))}
                  {selectedCS===s.id && (
                    <div style={{marginTop:8,color:'#1976d2',fontSize:12}}>Seleccionado para agregar componentes</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{color:'#8891a6'}}>Aún no hay servicios agregados</div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'1fr 240px',gap:16,marginTop:8,alignItems:'start'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:12}}>
                <label><input type="radio" name="searchType" checked={searchType==='service'} onChange={()=>setSearchType('service')}/> Buscar servicio</label>
                <label><input type="radio" name="searchType" checked={searchType==='component'} onChange={()=>setSearchType('component')}/> Buscar componente</label>
              </div>
              <div style={{display:'flex',gap:8,position:'relative'}}>
                <span className="icon pi pi-search" style={{position:'absolute',left:10,top:9,opacity:.6}}/>
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder={'Ingresar criterio de búsqueda'} style={{flex:1,padding:'8px 30px',border:'1px solid #cfd6e4',borderRadius:6}}/>
                <button
                  className="btn-outline"
                  onClick={onAdd}
                  disabled={
                    searchType==='service'
                      ? (!suggestions.length && !selectedSuggestion)
                      : (searchQuery.trim().length===0)
                  }
                >Agregar</button>
                {isSearching && <div style={{position:'absolute',right:120,top:10,fontSize:12,color:'#98a2b3'}}>Buscando…</div>}
                {suggestions.length>0 && (
                  <div className="dropdown" style={{top:'2.4rem'}}>
                    {suggestions.map(s=>(
                      <div key={s.id} className="option" onClick={()=>{ setSelectedSuggestion(s); setSearchQuery((s.name||s.componentName||'').toString()); }}>
                        {s.name || s.componentName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{border:'1px dashed #cfd6e4',borderRadius:8,padding:'12px 16px',color:'#333'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span>Costo por pasajero</span><span>{costoPorPasajero.toFixed(2)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                <span>Utilidad {Number(form.utilidad||0)}%</span><span>{(totalServicios * Number(form.utilidad||0)/100).toFixed(2)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontWeight:700}}>
                <span>Precio de venta</span><span>{precioVenta.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
