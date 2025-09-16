class UpdateTarifaIncrement {
    constructor(tarifaIncrementRepository) {
        this.tarifaIncrementRepository = tarifaIncrementRepository;
    }

    async execute(id, data) {
        return await this.tarifaIncrementRepository.update(id, data);
    }
}

export default UpdateTarifaIncrement;
