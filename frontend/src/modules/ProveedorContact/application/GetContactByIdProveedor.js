class getContactByIdProveedor {
    constructor(proveedorContactRepository) {
        this.proveedorContactRepository = proveedorContactRepository;
    }

    async execute(proveedorId) {
        return await this.proveedorContactRepository.getContactByIdProveedor(proveedorId);
    }
}

export default getContactByIdProveedor;