const apiUrl = process.env.REACT_APP_API_URL + "/tarifa-column";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class TarifaColumnRepository {
    async getAll(limit = '') {
        const response = await fetch(`${apiUrl}${limit}`, {
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

    async getTarifaColumnByIdTarifa(tarifaId) {
        const response = await fetch(`${apiUrl}/tarifa/${tarifaId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async delete(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar la columna');
        return await response.json();
    }

    async update(column) {
        const response = await fetch(`${apiUrl}/update/${column.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(column)
        });
        if (!response.ok) throw new Error('Error al actualizar la columna');
        return await response.json();
    }

}

export default TarifaColumnRepository;