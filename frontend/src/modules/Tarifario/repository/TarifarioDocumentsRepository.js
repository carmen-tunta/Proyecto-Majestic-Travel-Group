const apiUrl = process.env.REACT_APP_API_URL + "/tarifario-documents";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class TarifarioDocumentsRepository {
    async save(data, file) {
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
        if (!response.ok) throw new Error('Error al subir el documento');
        return await response.json();
    }

    async deleteDocument(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar el documento del servicio');
        return await response.json();
    }

    async getDocument(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getDocumentByTarifarioId(tarifarioId) {
        const response = await fetch(`${apiUrl}/tarifario/${tarifarioId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async update(data, file) {
        const formData = new FormData();
        if(file) formData.append('file', file);
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${apiUrl}/update/${data.id}`, {
            method: "PUT",
            headers,
            body: formData
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

}

export default TarifarioDocumentsRepository;