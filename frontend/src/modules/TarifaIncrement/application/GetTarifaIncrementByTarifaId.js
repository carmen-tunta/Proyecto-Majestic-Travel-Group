class GetTarifaIncrementByTarifaId {
    constructor(tarifaIncrementRepository) {
        this.tarifaIncrementRepository = tarifaIncrementRepository;
    }

    async execute(tarifaId) {
        return await this.tarifaIncrementRepository.getByTarifaId(tarifaId);
    }
}

export default GetTarifaIncrementByTarifaId;
