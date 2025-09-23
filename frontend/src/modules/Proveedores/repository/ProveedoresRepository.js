const apiUrl = process.env.REACT_APP_API_URL + "/proveedores";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class ProveedoresRepository {
    async getAllProveedores(limit = '') {
        const response = await fetch(`${apiUrl}${limit}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async createProveedor(proveedor) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(proveedor),
        });
        if (!response.ok) throw new Error('Error al crear el proveedor');
        return await response.json();
    }

    async getProveedorById(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async updateProveedor(proveedor) {
        const response = await fetch(`${apiUrl}/update/${proveedor.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(proveedor),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async getProveedoresByIdComponentAndPax(componentId, pax) {
        const response = await fetch(`${apiUrl}/component/${componentId}/pax/${pax}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

}

export default ProveedoresRepository;