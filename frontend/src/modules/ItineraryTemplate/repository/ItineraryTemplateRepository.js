const apiUrl = process.env.REACT_APP_API_URL + "/itinerary-template";

class ItineraryTemplateRepository {
    async getAllTemplates() {
        const response = await fetch(apiUrl);
        return await response.json();
    }

    async getTemplateById(id) {
        const response = await fetch(`${apiUrl}/${id}`);
        return await response.json();
    }

    async createTemplate(template) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(template),
        });
        if (!response.ok) throw new Error('Error al crear la plantilla');
        return await response.json();
    }

    async updateTemplate(template) {
        const response = await fetch(`${apiUrl}/update/${template.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(template),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async deleteTemplate(id) {
        await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
        });
    }
}

export default ItineraryTemplateRepository;