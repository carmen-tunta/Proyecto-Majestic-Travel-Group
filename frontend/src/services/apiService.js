const API_BASE_URL = process.env.REACT_APP_API_URL;

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  // Usar sessionStorage para sesiones independientes por pestaña.
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const apiService = {
  // Obtener proveedores por componente y pax
  async getProveedoresByComponentAndPax(componentId, pax) {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/component/${componentId}/pax/${pax}`,
      {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Error al obtener proveedores');
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al obtener proveedores');
    }
  },
  // Buscar servicios por nombre o ciudad
  async searchServices(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/search?name=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al buscar servicios');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al buscar servicios');
    }
  },

  // getServices movido al módulo Service (Repository + UseCase)

  // Buscar componentes por nombre, tipo o descripción
  async searchComponents(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/components/search?name=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al buscar componentes');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al buscar componentes');
    }
  },

  // Buscar plantillas de itinerario por nombre
  async searchItineraryTemplates(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/itinerary-template/search?name=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al buscar plantillas');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al buscar plantillas');
    }
  },

  // Buscar clientes por nombre
  async searchClients(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/search?nombre=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al buscar clientes');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al buscar clientes');
    }
  },

  // Buscador único para los recursos
  async universalSearch(resource, query) {
    switch (resource) {
      case 'services':
        return this.searchServices(query);
      case 'components':
        return this.searchComponents(query);
      case 'itinerary-templates':
        return this.searchItineraryTemplates(query);
      case 'clients':
        return this.searchClients(query);
      default:
        throw new Error('Recurso no soportado');
    }
  },
  // Login real con el backend
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      return {
        success: true,
        user: data.user,
        token: data.access_token,
        message: 'Login exitoso',
      };
    } catch (error) {
      throw new Error(error.message || 'Error en la autenticación');
    }
  },

  // Crear usuario (registro público)
  async createUser(username, password, email) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        throw new Error('Error al crear usuario');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al crear usuario');
    }
  },

  // Obtener usuarios (requiere autenticación)
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuarios');
    }
  },

  async createClient(clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData)
      });
      if (!response.ok) {
        throw new Error('Error al crear cliente');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al crear cliente');
    }
  },

  async getClient(clientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al obtener cliente');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al obtener cliente');
    }
  },

  async updateClient(clientId, clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData)
      });
      if (!response.ok) {
        throw new Error('Error al actualizar cliente');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar cliente');
    }
  },

  // USUARIOS / PERMISOS
  async createUserAdmin(payload) { // { username, email, nombre, area, status? }
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Error al crear usuario');
      return await response.json(); // { user, rawPassword? }
    } catch (e) { throw new Error(e.message || 'Error al crear usuario'); }
  },
  async updateUserStatus(userId, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      return await res.json();
    } catch (e) { throw new Error(e.message || 'Error actualizando estado'); }
  },
  async resetUserPassword(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al resetear contraseña');
      return await res.json(); // { userId, newPassword }
    } catch (e) { throw new Error(e.message || 'Error reset password'); }
  },
  async listPermissionModules() {
    try {
      const res = await fetch(`${API_BASE_URL}/permissions/modules`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener módulos');
      return await res.json();
    } catch (e) { throw new Error(e.message || 'Error módulos'); }
  },
  async getUserPermissions(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/permissions/user/${userId}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener permisos');
      return await res.json();
    } catch (e) { throw new Error(e.message || 'Error permisos usuario'); }
  },
  async grantUserPermissions(userId, actionIds) {
    try {
      const res = await fetch(`${API_BASE_URL}/permissions/user/${userId}/grant`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ actionIds })
      });
      if (!res.ok) throw new Error('Error al asignar permisos');
      return await res.json();
    } catch (e) { throw new Error(e.message || 'Error asignar permisos'); }
  },
  async revokeUserPermissions(userId, actionIds) {
    try {
      const res = await fetch(`${API_BASE_URL}/permissions/user/${userId}/revoke`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ actionIds })
      });
      if (!res.ok) throw new Error('Error al revocar permisos');
      return await res.json();
    } catch (e) { throw new Error(e.message || 'Error revocar permisos'); }
  },

  // Permisos del usuario actual (para menú dinámico)
  async getMyPermissions(includeEmpty = true) {
    try {
      const res = await fetch(`${API_BASE_URL}/permissions/me?includeEmpty=${includeEmpty}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener mis permisos');
      return await res.json(); // { modules: [ { module, actions: [] } ] }
    } catch (e) { throw new Error(e.message || 'Error mis permisos'); }
  },

  hasView(modulesPerms, moduleCode) {
    if (!modulesPerms) return false;
    return modulesPerms.some(m => m.module === moduleCode && m.actions.includes('VIEW'));
  },

  // Cotizaciones
  async getCotizaciones() {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al obtener cotizaciones');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al obtener cotizaciones');
    }
  },

  async createCotizacion(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Error al crear cotización');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al crear cotización');
    }
  },

  async updateCotizacion(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar cotización');
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar cotización');
    }
  },

  async getCotizacionDetalle(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/${id}/detalle`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Error al obtener detalle de cotización');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al obtener detalle de cotización'); }
  },

  async addServiceToCotizacion(id, { serviceId, precio }) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/${id}/servicios`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ serviceId, precio })
      });
      if (!response.ok) throw new Error('Error al agregar servicio a cotización');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al agregar servicio'); }
  },

  async addComponentsToCotizacionService(csId, componentIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/servicios/${csId}/componentes`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ componentIds })
      });
      if (!response.ok) throw new Error('Error al agregar componentes');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al agregar componentes'); }
  },

  async addExtraComponentToCotizacionService(csId, { nombre, precio }) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/servicios/${csId}/componentes-extra`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ nombre, precio })
      });
      if (!response.ok) throw new Error('Error al agregar componente extra');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al agregar componente extra'); }
  },

  async updateCotizacionService(csId, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/servicios/${csId}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar servicio');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al actualizar servicio'); }
  },

  async updateCotizacionServiceComponent(cscId, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/servicios/componentes/${cscId}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar componente del servicio');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al actualizar componente del servicio'); }
  },

  async assignProviderToComponent(cscId, proveedorId, precioTotal) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/servicios/componentes/${cscId}/proveedor`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ proveedorId, precioTotal })
      });
      if (!response.ok) throw new Error('Error al asignar proveedor');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al asignar proveedor'); }
  },

  async deleteCotizacionService(csId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/servicios/${csId}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Error al eliminar servicio');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al eliminar servicio'); }
  },

  async deleteCotizacionServiceComponent(cscId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizacion/servicios/componentes/${cscId}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Error al eliminar componente');
      return await response.json();
    } catch (error) { throw new Error(error.message || 'Error al eliminar componente'); }
  },

};
