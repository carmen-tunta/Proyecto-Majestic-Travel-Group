const apiUrl = process.env.REACT_APP_API_URL + "/quote-requests";

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
}

export default QuoteRequestRepository;


