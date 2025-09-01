const API_BASE_URL = process.env.REACT_APP_API_URL;

export const apiService = {
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
