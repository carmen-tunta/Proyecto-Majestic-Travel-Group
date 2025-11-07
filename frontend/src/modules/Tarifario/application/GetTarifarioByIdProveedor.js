class getTarifarioByIdProveedor {
    constructor(tarifarioRepository) {
        this.tarifarioRepository = tarifarioRepository;
    }

    async execute(proveedorId) {
        return await this.tarifarioRepository.getTarifarioByIdProveedor(proveedorId);
    }
}

export default getTarifarioByIdProveedor;
