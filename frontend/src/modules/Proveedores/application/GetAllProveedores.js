class GetAllProveedores {
    constructor(proveedoresRepository) {
        this.proveedoresRepository = proveedoresRepository;
    }

    async execute() {
        return await this.proveedoresRepository.getAllProveedores();
    }
}

export default GetAllProveedores;