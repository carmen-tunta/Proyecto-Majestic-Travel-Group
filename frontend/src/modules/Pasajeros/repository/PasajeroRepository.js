const apiUrl = process.env.REACT_APP_API_URL + "/pasajeros";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Función helper para headers de archivos
const getFileHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export default class PasajeroRepository {
  // Métodos básicos CRUD
  async getAllPasajeros() {
    const response = await fetch(`${apiUrl}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener pasajeros');
    return await response.json();
  }

  async getPasajerosByCotizacion(cotizacionId) {
    const response = await fetch(`${apiUrl}/cotizacion/${cotizacionId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener pasajeros de la cotización');
    return await response.json();
  }

  async getPasajeroById(pasajeroId) {
    const response = await fetch(`${apiUrl}/${pasajeroId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener pasajero');
    return await response.json();
  }

  async createPasajero(pasajeroData) {
    const response = await fetch(`${apiUrl}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pasajeroData)
    });
    if (!response.ok) throw new Error('Error al crear pasajero');
    return await response.json();
  }

  async updatePasajero(pasajeroId, pasajeroData) {
    const response = await fetch(`${apiUrl}/${pasajeroId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(pasajeroData)
    });
    if (!response.ok) throw new Error('Error al actualizar pasajero');
    return await response.json();
  }

  async deletePasajero(pasajeroId) {
    const response = await fetch(`${apiUrl}/${pasajeroId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar pasajero');
    return await response.json();
  }

  // Métodos con archivos
  async createPasajeroWithFile(formData) {
    const response = await fetch(`${apiUrl}/with-file`, {
      method: 'POST',
      headers: getFileHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Error al crear pasajero con archivo');
    return await response.json();
  }

  async updatePasajeroWithFile(pasajeroId, formData) {
    const response = await fetch(`${apiUrl}/${pasajeroId}/with-file`, {
      method: 'PATCH',
      headers: getFileHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Error al actualizar pasajero con archivo');
    return await response.json();
  }

  async deletePasajeroWithFile(pasajeroId) {
    const response = await fetch(`${apiUrl}/${pasajeroId}/with-file`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar pasajero con archivo');
    return await response.json();
  }

  // Métodos de utilidad
  async deletePasajerosByCotizacion(cotizacionId) {
    const response = await fetch(`${apiUrl}/cotizacion/${cotizacionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar pasajeros de la cotización');
    return await response.json();
  }
}
