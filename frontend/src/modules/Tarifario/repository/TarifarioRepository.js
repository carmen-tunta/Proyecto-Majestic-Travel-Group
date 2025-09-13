const apiUrl = process.env.REACT_APP_API_URL + "/tarifario";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class TarifarioRepository {
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

    async create(template) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(template),
        });
        if (!response.ok) throw new Error('Error al crear el tarifario');
        return await response.json();
    }

    async update(template) {
        const response = await fetch(`${apiUrl}/update/${template.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(template),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async getTarifarioByIdProveedor(proveedorId) {
        const response = await fetch(`${apiUrl}/proveedor/${proveedorId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }
}

export default TarifarioRepository;