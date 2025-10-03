const apiUrl = process.env.REACT_APP_API_URL + "/service-portada";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class ServicePortadaRepository {

    async getPortadaByServiceId(serviceId) {
        const response = await fetch(`${apiUrl}/${serviceId}`, {
            headers: getAuthHeaders()
        });
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Error al obtener portada: ${response.status}`);
        }
        
        // Verificar si hay contenido antes de hacer JSON parse
        const text = await response.text();
        if (!text || text.trim() === '') {
            return null; // Retornar null si no hay contenido
        }
        
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error('Error parsing JSON:', text);
            throw new Error('Respuesta inválida del servidor');
        }
    }

    // Método principal: crear o actualizar portada por serviceId
    async createOrUpdatePortada(serviceId, data, file) {
        const formData = new FormData();
        
        if (file) { formData.append('file', file); }
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${apiUrl}/${serviceId}`, {
            method: "POST",
            headers,
            body: formData
        });
        
        if (!response.ok) throw new Error('Error al crear/actualizar la portada');
        return await response.json();
    }

    //  async createPortada(data, file) {
    //     const formData = new FormData();
    //     if (file) { formData.append('file', file); }
    //     Object.entries(data).forEach(([key, value]) => {
    //         formData.append(key, value);
    //     });
    //     const token = localStorage.getItem('authToken');
    //     const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    //     const response = await fetch(`${apiUrl}`, {
    //         method: "POST",
    //         headers,
    //         body: formData
    //     });
    //     if (!response.ok) throw new Error('Error al subir la imagen');
    //     return await response.json();
    // }

    // async updatePortada(id, data, file) {
    //     const formData = new FormData();
        
    //     // Agregar archivo si existe
    //     if (file) {
    //         formData.append('file', file);
    //     }
        
    //     // Agregar datos de la portada
    //     Object.entries(data).forEach(([key, value]) => {
    //         if (value !== undefined && value !== null) {
    //             formData.append(key, value);
    //         }
    //     });

    //     const token = localStorage.getItem('authToken');
    //     const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    //     const response = await fetch(`${apiUrl}/${id}`, { // Ruta corregida
    //         method: "PUT",
    //         headers,
    //         body: formData
    //     });
        
    //     if (!response.ok) throw new Error('Error al actualizar la portada');
    //     return await response.json();
    // }

}

export default ServicePortadaRepository;