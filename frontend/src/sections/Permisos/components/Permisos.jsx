import { useEffect, useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { apiService } from '../../../services/apiService';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Checkbox } from 'primereact/checkbox';
import { useRef } from 'react';
import '../../Proveedores/styles/Proveedores.css';
import { useAuth } from '../../../modules/auth/context/AuthContext';

const ESTADOS = [
  { label: 'Activo', value: 'activo' },
  { label: 'Suspendido', value: 'suspendido' }
];

const Permisos = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [modules, setModules] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerms, setUserPerms] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [showNewUser, setShowNewUser] = useState(false);
  const [formUser, setFormUser] = useState({ nombre:'', email:'', area:'', username:'', status:'activo' });
  const [creatingUser, setCreatingUser] = useState(false);
  const { user: authUser } = useAuth();
  const toast = useRef();

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (e) {
      toast.current?.show({ severity:'error', summary:'Error', detail:e.message });
    } finally { setLoadingUsers(false); }
  };

  const loadModules = async () => {
    try { setModules(await apiService.listPermissionModules()); } catch (e) { /* ignore */ }
  };

  const loadUserPerms = async (user) => {
    if (!user) return;
    setLoadingPerms(true);
    try { 
      const perms = await apiService.getUserPermissions(user.id); 
      setUserPerms(perms); 
    } catch (e) { 
      toast.current?.show({ severity:'error', summary:'Error', detail:e.message }); 
    }
    finally { setLoadingPerms(false); }
  };

  useEffect(() => { loadUsers(); loadModules(); }, []);
  useEffect(() => { loadUserPerms(selectedUser); }, [selectedUser]);

  const openNewUser = () => { setFormUser({ nombre:'', email:'', area:'', username:'', status:'activo' }); setShowNewUser(true); };

  const handleCreateUser = async () => {
    setCreatingUser(true);
    try {
      const payload = { username: formUser.username, email: formUser.email, nombre: formUser.nombre, area: formUser.area, status: formUser.status };
      const { user, rawPassword } = await apiService.createUserAdmin(payload);
      toast.current?.show({ severity:'success', summary:'Usuario creado', detail: rawPassword ? `Contraseña: ${rawPassword}` : 'Creado' });
      setShowNewUser(false); loadUsers();
    } catch (e) { toast.current?.show({ severity:'error', summary:'Error', detail:e.message }); }
    finally { setCreatingUser(false); }
  };

  const toggleAction = async (actionObj, checked) => {
    if (!selectedUser) return;
    if (authUser && selectedUser.id === authUser.id) {
      toast.current?.show({ severity:'warn', summary:'Acción no permitida', detail:'No puedes modificar tus propios permisos.' });
      return;
    }
    try {
      if (checked) {
        await apiService.grantUserPermissions(selectedUser.id, [actionObj.id]);
      } else {
        await apiService.revokeUserPermissions(selectedUser.id, [actionObj.id]);
      }
      loadUserPerms(selectedUser);
    } catch (e) {
      toast.current?.show({ severity:'error', summary:'Error', detail:e.message });
    }
  };

  const userHasAction = (moduleCode, actionCode) => {
    return userPerms.some(p => p.action.module.code === moduleCode && p.action.action === actionCode);
  };

  const assignAllToUser = async () => {
    if (!selectedUser) return;
    if (authUser && selectedUser.id === authUser.id) {
      toast.current?.show({ severity:'warn', summary:'No permitido', detail:'No puedes auto-asignarte masivamente.' });
      return;
    }
    const confirmMsg = window.confirm('¿Asignar TODAS las acciones de TODOS los módulos a este usuario?');
    if (!confirmMsg) return;
    try {
      const allActionIds = modules.flatMap(m => m.actions.map(a => a.id));
      await apiService.grantUserPermissions(selectedUser.id, allActionIds);
      await loadUserPerms(selectedUser);
      toast.current?.show({ severity:'success', summary:'Permisos asignados', detail:'Se asignaron todas las acciones.' });
    } catch (e) {
      toast.current?.show({ severity:'error', summary:'Error', detail:e.message });
    }
  };

  const UsersTab = (
    <div className="proveedores">
      <div className='proveedores-header'>
        <h2>Usuarios</h2>
        <Button icon="pi pi-plus" label="Nuevo" size='small' outlined onClick={openNewUser} />
      </div>
      <div className="card">
        <DataTable 
          value={users} 
          className="proveedores-table" 
          size='small' 
          loading={loadingUsers} 
          emptyMessage="No hay usuarios"
          onRowClick={(e) => { setSelectedUser(e.data); setActiveIndex(1); }}
          rowClassName={() => ({ 'row-clickable': true })}
          style={{ cursor:'pointer' }}
        >
          <Column field="nombre" header="Nombres" style={{ width:'15%' }} />
          <Column field="email" header="Correo" style={{ width:'18%' }} />
          <Column field="area" header="Area" style={{ width:'15%' }} />
          <Column field="username" header="Usuario" style={{ width:'12%' }} />
          <Column header="Fecha registrada" style={{ width:'18%' }} body={row => {
            if (!row.createdAt) return '';
            const date = new Date(row.createdAt);
            let formatted = date.toLocaleDateString('es-ES', {
              weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
            });
            formatted = formatted.replace(/,/g, '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return formatted;
          }} />
          <Column header="Estado" body={row => row.status === 'activo' ? 'Activo' : 'Suspendido'} style={{ width:'12%' }} />
        </DataTable>
      </div>
    </div>
  );

  const PermsTab = (
    <div className="proveedores">
      {selectedUser ? (
        <>
          <div className='proveedores-header'>
            <h2>Permisos</h2>
            <div style={{ display:'flex', gap:8 }}>
              <Button text icon="pi pi-arrow-left" label="Usuarios" size='small' onClick={() => { setActiveIndex(0); setSelectedUser(null); }} />
              <Button text icon="pi pi-refresh" size='small' onClick={() => loadUserPerms(selectedUser)} />
              <Button text icon="pi pi-check-square" size='small' label="Asignar todos" onClick={assignAllToUser} disabled={!modules.length} />
            </div>
          </div>
          <div style={{ marginBottom: '0.5rem', fontWeight:600 }}>{selectedUser.nombre || selectedUser.username}</div>
          <div className='card' style={{ padding:0 }}>
            {loadingPerms ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><ProgressSpinner style={{ width:40, height:40 }} /></div>
            ) : (
              <div style={{ maxHeight:'62vh', overflowY:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                  <thead style={{ position:'sticky', top:0, background:'#fff', zIndex:2 }}>
                    <tr style={{ textAlign:'left' }}>
                      <th style={{ padding:'12px 16px', width:'26%' }}>Módulo</th>
                      <th style={{ padding:'12px 8px', width:'12%' }}>Ocultar</th>
                      <th style={{ padding:'12px 8px', width:'12%' }}>Activar</th>
                      <th style={{ padding:'12px 8px', width:'18%' }}>Fecha actualizada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(m => {
                      const actions = m.actions;
                      const viewAction = actions.find(a => a.action === 'VIEW');
                      const hasAny = actions.some(a => userHasAction(m.code, a.action));
                      const allActive = actions.every(a => userHasAction(m.code, a.action));
                      const isHidden = !hasAny; // oculto cuando no tiene ninguna acción
                      const actionIds = actions.map(a => a.id);
                      return (
                        <>
                          <tr key={`mod-${m.id}`} style={{ borderTop:'1px solid #eee' }}>
                            <td style={{ padding:'12px 16px', fontWeight:600 }}>{m.name}</td>
                            <td style={{ padding:'12px 8px' }}>
                              {viewAction && (
                                <Checkbox 
                                  inputId={`hide-${m.id}`}
                                  checked={isHidden}
                                  disabled={authUser && selectedUser.id === authUser.id}
                                  onChange={async (e) => {
                                    if (!actions.length) return;
                                    if (authUser && selectedUser.id === authUser.id) {
                                      toast.current?.show({ severity:'warn', summary:'No permitido', detail:'No puedes ocultar tu propio módulo.' });
                                      return;
                                    }
                                    try {
                                      if (e.checked) {
                                        // Ocultar => revocar TODAS las acciones del módulo
                                        await apiService.revokeUserPermissions(selectedUser.id, actionIds);
                                      } else {
                                        // Mostrar => asignar TODAS las acciones (estado base full access)
                                        await apiService.grantUserPermissions(selectedUser.id, actionIds);
                                      }
                                      loadUserPerms(selectedUser);
                                    } catch (err) { toast.current?.show({ severity:'error', summary:'Error', detail: err.message }); }
                                  }}
                                />
                              )}
                            </td>
                            <td style={{ padding:'12px 8px' }}>
                              <Checkbox 
                                inputId={`activate-${m.id}`}
                                checked={allActive && !isHidden}
                                disabled={authUser && selectedUser.id === authUser.id}
                                onChange={async (e) => {
                                  if (authUser && selectedUser.id === authUser.id) {
                                    toast.current?.show({ severity:'warn', summary:'No permitido', detail:'No puedes modificar tu propio módulo.' });
                                    return;
                                  }
                                  try {
                                    if (e.checked) {
                                      // activar todos los que falten
                                      const missing = actionIds.filter(id => !userPerms.some(p => p.action.id === id));
                                      if (missing.length) await apiService.grantUserPermissions(selectedUser.id, missing);
                                    } else {
                                      // desactivar = revocar todas (equivalente a ocultar)
                                      await apiService.revokeUserPermissions(selectedUser.id, actionIds);
                                    }
                                    loadUserPerms(selectedUser);
                                  } catch (err) { toast.current?.show({ severity:'error', summary:'Error', detail: err.message }); }
                                }}
                              />
                            </td>
                            <td style={{ padding:'12px 8px', color:'#555' }}>{/* Fecha dummy por ahora: se podría guardar por acción */}{formatModuleDate()}</td>
                          </tr>
                          {actions.map(a => (
                            <tr key={a.id} style={{ background:'#fafafa' }}>
                              <td style={{ padding:'8px 32px' }}>{a.label}</td>
                              <td style={{ padding:'8px 8px' }}></td>
                              <td style={{ padding:'8px 8px' }}>
                                <Checkbox 
                                  inputId={`act-${a.id}`} 
                                  checked={userHasAction(m.code, a.action)} 
                                  disabled={authUser && selectedUser.id === authUser.id}
                                  onChange={e => toggleAction(a, e.checked)} 
                                />
                              </td>
                              <td></td>
                            </tr>
                          ))}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ color:'#666' }}>Selecciona un usuario en la pestaña Usuarios.</div>
      )}
    </div>
  );

  function formatModuleDate() {
    const date = new Date();
    let formatted = date.toLocaleDateString('es-ES', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
    return formatted.replace(/,/g,'').split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  }

  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      <Toast ref={toast} />
      <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
        <TabPanel header="Usuarios">{UsersTab}</TabPanel>
        <TabPanel header="Permisos">{PermsTab}</TabPanel>
      </TabView>

      <Dialog header="Nuevo Usuario" visible={showNewUser} style={{ width: '30rem' }} onHide={() => setShowNewUser(false)} modal>
        <div className='p-fluid' style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <span className="p-float-label">
            <InputText id='nombre' value={formUser.nombre} onChange={e => setFormUser(f => ({ ...f, nombre: e.target.value }))} />
            <label htmlFor='nombre'>Nombres</label>
          </span>
          <span className="p-float-label">
            <InputText id='email' value={formUser.email} onChange={e => setFormUser(f => ({ ...f, email: e.target.value }))} />
            <label htmlFor='email'>Correo</label>
          </span>
          <span className="p-float-label">
            <InputText id='area' value={formUser.area} onChange={e => setFormUser(f => ({ ...f, area: e.target.value }))} />
            <label htmlFor='area'>Área</label>
          </span>
          <span className="p-float-label">
            <InputText id='username' value={formUser.username} onChange={e => setFormUser(f => ({ ...f, username: e.target.value }))} />
            <label htmlFor='username'>Usuario</label>
          </span>
          <span className="p-float-label">
            <Dropdown id='status' value={formUser.status} options={ESTADOS} onChange={e => setFormUser(f => ({ ...f, status: e.value }))} optionLabel='label' optionValue='value' />
            <label htmlFor='status'>Estado</label>
          </span>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:24, gap:8 }}>
          <Button label='Cancelar' text onClick={() => setShowNewUser(false)} />
          <Button label='Guardar' icon='pi pi-check' loading={creatingUser} onClick={handleCreateUser} />
        </div>
      </Dialog>
    </div>
  );
};

export default Permisos;
