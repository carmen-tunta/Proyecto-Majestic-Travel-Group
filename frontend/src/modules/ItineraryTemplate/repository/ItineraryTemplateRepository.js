const apiUrl = process.env.REACT_APP_API_URL + "/itinerary-template";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class ItineraryTemplateRepository {
    async getAllTemplates(page = 0, limit = 15) {
        // Si se pasa un string (query params), usarlo directamente (compatibilidad)
        if (typeof page === 'string' && page.startsWith('?')) {
            const response = await fetch(`${apiUrl}${page}`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        }

        // Si no, usar page y limit
        const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getTemplateById(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async createTemplate(template) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(template),
        });
        if (!response.ok) throw new Error('Error al crear la plantilla');
        return await response.json();
    }

    async updateTemplate(template) {
        const response = await fetch(`${apiUrl}/update/${template.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(template),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async deleteTemplate(id) {
        await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
    }
}

export default ItineraryTemplateRepository;