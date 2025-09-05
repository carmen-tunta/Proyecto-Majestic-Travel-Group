const API_BASE_URL = process.env.REACT_APP_API_URL;

export const apiService = {
  // Buscar servicios por nombre o ciudad
  async searchServices(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/search?name=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Error al buscar servicios');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al buscar servicios');
    }
  },

  // Buscar componentes por nombre, tipo o descripción
  async searchComponents(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/components/search?name=${encodeURIComponent(query)}`);
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
      const response = await fetch(`${API_BASE_URL}/itinerary-template/search?name=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Error al buscar plantillas');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al buscar plantillas');
    }
  },

  // Buscador único para los tres recursos
  async universalSearch(resource, query) {
    switch(resource) {
      case 'services':
        return this.searchServices(query);
      case 'components':
        return this.searchComponents(query);
      case 'itinerary-templates':
        return this.searchItineraryTemplates(query);
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

  // Crear usuario (para pruebas)
  async createUser(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Error al crear usuario');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al crear usuario');
    }
  },

  // Obtener usuarios (para pruebas)
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuarios');
    }
  },
};
