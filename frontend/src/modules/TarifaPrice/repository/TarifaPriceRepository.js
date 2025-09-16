const apiUrl = process.env.REACT_APP_API_URL + "/tarifa-prices";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class TarifaPriceRepository {
    async getAll(limit = '') {
        const response = await fetch(`${apiUrl}${limit}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async create(price) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(price),
        });
        if (!response.ok) throw new Error('Error al agregar el precio');
        return await response.json();
    }

    async getByComponentColumnId(componenteId, columnaId) {
        const response = await fetch(`${apiUrl}/component/${componenteId}/column/${columnaId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getByTarifaId(tarifaId) {
        const response = await fetch(`${apiUrl}/tarifa/${tarifaId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async update(id, price) {
        const response = await fetch(`${apiUrl}/update/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(price),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async delete(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar el precio');
        return await response.json();
    }
}

export default TarifaPriceRepository;