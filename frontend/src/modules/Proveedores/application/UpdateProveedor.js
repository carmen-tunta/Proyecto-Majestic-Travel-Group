class UpdateProveedor {
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }   

    async execute(id, data) {
        const updatedProveedor = await this.proveedorRepository.updateProveedor(id, data);
        return updatedProveedor;
    }
}

export default UpdateProveedor;