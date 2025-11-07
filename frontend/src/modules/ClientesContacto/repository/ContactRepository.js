const apiUrl = process.env.REACT_APP_API_URL + "/contact-clients";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export default class ContactRepository {
  async getAllContacts() {
    const response = await fetch(`${apiUrl}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener contactos');
    return await response.json();
  }

  async getContactsByClient(clientId) {
    const response = await fetch(`${apiUrl}/client/${clientId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener contactos del cliente');
    return await response.json();
  }

  async getContactById(contactId) {
    const response = await fetch(`${apiUrl}/${contactId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener contacto');
    return await response.json();
  }

  async createContact(contactData) {
    const response = await fetch(`${apiUrl}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(contactData),
    });
    if (!response.ok) throw new Error('Error al crear contacto');
    return await response.json();
  }

  async updateContact(contactId, contactData) {
    const response = await fetch(`${apiUrl}/${contactId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(contactData),
    });
    if (!response.ok) throw new Error('Error al actualizar contacto');
    return await response.json();
  }

  async deleteContact(contactId) {
    const response = await fetch(`${apiUrl}/${contactId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar contacto');
  }
}
