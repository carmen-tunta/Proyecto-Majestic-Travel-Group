// Servicio de autenticación que centraliza la lógica de login/logout
export const authService = {
  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtener el usuario actual
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  // Obtener el token actual
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Limpiar datos de autenticación
  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Verificar si el token es válido (básico)
  isTokenValid: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      // Decodificar el JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  }
};
