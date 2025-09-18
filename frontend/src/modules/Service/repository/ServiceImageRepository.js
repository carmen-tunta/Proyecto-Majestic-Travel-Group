const apiUrl = process.env.REACT_APP_API_URL + "/service-images";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class ServiceImageRepository {
    async uploadImage(data, file) {
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${apiUrl}`, {
            method: "POST",
            headers,
            body: formData
        });
        if (!response.ok) throw new Error('Error al subir la imagen');
        return await response.json();
    }

    async deleteImage(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar la imagen del servicio');
        return await response.json();
    }

    async getImage(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getImagesByServiceId(serviceId) {
        const response = await fetch(`${apiUrl}/service/${serviceId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

}

export default ServiceImageRepository;