const apiUrl = process.env.REACT_APP_API_URL + "/services";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class ServiceRepository {
    async getAllServices(limit = '') {
        const response = await fetch(`${apiUrl}${limit}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getServiceById(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async createService(service) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(service),
        });
        if (!response.ok) throw new Error('Error al crear el servicio');
        return await response.json();
    }

    async updateService(service) {
        const response = await fetch(`${apiUrl}/update/${service.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(service),
        });
        if (!response.ok) throw new Error('Error updating component');
        return await response.json();
    }

    async deleteService(id) {
        await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
    }

    async searchServices(name) {
        const response = await fetch(`${apiUrl}/search?name=${encodeURIComponent(name)}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async deleteComponentFromService(serviceId, componentId) {
        await fetch(`${apiUrl}/${serviceId}/component/${componentId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
    }

}

export default ServiceRepository;