class UpdateTarifario {
    constructor(tarifarioRepository) {
        this.tarifarioRepository = tarifarioRepository;
    }

    async execute(id, data) {
        return await this.tarifarioRepository.update(id, data);
    }
}

export default UpdateTarifario;
