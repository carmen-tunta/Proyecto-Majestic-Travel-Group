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

    async update(tc) {
        const response = await fetch(`${apiUrl}/update/${tc.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(tc),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async getTarifaColumnByIdTarifa(tarifaId) {
        const response = await fetch(`${apiUrl}/tarifa/${tarifaId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async deleteByDescription(tarifaId, description, paxMin, paxMax) {
        const response = await fetch(`${apiUrl}/delete-column/${tarifaId}/${description}/${paxMin}/${paxMax}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar la columna');
        return await response.json();
    }

    async updateByDescription(tarifa_id, oldDescription, oldPaxMin, oldPaxMax, newDescription, newPaxMin, newPaxMax) {
        const response = await fetch(`${apiUrl}/update-by-description`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                tarifa_id,
                oldDescription,
                oldPaxMin,
                oldPaxMax,
                newDescription,
                newPaxMin,
                newPaxMax
            })
        });
        if (!response.ok) throw new Error('Error al actualizar la columna');
        return await response.json();
    }

}

export default TarifaColumnRepository;