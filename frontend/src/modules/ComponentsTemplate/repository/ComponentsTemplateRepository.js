import { ComponentsTemplate } from '../domain/ComponentsTemplate.js';

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export class ComponentsTemplateRepository {
  constructor() {
    this.baseUrl = `${process.env.REACT_APP_API_URL}/components`;
  }

  // Obtener todos los componentes con paginación
  async getAll(page = 0, limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return {
        data: data.data.map(component => ComponentsTemplate.fromJSON(component)),
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error al obtener componentes:', error);
      throw error;
    }
  }

  // Obtener un componente por ID
  async getById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return ComponentsTemplate.fromJSON(data);
    } catch (error) {
      console.error('Error al obtener componente:', error);
      throw error;
    }
  }

  // Crear un nuevo componente
  async create(componentData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(componentData)
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return ComponentsTemplate.fromJSON(data);
    } catch (error) {
      console.error('Error al crear componente:', error);
      throw error;
    }
  }

  // Actualizar un componente
  async update(id, componentData) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(componentData)
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return ComponentsTemplate.fromJSON(data);
    } catch (error) {
      console.error('Error al actualizar componente:', error);
      throw error;
    }
  }

  // Eliminar un componente (soft delete)
  async delete(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error al eliminar componente:', error);
      throw error;
    }
  }

  // Eliminar permanentemente un componente
  async deletePermanent(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/permanent`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error al eliminar permanentemente componente:', error);
      throw error;
    }
  }
}
