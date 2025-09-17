class DeleteTarifaIncrement {
    constructor(tarifaIncrementRepository) {
        this.tarifaIncrementRepository = tarifaIncrementRepository;
    }

    async execute(id) {
        return await this.tarifaIncrementRepository.delete(id);
    }
}

export default DeleteTarifaIncrement;
