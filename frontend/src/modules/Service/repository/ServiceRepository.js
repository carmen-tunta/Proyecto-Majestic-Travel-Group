const apiUrl = process.env.REACT_APP_API_URL + "/services";

class ServiceRepository {
    async getAllServices() {
        const response = await fetch(apiUrl);
        return await response.json();
    }

    async getServiceById(id) {
        const response = await fetch(`${apiUrl}/${id}`);
        return await response.json();
    }

    async createService(service) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(service),
        });
        if (!response.ok) throw new Error('Error al crear el servicio');
        return await response.json();
    }

    async updateService(service) {
        const response = await fetch(`${apiUrl}/update/${service.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(service),
        });
        if (!response.ok) throw new Error('Error updating component');
        return await response.json();
    }

    async deleteService(id) {
        await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
        });
    }

    async searchServices(name) {
        const response = await fetch(`${apiUrl}/search?name=${encodeURIComponent(name)}`);
        return await response.json();
    }

    async deleteComponentFromService(serviceId, componentId) {
        await fetch(`${apiUrl}/${serviceId}/component/${componentId}`, {
            method: "DELETE",
        });
    }

}

export default ServiceRepository;