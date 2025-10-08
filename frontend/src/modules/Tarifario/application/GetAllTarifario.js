class GetAllTarifario {
    constructor(tarifarioRepository) {
        this.tarifarioRepository = tarifarioRepository;
    }   

    async execute() {
        return await this.tarifarioRepository.getAllTarifario();
    }
}

export default GetAllTarifario;