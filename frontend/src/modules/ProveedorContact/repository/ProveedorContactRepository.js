const apiUrl = process.env.REACT_APP_API_URL + "/proveedores/contact";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

class ProveedorContactRepository {

    async createContact(contact) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(contact),
        });
        if (!response.ok) throw new Error('Error al crear el contacto');
        return await response.json();
    }

    async getContactById(id) {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async getContactByIdProveedor(proveedorId) {
        const response = await fetch(`${apiUrl}/proveedor/${proveedorId}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    }

    async updateContact(contact) {
        const response = await fetch(`${apiUrl}/update/${contact.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(contact),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return await response.json();
    }

    async deleteContact(id) {
        await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
    }

}

export default ProveedorContactRepository;