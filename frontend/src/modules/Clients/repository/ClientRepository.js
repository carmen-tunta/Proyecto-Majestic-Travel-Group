const apiUrl = process.env.REACT_APP_API_URL + "/clients";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class ClientRepository {
    async getAllClients() {
        const response = await fetch(`${apiUrl}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getClientById(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async createClient(client) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(client),
        });
        if (!response.ok) throw new Error('Error al crear el cliente');
        return await response.json();
    }

    async updateClient(client) {
        const response = await fetch(`${apiUrl}/${client.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(client),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async deleteClient(id) {
        await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
    }
}

export default ClientRepository;
