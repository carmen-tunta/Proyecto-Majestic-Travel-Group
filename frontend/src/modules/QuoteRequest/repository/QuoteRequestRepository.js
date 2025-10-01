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

        async assignToAgent(id) {
            const response = await fetch(`${apiUrl}/${id}/assign`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Error al asignar solicitud');
            }
            return await response.json();
        }

        async releaseRequest(id, agentId) {
            const response = await fetch(`${apiUrl}/${id}/release`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ agentId })
            });
            if (!response.ok) {
                throw new Error('Error al liberar solicitud');
            }
            return await response.json();
        }

        async takeRequest(id, agentId) {
            const response = await fetch(`${apiUrl}/${id}/take`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ agentId })
            });
            if (!response.ok) {
                throw new Error('Error al tomar solicitud');
            }
            return await response.json();
        }

        async markAsQuoting(id, agentId) {
            const response = await fetch(`${apiUrl}/${id}/cotizando`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ agentId })
            });
            if (!response.ok) {
                throw new Error('Error al marcar como cotizando');
            }
            return await response.json();
        }

        async markAsNoResponse(id, agentId) {
            const response = await fetch(`${apiUrl}/${id}/sin-respuesta`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ agentId })
            });
            if (!response.ok) {
                throw new Error('Error al marcar como sin respuesta');
            }
            return await response.json();
        }

        async markAsAttending(id) {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: 'en_progreso' })
            });
            if (!response.ok) {
                throw new Error('Error al marcar como atendiendo');
            }
            return await response.json();
        }

        async getAgentsAssignmentStatus() {
            const response = await fetch(`${apiUrl}/agents/assignment-status`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Error al obtener estado de agentes');
            }
            return await response.json();
        }
    }

    export default QuoteRequestRepository;


