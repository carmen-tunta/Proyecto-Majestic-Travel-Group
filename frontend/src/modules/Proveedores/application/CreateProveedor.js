class CreateProveedor {
    constructor(proveedoresRepository) {
        this.proveedoresRepository = proveedoresRepository;
    }

    async execute(data) {
        const proveedor = await this.proveedoresRepository.createProveedor(data);
        return proveedor;
    }
}

export default CreateProveedor;