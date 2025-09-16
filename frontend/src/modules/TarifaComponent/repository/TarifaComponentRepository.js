const apiUrl = process.env.REACT_APP_API_URL + "/tarifa-component";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class TarifaComponentRepository {
    async getAll(limit = '') {
        const response = await fetch(`${apiUrl}${limit}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getById(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async create(tarifaComponent) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(tarifaComponent),
        });
        if (!response.ok) throw new Error('Error al conectar el componente con la tarifa');
        return await response.json();
    }

    async update(tarifaComponent) {
        const response = await fetch(`${apiUrl}/update/${tarifaComponent.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(tarifaComponent),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async getTarifaComponentByIdTarifa(tarifaId) {
        const response = await fetch(`${apiUrl}/tarifa/${tarifaId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async delete(tarifaId, componenteId) {
        const response = await fetch(`${apiUrl}/tarifa/${tarifaId}/component/${componenteId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        console.log('Response from delete:', response);
        if (!response.ok) throw new Error('Error al eliminar el componente de la tarifa');
        return await response.json();
    }
}

export default TarifaComponentRepository;