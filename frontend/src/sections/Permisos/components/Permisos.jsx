// (Componente completo más abajo)
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { ProgressSpinner } from 'primereact/progressspinner';
import { apiService } from '../../../services/apiService';
import './Permisos.css';
import '../../Cotizacion/styles/PasajerosTab.css';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { usePermissions } from '../../../contexts/PermissionsContext';

// Opciones de estado (combobox crear usuario)
const ESTADOS = [ { label:'Activo', value:'activo'}, { label:'Suspendido', value:'suspendido'} ];

// Formatea fecha estilo: Jue 25 set 25
function formatSpanishDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  let formatted = date.toLocaleDateString('es-ES', { weekday:'short', day:'2-digit', month:'short', year:'2-digit' });
  return formatted
    .replace(/,/g,'')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase()+w.slice(1))
    .join(' ');
}

const Permisos = () => {
  // Tabs
  const [activeIndex, setActiveIndex] = useState(0);

  // Usuarios
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Permisos / módulos
  const [modules, setModules] = useState([]); // [{ id, code, name, actions:[{id, action, label}] }]
  const [userPerms, setUserPerms] = useState([]); // [{ action: { id, action, module:{ code } } }]
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);

  // Nuevo usuario
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nombre:'', email:'', area:'', username:'', status:'activo' });

  const { user: authUser } = useAuth();
  const { isAdmin, refresh: refreshPerms } = usePermissions();
  const toast = useRef();

  // Carga usuarios
  const loadUsers = async () => {
    setLoadingUsers(true);
    try { setUsers(await apiService.getUsers()); }
    catch(e){ toast.current?.show({ severity:'error', summary:'Error', detail:e.message }); }
    finally { setLoadingUsers(false); }
  };

  // Carga módulos definidos
  const loadModules = async () => {
    setLoadingModules(true);
    try { setModules(await apiService.listPermissionModules()); }
    catch(e){ /* noop */ }
    finally { setLoadingModules(false); }
  };

  // Carga permisos de un usuario
  const loadUserPerms = async (user) => {
    if (!user) return;
    setLoadingPerms(true);
    try { setUserPerms(await apiService.getUserPermissions(user.id)); }
    catch(e){ toast.current?.show({ severity:'error', summary:'Error', detail:e.message }); }
    finally { setLoadingPerms(false); }
  };

  // Efectos inicial / cuando cambia usuario
  useEffect(() => { loadUsers(); loadModules(); }, []);
  useEffect(() => { if (selectedUser) loadUserPerms(selectedUser); }, [selectedUser]);

  // Helpers
  const userHasAction = (moduleCode, actionCode) => userPerms.some(p => p.action.module.code === moduleCode && p.action.action === actionCode);

  // Compute latest grantedAt per module from userPerms
  const moduleUpdatedMap = useMemo(() => {
    const map = {};
    for (const p of userPerms || []) {
      const mod = p?.action?.module?.code;
      if (!mod) continue;
      const dateStr = p?.grantedAt || p?.action?.grantedAt || null;
      const ts = dateStr ? Date.parse(dateStr) : NaN;
      if (!isNaN(ts)) {
        if (!map[mod] || ts > map[mod]) map[mod] = ts;
      }
    }
    return map;
  }, [userPerms]);

  // Toggle acción individual
  const toggleAction = async (moduleObj, actionObj, checked) => {
    if (!selectedUser) return;
    if (!isAdmin) {
      toast.current?.show({ severity:'warn', summary:'Solo administradores', detail:'No tienes permisos para modificar.' });
      return;
    }
    if (authUser && selectedUser.id === authUser.id) {
      toast.current?.show({ severity:'warn', summary:'No permitido', detail:'No puedes modificar tus propios permisos.' });
      return;
    }
    try {
      const moduleCode = moduleObj.code;
      const actionCode = actionObj.action;
      // Find view action id for this module (if exists)
      const viewAction = (moduleObj.actions || []).find(a => a.action === 'VIEW');

      if (checked) {
        // If granting CREATE/EDIT/DELETE and VIEW not present, grant VIEW too
        const idsToGrant = [actionObj.id];
        if (actionCode !== 'VIEW' && viewAction && !userHasAction(moduleCode, 'VIEW')) {
          idsToGrant.unshift(viewAction.id);
        }
        if (idsToGrant.length) await apiService.grantUserPermissions(selectedUser.id, idsToGrant);
      } else {
        // Unchecking
        if (actionCode === 'VIEW') {
          // If other actions exist, prevent removing VIEW until they are removed first
          const othersActive = (moduleObj.actions || []).some(a => a.action !== 'VIEW' && userHasAction(moduleCode, a.action));
          if (othersActive) {
            toast.current?.show({ severity:'warn', summary:'Acción requerida', detail:'Desactiva primero Crear/Editar/Eliminar antes de quitar Ver.' });
            return;
          }
          // safe to revoke VIEW
          await apiService.revokeUserPermissions(selectedUser.id, [actionObj.id]);
        } else {
          // revoke only this action
          await apiService.revokeUserPermissions(selectedUser.id, [actionObj.id]);
        }
      }
      await loadUserPerms(selectedUser);
      // notify global permissions context to refresh menus if changed
      try { refreshPerms(); } catch (e) { /* noop */ }
    } catch(e){ toast.current?.show({ severity:'error', summary:'Error', detail:e.message }); }
  };

  // Ocultar módulo (revoca todas) o mostrar (activa todas inicialmente)
  const toggleHideModule = async (moduleObj, hide) => {
    if (!selectedUser) return;
    if (!isAdmin) {
      toast.current?.show({ severity:'warn', summary:'Solo administradores', detail:'No tienes permisos para modificar.' });
      return;
    }
    if (authUser && selectedUser.id === authUser.id) {
      toast.current?.show({ severity:'warn', summary:'No permitido', detail:'No puedes modificar tu propio módulo.' });
      return;
    }
    const actionIds = moduleObj.actions.map(a => a.id);
    try {
      if (hide) await apiService.revokeUserPermissions(selectedUser.id, actionIds);
      else await apiService.grantUserPermissions(selectedUser.id, actionIds); // activa todo; luego puede desmarcar granular
      loadUserPerms(selectedUser);
    } catch(e){ toast.current?.show({ severity:'error', summary:'Error', detail:e.message }); }
  };

  // Activar módulo (similar a mostrar) / desactivar (revocar todas)
  const toggleActivateModule = async (moduleObj, activate) => {
    if (!selectedUser) return;
    if (!isAdmin) {
      toast.current?.show({ severity:'warn', summary:'Solo administradores', detail:'No tienes permisos para modificar.' });
      return;
    }
    if (authUser && selectedUser.id === authUser.id) {
      toast.current?.show({ severity:'warn', summary:'No permitido', detail:'No puedes modificar tu propio módulo.' });
      return;
    }
    const actionIds = moduleObj.actions.map(a => a.id);
    try {
      if (activate) {
        // Solo asigna las que faltan para no tocar selecciones existentes (aunque al activar desde oculto se habían revocado todas)
        const missing = actionIds.filter(id => !userPerms.some(p => p.action.id === id));
        if (missing.length) await apiService.grantUserPermissions(selectedUser.id, missing);
      } else {
        await apiService.revokeUserPermissions(selectedUser.id, actionIds);
      }
      loadUserPerms(selectedUser);
    } catch(e){ toast.current?.show({ severity:'error', summary:'Error', detail:e.message }); }
  };

  // Crear usuario
  const openNew = () => { setForm({ nombre:'', email:'', area:'', username:'', status:'activo' }); setShowNew(true); };
  const createUser = async () => {
    setCreating(true);
    try {
      const payload = { ...form };
  const { user } = await apiService.createUserAdmin(payload);
  toast.current?.show({ severity:'success', summary:'Usuario creado', detail: 'Se ha creado el usuario correctamente. La contraseña fue enviada al correo.' });
      setShowNew(false); loadUsers();
    } catch(e){ toast.current?.show({ severity:'error', summary:'Error', detail:e.message }); }
    finally { setCreating(false); }
  };

  // Tabla Usuarios
  const UsersTab = (
      <div className="pasajeros-tab">
        <div className="pasajeros-header">
          <div className="pasajeros-title">
            <h3 style={{ margin:0 }}>Usuarios</h3>
            <p className="cotizacion-info">Administración de usuarios y sus permisos</p>
          </div>
          <div className="pasajeros-actions">
            {isAdmin && (
              <Button onClick={openNew} label="Nuevo" icon="pi pi-plus" outlined className="btn-nuevo-usuario" />
            )}
          </div>
        </div>      <div className="card" style={{ borderRadius:8 }}>
        <div style={{ padding: '12px' }}>
          <DataTable
            value={users}
            loading={loadingUsers}
            size='small'
            emptyMessage="No hay usuarios"
            onRowClick={e => { setSelectedUser(e.data); setActiveIndex(1); }}
            paginator
            rows={4}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            paginatorClassName="custom-paginator"
            style={{ cursor:'pointer' }}
            className="usuarios-datatable"
          >
            <Column field="nombre" header="Nombres" body={r => <span style={{ fontWeight:500 }} data-label="Nombres">{r.nombre}</span>} sortable />
            <Column field="email" header="Correo" body={r => <span data-label="Correo">{r.email}</span>} sortable />
            <Column field="area" header="Area" body={r => <span data-label="Área">{r.area}</span>} />
            <Column field="username" header="Usuario" body={r => <span data-label="Usuario">{r.username}</span>} sortable />
            <Column header="Fecha registrada" body={r => <span data-label="Fecha registrada">{formatSpanishDate(r.createdAt)}</span>} sortable sortField="createdAt" />
            <Column header="Estado" body={r => <span className={`user-status ${r.status}`} data-label="Estado">{r.status === 'activo' ? 'Activo' : 'Suspendido'}</span>} />
          </DataTable>
        </div>
      </div>
    </div>
  );

  // Tabla Permisos
  const PermsTab = (
    <div style={{ padding:'0.25rem 0.5rem' }}>
      {selectedUser ? (
        <>
          <h2 style={{ fontSize:20, margin:'0 0 .25rem 0' }}>Permisos</h2>
          <div style={{ margin:'0 0 .75rem 0', color:'#555', fontSize:14 }}>
            <div style={{ fontWeight:600 }}>{selectedUser.nombre || selectedUser.username}</div>
            <div>{selectedUser.area || ''}</div>
          </div>
          <div className='card' style={{ borderRadius:8, padding:0 }}>
            {(loadingModules || loadingPerms) ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'2.5rem' }}>
                <ProgressSpinner style={{ width:40, height:40 }} />
              </div>
            ) : (
              <div style={{ maxHeight:'60vh', overflowY:'auto' }}>
                <table className='permisos-table' style={{ fontSize:14 }}>
                  <thead>
                    <tr>
                      <th style={{ width:'38%' }}>Módulo</th>
                      <th style={{ width:'14%' }}>Ocultar</th>
                      <th style={{ width:'14%' }}>Activar</th>
                      <th style={{ width:'20%' }}>Fecha actualizada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding:'2rem', textAlign:'center', color:'#777' }}>
                          No hay módulos de permisos cargados. Verifica que el backend haya ejecutado el seed.
                        </td>
                      </tr>
                    )}
                    {modules.map(m => {
                      // Mantener solo acciones importantes y en orden
                      const order = ['VIEW','CREATE','EDIT','DELETE','EXPORT','ASSIGN'];
                      const labelMap = { VIEW:'Ver', CREATE:'Crear', EDIT:'Editar', DELETE:'Eliminar', EXPORT:'Exportar', ASSIGN:'Asignar' };
                      const actions = (m.actions || [])
                        .filter(a => order.includes(a.action))
                        .sort((a,b) => order.indexOf(a.action) - order.indexOf(b.action))
                        .map(a => ({ ...a, uiLabel: a.label || labelMap[a.action] || a.action }));

                      if (actions.length === 0) return null; // omitir módulos sin acciones relevantes
                      const hasAny = actions.some(a => userHasAction(m.code, a.action));
                      const hidden = !hasAny; // Ocultar cuando no tiene ninguna acción
                      const activarChecked = hasAny; // Según screenshot: activar marcado aunque no todas las acciones estén activas
                      const actionIds = actions.map(a => a.id);
                      return (
                        <React.Fragment key={m.id}>
                          <tr className='module-row'>
                            <td className='permisos-module-name' data-label="Módulo">{m.nombre || m.name || m.code}</td>
                            <td data-label="Ocultar">
                              <Checkbox
                                inputId={`hide-${m.id}`}
                                checked={hidden}
                                disabled={!isAdmin || (authUser && selectedUser.id === authUser.id)}
                                onChange={e => toggleHideModule(m, e.checked)}
                              />
                            </td>
                            <td data-label="Activar" style={{ padding:'12px 8px' }}>
                              <Checkbox
                                inputId={`activate-${m.id}`}
                                checked={activarChecked}
                                disabled={!isAdmin || (authUser && selectedUser.id === authUser.id)}
                                onChange={e => toggleActivateModule(m, e.checked)}
                              />
                            </td>
                            <td className='permisos-updated' data-label="Fecha actualizada">{moduleUpdatedMap[m.code] ? formatSpanishDate(new Date(moduleUpdatedMap[m.code])) : ''}</td>
                          </tr>
                          {actions.map(a => (
                            <tr key={a.id} className='action-row'>
                              <td className='permisos-subaction' data-label="Acción">{a.uiLabel}</td>
                              <td data-label=""></td>
                              <td data-label="Permitir">
                                <Checkbox
                                  inputId={`act-${a.id}`}
                                  checked={userHasAction(m.code, a.action)}
                                  disabled={!isAdmin || (authUser && selectedUser.id === authUser.id)}
                                  onChange={e => toggleAction(m, a, e.checked)}
                                />
                              </td>
                              <td data-label=""></td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ color:'#666', padding:'2rem 0' }}>Selecciona un usuario en la pestaña Usuarios.</div>
      )}
    </div>
  );

  return (
    <div className="permisos-component" style={{ padding:'1rem 1.5rem' }}>
      <Toast ref={toast} />
      <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
        <TabPanel header="Usuarios">{UsersTab}</TabPanel>
        <TabPanel header="Permisos">{PermsTab}</TabPanel>
      </TabView>

      <Dialog 
        header="Nuevo Usuario" 
        visible={showNew} 
        style={{ width:'30rem' }} 
        onHide={() => setShowNew(false)} 
        modal 
        className="nuevo-usuario-dialog"
        breakpoints={{'960px': '75vw', '641px': '90vw'}}
        draggable={false}
        resizable={false}
      >
        <div className='p-fluid nuevo-usuario-form' style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <span className='p-float-label'>
            <InputText 
              id='nombre' 
              value={form.nombre} 
              onChange={e=> setForm(f=>({...f, nombre:e.target.value}))} 
              autoComplete="off"
            />
            <label htmlFor='nombre'>Nombres *</label>
          </span>
          <span className='p-float-label'>
            <InputText 
              id='email' 
              value={form.email} 
              onChange={e=> setForm(f=>({...f, email:e.target.value}))} 
              type="email"
              autoComplete="email"
            />
            <label htmlFor='email'>Correo *</label>
          </span>
          <span className='p-float-label'>
            <InputText 
              id='area' 
              value={form.area} 
              onChange={e=> setForm(f=>({...f, area:e.target.value}))} 
              autoComplete="organization"
            />
            <label htmlFor='area'>Área</label>
          </span>
          <span className='p-float-label'>
            <InputText 
              id='username' 
              value={form.username} 
              onChange={e=> setForm(f=>({...f, username:e.target.value}))} 
              autoComplete="username"
            />
            <label htmlFor='username'>Usuario *</label>
          </span>
          <span className='p-float-label'>
            <Dropdown 
              id='status' 
              value={form.status} 
              options={ESTADOS} 
              onChange={e=> setForm(f=>({...f, status:e.value}))} 
              optionLabel='label' 
              optionValue='value' 
            />
            <label htmlFor='status'>Estado</label>
          </span>
        </div>
        <div className="dialog-buttons" style={{ display:'flex', justifyContent:'flex-end', marginTop:20, gap:8 }}>
          <Button 
            label='Cancelar' 
            text 
            onClick={()=> setShowNew(false)} 
            className="btn-cancelar"
          />
          <Button 
            label='Guardar' 
            icon='pi pi-check' 
            loading={creating} 
            onClick={createUser} 
            className="btn-guardar"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Permisos;
