class CreateTarifaIncrement {
    constructor(tarifaIncrementRepository) {
        this.tarifaIncrementRepository = tarifaIncrementRepository;
    }

    async execute(data) {
        return await this.tarifaIncrementRepository.create(data);
    }
}

export default CreateTarifaIncrement;