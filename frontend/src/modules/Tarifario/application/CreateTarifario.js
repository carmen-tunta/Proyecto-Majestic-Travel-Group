class CreateTarifario {
    constructor(tarifarioRepository) {
        this.tarifarioRepository = tarifarioRepository;
    }

    async execute(data) {
        return await this.tarifarioRepository.create(data);
    }
}
export default CreateTarifario;