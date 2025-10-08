const apiUrl = process.env.REACT_APP_API_URL + "/api/translate";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class TranslationRepository {
    async translateText(text, targetLanguage, sourceLanguage) {
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ text, target: targetLanguage, source: sourceLanguage }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al traducir el texto: ${response.status} - ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async detectLanguage(text) {
        const response = await fetch(`${apiUrl}/detect`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error('Error al detectar el idioma');
        return await response.json();
    }
}

export default TranslationRepository;
