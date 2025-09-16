class UpdateTarifaIncrement {
    constructor(tarifaIncrementRepository) {
        this.tarifaIncrementRepository = tarifaIncrementRepository;
    }

    async execute(data) {
        return await this.tarifaIncrementRepository.update(data);
    }
}

export default UpdateTarifaIncrement;
