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
    async getAllServices({ page = 0, limit = 10 } = {}) {
        const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders()
        });
        return await response.json(); // { data, total, page, limit }
    }

    // Para páginas públicas como PlanYourTrip
    async getPublicServices(limit = 6) {
        const response = await fetch(`${apiUrl}?page=0&limit=${limit}`, {
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

    async addComponentsToService(serviceId, componentIds) {
        const response = await fetch(`${apiUrl}/${serviceId}/component`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ componentIds })
        });
        if (!response.ok) throw new Error('Error al agregar componentes al servicio');
        return await response.json();
    }

}

export default ServiceRepository;