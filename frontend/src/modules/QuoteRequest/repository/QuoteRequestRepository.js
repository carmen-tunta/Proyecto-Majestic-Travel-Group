const apiUrl = process.env.REACT_APP_API_URL + "/quote-requests";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class QuoteRequestRepository {
    async createQuoteRequest(payload) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || 'Error al crear la solicitud');
        }
        return await response.json();
    }

    async getAllQuoteRequests(page = 0, limit = 10) {
        const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error('Error al obtener las solicitudes');
        }
        return await response.json();
    }

    async getQuoteRequestById(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error('Error al obtener la solicitud');
        }
        return await response.json();
    }
}

export default QuoteRequestRepository;


