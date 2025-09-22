const API_BASE_URL = process.env.REACT_APP_API_URL;

// Auth headers helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

class CotizacionRepository {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/cotizacion`, { headers: getAuthHeaders() });
    if(!res.ok) throw new Error('Error al obtener cotizaciones');
    return await res.json();
  }

  async create(data) {
    const res = await fetch(`${API_BASE_URL}/cotizacion`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
    if(!res.ok) throw new Error(await res.text() || 'Error al crear cotización');
    return await res.json();
  }

  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/cotizacion/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
    if(!res.ok) throw new Error('Error al actualizar cotización');
    return await res.json();
  }

  async getDetalle(id){
    const res = await fetch(`${API_BASE_URL}/cotizacion/${id}/detalle`, { headers: getAuthHeaders() });
    if(!res.ok) throw new Error('Error al obtener detalle de cotización');
    return await res.json();
  }

  async addService(cotizacionId, payload){
    const res = await fetch(`${API_BASE_URL}/cotizacion/${cotizacionId}/servicios`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    if(!res.ok) throw new Error('Error al agregar servicio a cotización');
    return await res.json();
  }

  async addComponentsToService(csId, componentIds){
    const res = await fetch(`${API_BASE_URL}/cotizacion/servicios/${csId}/componentes`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ componentIds }) });
    if(!res.ok) throw new Error('Error al agregar componentes');
    return await res.json();
  }

  async addExtraComponent(csId, payload){
    const res = await fetch(`${API_BASE_URL}/cotizacion/servicios/${csId}/componentes-extra`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    if(!res.ok) throw new Error('Error al agregar componente extra');
    return await res.json();
  }

  async updateService(csId, data){
    const res = await fetch(`${API_BASE_URL}/cotizacion/servicios/${csId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
    if(!res.ok) throw new Error('Error al actualizar servicio');
    return await res.json();
  }

  async updateServiceComponent(cscId, data){
    const res = await fetch(`${API_BASE_URL}/cotizacion/servicios/componentes/${cscId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
    if(!res.ok) throw new Error('Error al actualizar componente del servicio');
    return await res.json();
  }

  async deleteService(csId){
    const res = await fetch(`${API_BASE_URL}/cotizacion/servicios/${csId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if(!res.ok) throw new Error('Error al eliminar servicio');
    return await res.json();
  }

  async deleteServiceComponent(cscId){
    const res = await fetch(`${API_BASE_URL}/cotizacion/servicios/componentes/${cscId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if(!res.ok) throw new Error('Error al eliminar componente');
    return await res.json();
  }
}

export default CotizacionRepository;
