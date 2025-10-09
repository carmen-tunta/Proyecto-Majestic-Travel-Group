const apiUrl = process.env.REACT_APP_API_URL + "/datos-viaje";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class DatosViajeRepository {
    async getDatosViajeByCotizacionId(id) {
        const response = await fetch(`${apiUrl}/cotizacion/${id}`, {
            headers: getAuthHeaders()
        });
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return null;
        }
        const text = await response.text();
        if (!text) {
            return null;
        }
        
        return JSON.parse(text);
    }

    async createDatosViaje(datosViaje) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(datosViaje),
        });
        if (!response.ok) throw new Error('Error al crear los datos de viaje');
        return await response.json();
    }

    async updateDatosViaje(cId, datosViaje) {
        const response = await fetch(`${apiUrl}/update/${cId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(datosViaje),
        });
        if (!response.ok) throw new Error('Error actualizando datos de viaje');
        return await response.json();
    }

}

export default DatosViajeRepository;