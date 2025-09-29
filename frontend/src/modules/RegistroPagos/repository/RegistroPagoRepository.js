const apiUrl = process.env.REACT_APP_API_URL + "/registro-pago";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class RegistroPagoRepository {
    async getAll(limit = '') {
        const response = await fetch(`${apiUrl}${limit}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getByCotizacionId(id) {
        const response = await fetch(`${apiUrl}/cotizacion/${id}`, {
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
        if (!response.ok) throw new Error('Error al crear el registro de pago');
        return await response.json();
    }

    async update(rp) {
        const response = await fetch(`${apiUrl}/update/${rp.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(rp),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async delete(id) {
        await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
    }
}

export default RegistroPagoRepository;